/**
 * Compress multiple files into a ZIP archive.
 * Uses JSZip with DEFLATE compression. Runs in the browser.
 *
 * @param files - Files to compress into a ZIP
 * @param onProgress - Optional progress callback
 * @returns ZIP archive file
 *
 * @example
 * const archive = await zipFiles([file1, file2, file3]);
 */
export async function zipFiles(
  files: File[],
  onProgress: (progress: number, statusText: string) => void = () => {}
): Promise<File> {
  const JSZip = (await import("jszip")).default;
  const zip = new JSZip();

  for (let i = 0; i < files.length; i++) {
    onProgress(Math.round((i / files.length) * 50), `Adding file ${i + 1} of ${files.length}...`);
    zip.file(files[i].name, files[i]);
  }

  onProgress(60, "Compressing archive...");
  const blob = await zip.generateAsync(
    { type: "blob", compression: "DEFLATE", compressionOptions: { level: 6 } },
    (metadata) => {
      onProgress(60 + Math.round(metadata.percent * 0.35), `Compressing... ${Math.round(metadata.percent)}%`);
    }
  );

  onProgress(100, "Done");
  return new File([blob], "archive.zip", { type: "application/zip" });
}
