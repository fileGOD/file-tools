/**
 * Flatten all form fields in a PDF, making them non-editable.
 * Runs entirely in the browser — no server upload.
 *
 * @param file - PDF file with form fields to flatten
 * @param onProgress - Optional progress callback
 * @returns Flattened PDF file
 *
 * @example
 * const flat = await flattenPdf(formPdf);
 */
export async function flattenPdf(
  file: File,
  onProgress: (progress: number, statusText: string) => void = () => {}
): Promise<File> {
  const { PDFDocument } = await import("pdf-lib");
  onProgress(20, "Loading PDF...");

  const bytes = await file.arrayBuffer();
  const doc = await PDFDocument.load(bytes);

  onProgress(50, "Flattening form fields...");
  const form = doc.getForm();
  form.flatten();

  onProgress(80, "Saving PDF...");
  const newBytes = await doc.save();
  const blob = new Blob([newBytes], { type: "application/pdf" });
  const baseName = file.name.replace(/\.[^.]+$/, "");
  onProgress(100, "Done");
  return new File([blob], `${baseName}-flattened.pdf`, { type: "application/pdf" });
}
