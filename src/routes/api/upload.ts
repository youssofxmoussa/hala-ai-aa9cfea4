// Accept a user file → forward to a temporary upstream host (litterbox, 1h
// retention) → return a URL on OUR domain that proxies the bytes through
// /api/public/files/<b64>/<filename>. The external HalaGPT API then sees only our
// own domain in its `link` field.
import { createFileRoute } from "@tanstack/react-router";

const MAX_SIZE = 50 * 1024 * 1024;
const PUBLIC_FILE_ORIGIN = "https://project--db9209e8-bb91-4727-a07b-1ed2b683bf35-dev.lovable.app";

function b64urlEncode(s: string): string {
  return btoa(s).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

export const Route = createFileRoute("/api/upload")({
  server: {
    handlers: {
      POST: async ({ request }: { request: Request }) => {
        try {
          const form = await request.formData();
          const file = form.get("file");
          if (!(file instanceof File)) return json({ error: "No file" }, 400);
          if (file.size > MAX_SIZE) return json({ error: "File too large (max 50MB)" }, 413);

          const out = new FormData();
          out.append("reqtype", "fileupload");
          out.append("time", "1h");
          out.append("fileToUpload", file, file.name || "file");

          const upRes = await fetch(
            "https://litterbox.catbox.moe/resources/internals/api.php",
            { method: "POST", body: out },
          );
          const upstream = (await upRes.text()).trim();
          if (!upRes.ok || !upstream.startsWith("http")) {
            return json({ error: `Upload service error: ${upstream.slice(0, 200)}` }, 502);
          }

          const safeName = (file.name || "file").replace(/[^a-zA-Z0-9._-]/g, "_").slice(0, 80);
          const token = b64urlEncode(upstream);
          const requestOrigin = new URL(request.url).origin;
          const publicOrigin = /localhost|127\.0\.0\.1|lovableproject\.com|id-preview--/.test(requestOrigin)
            ? PUBLIC_FILE_ORIGIN
            : requestOrigin;
          const proxyUrl = `${publicOrigin}/api/public/files/${token}/${encodeURIComponent(safeName)}`;

          return json({
            url: proxyUrl,
            name: file.name || "file",
            mime: file.type || "application/octet-stream",
            size: file.size,
          });
        } catch (err) {
          const message = err instanceof Error ? err.message : "Upload failed";
          return json({ error: message }, 500);
        }
      },
    },
  },
});

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}
