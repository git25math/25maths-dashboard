/**
 * Convert plain text to HTML paragraphs if not already HTML.
 * Detects HTML by checking for common tags.
 */
export function ensureHtml(content: string): string {
  if (!content) return '';
  // Already HTML — return as-is
  if (/<[a-z][\s\S]*>/i.test(content)) return content;
  // Plain text → wrap each line (or double-newline block) as <p>
  return content
    .split(/\n{2,}/)
    .map(block => `<p>${block.replace(/\n/g, '<br>')}</p>`)
    .join('');
}

/**
 * Strip HTML tags and return plain text.
 * Used before sending content to Gemini for summarization.
 */
export function stripHtml(html: string): string {
  if (!html) return '';
  const doc = new DOMParser().parseFromString(html, 'text/html');
  return doc.body.textContent || '';
}
