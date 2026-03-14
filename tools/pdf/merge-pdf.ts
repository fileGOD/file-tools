/**
 * Merge multiple PDF files into a single document.
 * Runs entirely in the browser — no server upload.
 *
 * @param files - Array of PDF files to merge (order preserved)
 * @param onProgress - Optional progress callback
 * @returns Single merged PDF file
 *
 * @example
 * const merged = await mergePdf([file1, file2, file3]);
 * const url = URL.createObjectURL(merged);
 */
export async function mergePdf(
  files: File[],
  onProgress: (progress: number, statusText: string) => void = () => {}
): Promise<File> {
  const { PDFDocument } = await import("pdf-lib");
  const mergedDoc = await PDFDocument.create();

  for (let i = 0; i < files.length; i++) {
    onProgress(Math.round(((i + 0.5) / files.length) * 100), `Merging file ${i + 1} of ${files.length}...`);
    const bytes = await files[i].arrayBuffer();
    const srcDoc = await PDFDocument.load(bytes);
    const pages = await mergedDoc.copyPages(srcDoc, srcDoc.getPageIndices());
    pages.forEach((page) => mergedDoc.addPage(page));
  }

  onProgress(100, "Finalizing...");
  const mergedBytes = await mergedDoc.save();
  const blob = new Blob([mergedBytes], { type: "application/pdf" });
  return new File([blob], "merged.pdf", { type: "application/pdf" });
}
