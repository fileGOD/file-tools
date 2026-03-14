/**
 * Convert one or more images (JPEG, PNG, WebP) into a single PDF.
 * Each image becomes one page, sized to match the image dimensions.
 * Runs entirely in the browser — no server upload.
 *
 * @param files - Image files to convert
 * @param onProgress - Optional progress callback
 * @returns PDF file containing all images
 *
 * @example
 * const pdf = await jpgToPdf([photo1, photo2]);
 */
export async function jpgToPdf(
  files: File[],
  onProgress: (progress: number, statusText: string) => void = () => {}
): Promise<File> {
  const { PDFDocument } = await import("pdf-lib");
  const doc = await PDFDocument.create();

  for (let i = 0; i < files.length; i++) {
    onProgress(Math.round(((i + 0.5) / files.length) * 100), `Adding image ${i + 1} of ${files.length}...`);
    const bytes = await files[i].arrayBuffer();
    let image;
    if (files[i].type === "image/png") {
      image = await doc.embedPng(bytes);
    } else if (files[i].type === "image/webp") {
      const bitmap = await createImageBitmap(new Blob([bytes]));
      const canvas = new OffscreenCanvas(bitmap.width, bitmap.height);
      const ctx = canvas.getContext("2d")!;
      ctx.drawImage(bitmap, 0, 0);
      const jpgBlob = await canvas.convertToBlob({ type: "image/jpeg", quality: 0.95 });
      image = await doc.embedJpg(await jpgBlob.arrayBuffer());
    } else {
      image = await doc.embedJpg(bytes);
    }
    const page = doc.addPage([image.width, image.height]);
    page.drawImage(image, { x: 0, y: 0, width: image.width, height: image.height });
  }

  onProgress(100, "Finalizing...");
  const pdfBytes = await doc.save();
  const blob = new Blob([pdfBytes], { type: "application/pdf" });
  return new File([blob], "images.pdf", { type: "application/pdf" });
}
