/**
 * Extract all files from a ZIP archive.
 * Uses JSZip. Runs entirely in the browser — no server upload.
 *
 * @param file - ZIP archive file
 * @param onProgress - Optional progress callback
 * @returns Array of extracted files
 *
 * @example
 * const files = await unzipFiles(archive);
 * files.forEach(f => console.log(f.name, f.size));
 */
export async function unzipFiles(
  file: File,
  onProgress: (progress: number, statusText: string) => void = () => {}
): Promise<File[]> {
  const JSZip = (await import("jszip")).default;
  onProgress(10, "Reading archive...");

  const zip = await JSZip.loadAsync(file);
  const entries = Object.values(zip.files).filter((e) => !e.dir);
  const results: File[] = [];

  for (let i = 0; i < entries.length; i++) {
    onProgress(10 + Math.round((i / entries.length) * 85), `Extracting ${i + 1} of ${entries.length}...`);
    const entry = entries[i];
    const blob = await entry.async("blob");
    const name = entry.name.split("/").pop() || entry.name;
    results.push(new File([blob], name));
  }

  onProgress(100, `Extracted ${entries.length} file${entries.length > 1 ? "s" : ""}`);
  return results;
}
