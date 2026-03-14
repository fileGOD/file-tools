/**
 * Add a diagonal text watermark to every page of a PDF.
 * Runs entirely in the browser — no server upload.
 *
 * @param file - PDF file to watermark
 * @param text - Watermark text (default: "WATERMARK")
 * @param opacity - Watermark opacity 0-1 (default: 0.3)
 * @param onProgress - Optional progress callback
 * @returns Watermarked PDF file
 *
 * @example
 * const watermarked = await watermarkPdf(myPdf, "CONFIDENTIAL", 0.2);
 */
export async function watermarkPdf(
  file: File,
  text = "WATERMARK",
  opacity = 0.3,
  onProgress: (progress: number, statusText: string) => void = () => {}
): Promise<File> {
  const { PDFDocument, StandardFonts, rgb, degrees } = await import("pdf-lib");
  onProgress(10, "Loading PDF...");

  const bytes = await file.arrayBuffer();
  const doc = await PDFDocument.load(bytes);
  const font = await doc.embedFont(StandardFonts.HelveticaBold);
  const pages = doc.getPages();

  for (let i = 0; i < pages.length; i++) {
    onProgress(20 + Math.round((i / pages.length) * 60), `Watermarking page ${i + 1} of ${pages.length}...`);
    const page = pages[i];
    const { width, height } = page.getSize();
    const fontSize = Math.min(width, height) / 8;
    page.drawText(text, {
      x: width / 2 - (font.widthOfTextAtSize(text, fontSize) / 2),
      y: height / 2,
      size: fontSize,
      font,
      color: rgb(0.5, 0.5, 0.5),
      opacity,
      rotate: degrees(-45),
    });
  }

  onProgress(85, "Saving PDF...");
  const newBytes = await doc.save();
  const blob = new Blob([newBytes], { type: "application/pdf" });
  const baseName = file.name.replace(/\.[^.]+$/, "");
  onProgress(100, "Done");
  return new File([blob], `${baseName}-watermarked.pdf`, { type: "application/pdf" });
}
