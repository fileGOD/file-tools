/**
 * Add page numbers to every page of a PDF (centered at bottom).
 * Runs entirely in the browser — no server upload.
 *
 * @param file - PDF file to number
 * @param onProgress - Optional progress callback
 * @returns PDF file with page numbers
 *
 * @example
 * const numbered = await addPageNumbers(myPdf);
 */
export async function addPageNumbers(
  file: File,
  onProgress: (progress: number, statusText: string) => void = () => {}
): Promise<File> {
  const { PDFDocument, rgb, StandardFonts } = await import("pdf-lib");
  onProgress(10, "Loading PDF...");

  const arrayBuffer = await file.arrayBuffer();
  const pdf = await PDFDocument.load(arrayBuffer);
  const pages = pdf.getPages();
  const font = await pdf.embedFont(StandardFonts.Helvetica);

  onProgress(30, "Adding page numbers...");
  for (let i = 0; i < pages.length; i++) {
    const page = pages[i];
    const { width } = page.getSize();
    const pageNum = `${i + 1}`;
    const textWidth = font.widthOfTextAtSize(pageNum, 11);
    page.drawText(pageNum, { x: (width - textWidth) / 2, y: 25, size: 11, font, color: rgb(0.35, 0.35, 0.35) });
    onProgress(30 + Math.round((i / pages.length) * 60), `Numbering page ${i + 1} of ${pages.length}...`);
  }

  onProgress(95, "Saving...");
  const pdfBytes = await pdf.save();
  const blob = new Blob([pdfBytes], { type: "application/pdf" });
  const baseName = file.name.replace(/\.pdf$/i, "");
  onProgress(100, "Done");
  return new File([blob], `${baseName}-numbered.pdf`, { type: "application/pdf" });
}
