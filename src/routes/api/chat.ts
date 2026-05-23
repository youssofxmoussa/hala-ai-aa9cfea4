import { createFileRoute } from "@tanstack/react-router";
import "@tanstack/react-start";
import { getDocument } from "pdfjs-dist/legacy/build/pdf.mjs";
import { halaChat, type HalaMsg } from "@/lib/halagpt.server";

type IncomingMsg = {
  role: "user" | "assistant" | "system";
  content: string;
  links?: string[];
};
type ChatBody = { messages: IncomingMsg[]; deepThink?: boolean };

async function appendPdfText(content: string, links?: string[]) {
  const pdfLinks = (links ?? []).filter((link) => /\.pdf(?:$|[?#])/i.test(link)).slice(0, 3);
  if (pdfLinks.length === 0) return content;
  const chunks: string[] = [];
  for (const link of pdfLinks) {
    try {
      const res = await fetch(link);
      if (!res.ok) continue;
      const bytes = new Uint8Array(await res.arrayBuffer());
      const pdf = await getDocument({ data: bytes }).promise;
      const pages: string[] = [];
      for (let pageNo = 1; pageNo <= Math.min(pdf.numPages, 20); pageNo++) {
        const page = await pdf.getPage(pageNo);
        const text = await page.getTextContent();
        pages.push(text.items.map((item) => ("str" in item ? item.str : "")).join(" "));
      }
      const extracted = pages.join("\n").trim();
      if (extracted.length > 30) chunks.push(`[Extracted PDF text from ${link}]\n${extracted.slice(0, 20000)}`);
    } catch (err) {
      console.error("PDF extraction failed", err);
    }
  }
  return chunks.length ? `${content}\n\n${chunks.join("\n\n")}` : content;
}

export const Route = createFileRoute("/api/chat")({
  server: {
    handlers: {
      POST: async ({ request }: { request: Request }) => {
        try {
          const body = (await request.json()) as ChatBody;
          if (!Array.isArray(body.messages) || body.messages.length === 0) {
            return new Response(JSON.stringify({ error: "messages required" }), {
              status: 400,
              headers: { "Content-Type": "application/json" },
            });
          }
          const msgs: HalaMsg[] = await Promise.all(
            body.messages.map(async (m) => ({
              role: m.role,
              content: await appendPdfText(m.content, m.links),
              links: m.links,
            })),
          );
          const content = await halaChat(msgs, { deepThink: !!body.deepThink });
          return new Response(JSON.stringify({ content }), {
            headers: { "Content-Type": "application/json" },
          });
        } catch (err) {
          const message = err instanceof Error ? err.message : "Unknown error";
          return new Response(JSON.stringify({ error: message }), {
            status: 500,
            headers: { "Content-Type": "application/json" },
          });
        }
      },
    },
  },
});
