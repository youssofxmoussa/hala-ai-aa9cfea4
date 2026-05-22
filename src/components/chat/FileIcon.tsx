// Pretty colored file-type badge. ChatGPT-style: colored rounded square with the
// extension label (e.g. PY / JS / PDF), tinted to match common conventions.

type Spec = { bg: string; fg: string; label: string };

const MAP: Record<string, Spec> = {
  // Code
  py: { bg: "#306998", fg: "#FFD43B", label: "PY" },
  js: { bg: "#F7DF1E", fg: "#000", label: "JS" },
  mjs: { bg: "#F7DF1E", fg: "#000", label: "JS" },
  cjs: { bg: "#F7DF1E", fg: "#000", label: "JS" },
  ts: { bg: "#3178C6", fg: "#FFF", label: "TS" },
  tsx: { bg: "#3178C6", fg: "#FFF", label: "TSX" },
  jsx: { bg: "#61DAFB", fg: "#000", label: "JSX" },
  html: { bg: "#E34F26", fg: "#FFF", label: "HTML" },
  css: { bg: "#1572B6", fg: "#FFF", label: "CSS" },
  scss: { bg: "#CC6699", fg: "#FFF", label: "SCSS" },
  json: { bg: "#000", fg: "#FFF", label: "JSON" },
  xml: { bg: "#0060AC", fg: "#FFF", label: "XML" },
  yml: { bg: "#CB171E", fg: "#FFF", label: "YML" },
  yaml: { bg: "#CB171E", fg: "#FFF", label: "YML" },
  md: { bg: "#1a1a1a", fg: "#FFF", label: "MD" },
  sh: { bg: "#4EAA25", fg: "#FFF", label: "SH" },
  bash: { bg: "#4EAA25", fg: "#FFF", label: "BASH" },
  go: { bg: "#00ADD8", fg: "#FFF", label: "GO" },
  rs: { bg: "#DEA584", fg: "#000", label: "RS" },
  java: { bg: "#B07219", fg: "#FFF", label: "JAVA" },
  kt: { bg: "#A97BFF", fg: "#FFF", label: "KT" },
  swift: { bg: "#FA7343", fg: "#FFF", label: "SWIFT" },
  c: { bg: "#555555", fg: "#FFF", label: "C" },
  cpp: { bg: "#00599C", fg: "#FFF", label: "C++" },
  cs: { bg: "#239120", fg: "#FFF", label: "C#" },
  php: { bg: "#777BB4", fg: "#FFF", label: "PHP" },
  rb: { bg: "#CC342D", fg: "#FFF", label: "RB" },
  lua: { bg: "#000080", fg: "#FFF", label: "LUA" },
  sql: { bg: "#E48E00", fg: "#FFF", label: "SQL" },
  r: { bg: "#276DC3", fg: "#FFF", label: "R" },
  dart: { bg: "#00B4AB", fg: "#FFF", label: "DART" },
  // Docs
  pdf: { bg: "#FA0F00", fg: "#FFF", label: "PDF" },
  doc: { bg: "#2B579A", fg: "#FFF", label: "DOC" },
  docx: { bg: "#2B579A", fg: "#FFF", label: "DOC" },
  xls: { bg: "#217346", fg: "#FFF", label: "XLS" },
  xlsx: { bg: "#217346", fg: "#FFF", label: "XLS" },
  csv: { bg: "#217346", fg: "#FFF", label: "CSV" },
  ppt: { bg: "#D24726", fg: "#FFF", label: "PPT" },
  pptx: { bg: "#D24726", fg: "#FFF", label: "PPT" },
  txt: { bg: "#6B7280", fg: "#FFF", label: "TXT" },
  rtf: { bg: "#6B7280", fg: "#FFF", label: "RTF" },
  // Media
  mp3: { bg: "#7C3AED", fg: "#FFF", label: "MP3" },
  wav: { bg: "#7C3AED", fg: "#FFF", label: "WAV" },
  m4a: { bg: "#7C3AED", fg: "#FFF", label: "M4A" },
  ogg: { bg: "#7C3AED", fg: "#FFF", label: "OGG" },
  flac: { bg: "#7C3AED", fg: "#FFF", label: "FLAC" },
  mp4: { bg: "#EC4899", fg: "#FFF", label: "MP4" },
  mov: { bg: "#EC4899", fg: "#FFF", label: "MOV" },
  webm: { bg: "#EC4899", fg: "#FFF", label: "WEBM" },
  mkv: { bg: "#EC4899", fg: "#FFF", label: "MKV" },
  avi: { bg: "#EC4899", fg: "#FFF", label: "AVI" },
  // Archives
  zip: { bg: "#EAB308", fg: "#000", label: "ZIP" },
  rar: { bg: "#EAB308", fg: "#000", label: "RAR" },
  "7z": { bg: "#EAB308", fg: "#000", label: "7Z" },
  tar: { bg: "#EAB308", fg: "#000", label: "TAR" },
  gz: { bg: "#EAB308", fg: "#000", label: "GZ" },
  // Images
  png: { bg: "#06B6D4", fg: "#FFF", label: "PNG" },
  jpg: { bg: "#06B6D4", fg: "#FFF", label: "JPG" },
  jpeg: { bg: "#06B6D4", fg: "#FFF", label: "JPG" },
  webp: { bg: "#06B6D4", fg: "#FFF", label: "WEBP" },
  gif: { bg: "#06B6D4", fg: "#FFF", label: "GIF" },
  svg: { bg: "#FFB13B", fg: "#000", label: "SVG" },
  heic: { bg: "#06B6D4", fg: "#FFF", label: "HEIC" },
  // Fonts
  ttf: { bg: "#1f2937", fg: "#FFF", label: "TTF" },
  otf: { bg: "#1f2937", fg: "#FFF", label: "OTF" },
  woff: { bg: "#1f2937", fg: "#FFF", label: "WOFF" },
  woff2: { bg: "#1f2937", fg: "#FFF", label: "WOFF" },
};

