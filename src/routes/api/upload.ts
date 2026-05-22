// Server route that accepts any file and uploads it to a temporary file host
// (litterbox.catbox.moe, 1-hour expiry — files auto-delete). Returns a public
// URL the external HalaGPT vision/OCR API can fetch. This avoids exposing the
// litterbox call to the browser (no CORS issues, no third-party domain in DOM
// during upload) — the client only sees our /api/upload endpoint.

import { createFileRoute } from "@tanstack/react-router";

const MAX_SIZE = 50 * 1024 * 1024; // 50MB cap

export const Route = createFileRoute("/api/upload")({
  server: {
    handlers: {
      POST: async ({ request }: { request: Request }) => {
        try {
          const form = await request.formData();
          const file = form.get("file");
          if (!(file instanceof File)) {
            return json({ error: "No file" }, 400);
          }
          if (file.size > MAX_SIZE) {
            return json({ error: "File too large (max 50MB)" }, 413);
          }

          // Forward to litterbox (1h temporary file host)
          const out = new FormData();
          out.append("reqtype", "fileupload");
          out.append("time", "1h");
          out.append("fileToUpload", file, file.name || "file");

          const res = await fetch(
            "https://litterbox.catbox.moe/resources/internals/api.php",
            { method: "POST", body: out },
          );
          const text = (await res.text()).trim();
          if (!res.ok || !text.startsWith("http")) {
            return json({ error: `Upload service error: ${text.slice(0, 200)}` }, 502);
          }
          return json({
            url: text,
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
