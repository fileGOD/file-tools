/**
 * Convert each page of a PDF to a JPEG image.
 * Uses pdf.js for rendering. Runs in the browser.
 *
 * @param file - PDF file to convert
 * @param scale - Render scale factor (default: 2 for high quality)
 * @param quality - JPEG quality 0-1 (default: 0.92)
 * @param onProgress - Optional progress callback
 * @returns Array of JPEG image files (one per page)
 *
 * @example
 * const images = await pdfToJpg(myPdf);
 * images.forEach(img => console.log(img.name, img.size));
 */
export async function pdfToJpg(
  file: File,
  scale = 2,
  quality = 0.92,
  onProgress: (progress: number, statusText: string) => void = () => {}
): Promise<File[]> {
  onProgress(5, "Loading PDF renderer...");
  const pdfjsLib = await import("pdfjs-dist");
  pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.mjs`;

  const arrayBuffer = await file.arrayBuffer();
  onProgress(10, "Loading PDF...");
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
  const totalPages = pdf.numPages;
  const results: File[] = [];

  for (let i = 1; i <= totalPages; i++) {
    onProgress(10 + Math.round((i / totalPages) * 85), `Rendering page ${i} of ${totalPages}...`);
    const page = await pdf.getPage(i);
    const viewport = page.getViewport({ scale });
    const canvas = new OffscreenCanvas(viewport.width, viewport.height);
    const ctx = canvas.getContext("2d") as OffscreenCanvasRenderingContext2D;
    ctx.fillStyle = "#FFFFFF";
    ctx.fillRect(0, 0, viewport.width, viewport.height);
    await page.render({ canvasContext: ctx as any, viewport, canvas: canvas as any }).promise;
    const blob = await canvas.convertToBlob({ type: "image/jpeg", quality });
    const pageNum = String(i).padStart(String(totalPages).length, "0");
    const baseName = file.name.replace(/\.pdf$/i, "");
    results.push(new File([blob], `${baseName}-page-${pageNum}.jpg`, { type: "image/jpeg" }));
  }

  onProgress(100, `Converted ${totalPages} page${totalPages > 1 ? "s" : ""}`);
  return results;
}