export function getFileSpec(name: string, mime?: string): Spec {
  const ext = (name.split(".").pop() ?? "").toLowerCase();
  if (MAP[ext]) return MAP[ext];
  if (mime?.startsWith("image/")) return { bg: "#06B6D4", fg: "#FFF", label: "IMG" };
  if (mime?.startsWith("video/")) return { bg: "#EC4899", fg: "#FFF", label: "VIDEO" };
  if (mime?.startsWith("audio/")) return { bg: "#7C3AED", fg: "#FFF", label: "AUDIO" };
  if (mime === "application/pdf") return MAP.pdf;
  return { bg: "#1f2937", fg: "#FFF", label: ext.slice(0, 4).toUpperCase() || "FILE" };
}

export function formatBytes(n?: number): string {
  if (!n || n < 0) return "";
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`;
  if (n < 1024 * 1024 * 1024) return `${(n / 1024 / 1024).toFixed(1)} MB`;
  return `${(n / 1024 / 1024 / 1024).toFixed(2)} GB`;
}

export function FileBadge({ name, mime, size }: { name: string; mime?: string; size?: number }) {
  const spec = getFileSpec(name, mime);
  return (
    <div className="flex items-center gap-3 rounded-2xl border border-border bg-background px-3 py-2.5 shadow-sm">
      <div
        className="grid h-11 w-11 shrink-0 place-items-center rounded-xl text-[10px] font-bold tracking-tight"
        style={{ background: spec.bg, color: spec.fg }}
      >
        {spec.label}
      </div>
      <div className="min-w-0 flex-1">
        <div className="truncate text-[13px] font-medium text-foreground">{name}</div>
        <div className="text-[11px] text-muted-foreground">{formatBytes(size)}</div>
      </div>
    </div>
  );
}
