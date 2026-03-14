/**
 * Rotate all pages in a PDF by a given angle.
 * Runs entirely in the browser — no server upload.
 *
 * @param file - PDF file to rotate
 * @param rotation - Rotation angle in degrees: 90, 180, or 270 (default: 90)
 * @param onProgress - Optional progress callback
 * @returns Rotated PDF file
 *
 * @example
 * const rotated = await rotatePdf(myPdf, 180);
 */
export async function rotatePdf(
  file: File,
  rotation = 90,
  onProgress: (progress: number, statusText: string) => void = () => {}
): Promise<File> {
  const { PDFDocument, degrees } = await import("pdf-lib");
  onProgress(10, "Loading PDF...");

  const arrayBuffer = await file.arrayBuffer();
  const pdf = await PDFDocument.load(arrayBuffer);
  const pages = pdf.getPages();

  for (let i = 0; i < pages.length; i++) {
    const page = pages[i];
    const currentRotation = page.getRotation().angle;
    page.setRotation(degrees(currentRotation + rotation));
    onProgress(30 + Math.round((i / pages.length) * 50), `Rotating page ${i + 1} of ${pages.length}...`);
  }

  onProgress(85, "Saving...");
  const pdfBytes = await pdf.save();
  const blob = new Blob([pdfBytes], { type: "application/pdf" });
  const baseName = file.name.replace(/\.pdf$/i, "");
  onProgress(100, "Done");
  return new File([blob], `${baseName}-rotated.pdf`, { type: "application/pdf" });
}
