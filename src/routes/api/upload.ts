import { createFileRoute } from "@tanstack/react-router";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

const MAX_SIZE = 50 * 1024 * 1024;
const BUCKET = "chat-uploads";
const RETENTION_MS = 2 * 60 * 60 * 1000;

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

          await ensureUploadBucket();
          void cleanupOldUploads();
          const safeName = (file.name || "file").replace(/[^a-zA-Z0-9._-]/g, "_").slice(0, 80);
          const path = `tmp/${Date.now()}-${crypto.randomUUID()}-${safeName || "file"}`;
          const bytes = new Uint8Array(await file.arrayBuffer());
          const { error } = await supabaseAdmin.storage.from(BUCKET).upload(path, bytes, {
            contentType: file.type || "application/octet-stream",
            upsert: false,
          });
          if (error) return json({ error: `Upload failed: ${error.message}` }, 502);

          const { data: pub } = supabaseAdmin.storage.from(BUCKET).getPublicUrl(path);

          return json({
            url: pub.publicUrl,
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
