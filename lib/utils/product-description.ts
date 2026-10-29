const ALLOWED_TAGS = new Set([
  "p", "br", "strong", "b", "em", "i", "u", "s", "strike",
  "ul", "ol", "li", "h2", "h3", "h4", "blockquote", "a", "hr",
]);

/**
 * Converts stored descriptions to editor-ready HTML. Legacy plain text remains
 * readable and line breaks are retained when the description is edited.
 */
export function descriptionToEditorHtml(value: string | null | undefined): string {
  const input = value ?? "";
  if (!input.trim()) return "";

  if (/<[a-z][\s\S]*>/i.test(input)) {
    return sanitizeProductDescription(input);
  }

  return input
    .split(/\r?\n/)
    .map((line) => line.trim())
    .map((line) => line ? `<p>${escapeHtml(line)}</p>` : "<p><br></p>")
    .join("");
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

/**
 * Strict allow-list sanitizer for the limited formatting supported by the
 * product description editor. It removes executable/embed content and all
 * attributes except safe HTTP(S)/mailto link destinations.
 */
export function sanitizeProductDescription(value: string | null | undefined): string {
  let html = value ?? "";
  if (!html.trim()) return "";

  // Remove dangerous elements and their contents before stripping attributes.
  html = html.replace(/<(script|style|iframe|object|embed|svg|math|template)[^>]*>[\s\S]*?<\/\1\s*>/gi, "");
  html = html.replace(/<(script|style|iframe|object|embed|svg|math|template)\b[^>]*\/?>/gi, "");

  html = html.replace(/<([a-z][a-z0-9-]*)\b([^>]*)>/gi, (whole, rawTag: string, rawAttrs: string) => {
    const tag = rawTag.toLowerCase();
    if (!ALLOWED_TAGS.has(tag)) return "";
    if (tag !== "a") return `<${tag}>`;

    const hrefMatch = rawAttrs.match(/\bhref\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+))/i);
    const href = (hrefMatch?.[1] ?? hrefMatch?.[2] ?? hrefMatch?.[3] ?? "").trim();
    if (!href) return "<a>";
    try {
      const url = new URL(href, "https://vaishnavicollections.vercel.app");
      if (!["http:", "https:", "mailto:"].includes(url.protocol)) return "<a>";
      return `<a href="${escapeHtml(href)}" rel="nofollow noopener noreferrer" target="_blank">`;
    } catch {
      return "<a>";
    }
  });

  // Preserve closing tags only for allowed elements.
  html = html.replace(/<\/([a-z][a-z0-9-]*)\s*>/gi, (whole, rawTag: string) => {
    const tag = rawTag.toLowerCase();
    return ALLOWED_TAGS.has(tag) && !["br", "hr"].includes(tag) ? `</${tag}>` : "";
  });

  // Remove leftover attributes from malformed markup and inline event handlers.
  html = html.replace(/\s+on[a-z]+\s*=\s*("[^"]*"|'[^']*'|[^\s>]+)/gi, "");
  return html;
}

export function productDescriptionToText(value: string | null | undefined): string {
  const safeHtml = sanitizeProductDescription(value);
  return safeHtml
    .replace(/<br\s*\/?\s*>/gi, " ")
    .replace(/<\/p\s*>|<\/li\s*>|<\/h[2-4]\s*>|<\/blockquote\s*>/gi, " ")
    .replace(/<[^>]+>/g, "")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .replace(/\s+/g, " ")
    .trim();
}
