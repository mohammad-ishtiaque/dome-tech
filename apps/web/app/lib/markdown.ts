// Minimal, safe Markdown → HTML for dashboard-written text. All raw HTML is escaped.
// Supports: ## / ### headings, paragraphs, - and 1. lists, > quotes, **bold**, *italic*, [links](…), ![images](…).
const esc = (s: string) => s.replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]!);
const safeUrl = (u: string) => (/^(https?:\/\/|mailto:|tel:|#|\/(?!\/)|\?)/i.test(u) ? u : "#");

function inline(text: string) {
  return esc(text)
    .replace(/!\[([^\]]*)\]\(([^)\s]+)\)/g, (_, alt, url) => `<img src="${safeUrl(url)}" alt="${alt}" loading="lazy">`)
    .replace(/\[([^\]]+)\]\(([^)\s]+)\)/g, (_, label, url) => {
      const href = safeUrl(url);
      return `<a href="${href}"${/^https?:/i.test(href) ? ' target="_blank" rel="noopener"' : ""}>${label}</a>`;
    })
    .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>")
    .replace(/(^|[^*])\*([^*\s][^*]*)\*/g, "$1<em>$2</em>");
}

export function markdown(src?: string) {
  return String(src ?? "").replace(/\r\n/g, "\n").trim().split(/\n{2,}/).filter(Boolean).map((block) => {
    const lines = block.split("\n");
    if (/^###\s+/.test(block)) return `<h3>${inline(block.replace(/^###\s+/, ""))}</h3>`;
    if (/^##?\s+/.test(block)) return `<h2>${inline(block.replace(/^##?\s+/, ""))}</h2>`;
    if (lines.every((l) => /^\s*[-*]\s+/.test(l))) return `<ul>${lines.map((l) => `<li>${inline(l.replace(/^\s*[-*]\s+/, ""))}</li>`).join("")}</ul>`;
    if (lines.every((l) => /^\s*\d+[.)]\s+/.test(l))) return `<ol>${lines.map((l) => `<li>${inline(l.replace(/^\s*\d+[.)]\s+/, ""))}</li>`).join("")}</ol>`;
    if (lines.every((l) => /^>\s?/.test(l))) return `<blockquote><p>${inline(lines.map((l) => l.replace(/^>\s?/, "")).join(" "))}</p></blockquote>`;
    return `<p>${inline(lines.join(" "))}</p>`;
  }).join("\n");
}
