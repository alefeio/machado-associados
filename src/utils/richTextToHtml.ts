export function richTextToHtml(richTextJson: any): string {
  if (!richTextJson) return '';
  if (typeof richTextJson === 'string') return richTextJson; // já é HTML
  if (typeof richTextJson.html === 'string') return richTextJson.html; // estrutura { html: ... }
  return '';
}