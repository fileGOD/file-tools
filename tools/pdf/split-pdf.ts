/**
 * Split a PDF into individual single-page PDF files.
 * Runs entirely in the browser — no server upload.
 *
 * @param file - PDF file to split
 * @param onProgress - Optional progress callback
 * @returns Array of single-page PDF files
 *
 * @example
 * const pages = await splitPdf(myPdf);
 * pages.forEach((page, i) => console.log(`Page ${i + 1}: ${page.name}`));
 */
export async function splitPdf(
  file: File,
  onProgress: (progress: number, statusText: string) => void = () => {}
): Promise<File[]> {
  const { PDFDocument } = await import("pdf-lib");
  const bytes = await file.arrayBuffer();
  const srcDoc = await PDFDocument.load(bytes);
  const pageCount = srcDoc.getPageCount();
  const results: File[] = [];

  for (let i = 0; i < pageCount; i++) {
    onProgress(Math.round(((i + 1) / pageCount) * 100), `Extracting page ${i + 1} of ${pageCount}...`);
    const newDoc = await PDFDocument.create();
    const [page] = await newDoc.copyPages(srcDoc, [i]);
    newDoc.addPage(page);
    const newBytes = await newDoc.save();
    const blob = new Blob([newBytes], { type: "application/pdf" });
    results.push(new File([blob], `page-${i + 1}.pdf`, { type: "application/pdf" }));
  }

  return results;
}
