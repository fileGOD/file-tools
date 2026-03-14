/**
 * Convert an HEIC/HEIF image to JPEG.
 * Uses the heic2any library. Runs in the browser.
 *
 * @param file - HEIC/HEIF image file
 * @param quality - JPEG quality 0-1 (default: 0.92)
 * @param onProgress - Optional progress callback
 * @returns JPEG image file
 *
 * @example
 * const jpg = await heicToJpg(heicFile);
 */
export async function heicToJpg(
  file: File,
  quality = 0.92,
  onProgress: (progress: number, statusText: string) => void = () => {}
): Promise<File> {
  onProgress(10, `Converting ${file.name}...`);
  const heic2any = (await import("heic2any")).default;
  const result = await heic2any({ blob: file, toType: "image/jpeg", quality });
  const blob = Array.isArray(result) ? result[0] : result;
  const baseName = file.name.replace(/\.[^.]+$/, "");
  onProgress(100, "Done");
  return new File([blob], `${baseName}.jpg`, { type: "image/jpeg" });
}
