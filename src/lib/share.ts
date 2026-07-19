/**
 * Render a DOM node to a PNG and trigger a download. html2canvas is imported
 * lazily so it stays out of the initial bundle.
 */
export async function downloadNodeAsImage(node: HTMLElement, fileName: string) {
  const { default: html2canvas } = await import('html2canvas');
  const bg = getComputedStyle(document.body).backgroundColor;
  const canvas = await html2canvas(node, { backgroundColor: bg, scale: 2 });
  const link = document.createElement('a');
  link.download = fileName;
  link.href = canvas.toDataURL('image/png');
  link.click();
}
