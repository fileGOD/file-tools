/**
 * Delete specific pages from a PDF.
 * Runs entirely in the browser — no server upload.
 *
 * @param file - PDF file to edit
 * @param pages - Comma-separated page numbers/ranges to delete, e.g. "1,3,5-8"
 * @param onProgress - Optional progress callback
 * @returns PDF file with pages removed
 *
 * @example
 * const edited = await deletePdfPages(myPdf, "2,5-7");
 */
export async function deletePdfPages(
  file: File,
  pages: string,
  onProgress: (progress: number, statusText: string) => void = () => {}
): Promise<File> {
  const { PDFDocument } = await import("pdf-lib");
  onProgress(10, "Loading PDF...");

  const bytes = await file.arrayBuffer();
  const doc = await PDFDocument.load(bytes);
  const totalPages = doc.getPageCount();

  const pageSet = new Set<number>();
  for (const part of pages.split(",")) {
    const trimmed = part.trim();
    if (trimmed.includes("-")) {
      const [start, end] = trimmed.split("-").map(Number);
      for (let i = start; i <= end && i <= totalPages; i++) {
        if (i >= 1) pageSet.add(i - 1);
      }
    } else {
      const n = Number(trimmed);
      if (n >= 1 && n <= totalPages) pageSet.add(n - 1);
    }
  }

  if (pageSet.size === 0) throw new Error("No valid pages specified to delete");
  if (pageSet.size >= totalPages) throw new Error("Cannot delete all pages from the PDF");

  onProgress(40, "Removing pages...");
  const sorted = Array.from(pageSet).sort((a, b) => b - a);
  for (const idx of sorted) doc.removePage(idx);

  onProgress(70, "Saving PDF...");
  const newBytes = await doc.save();
  const blob = new Blob([newBytes], { type: "application/pdf" });
  const baseName = file.name.replace(/\.[^.]+$/, "");
  onProgress(100, `Deleted ${pageSet.size} page${pageSet.size > 1 ? "s" : ""}`);
  return new File([blob], `${baseName}-edited.pdf`, { type: "application/pdf" });
}
