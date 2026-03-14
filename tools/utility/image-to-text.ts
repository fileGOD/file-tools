/**
 * Extract text from an image using OCR (Optical Character Recognition).
 * Uses Tesseract.js. Runs entirely in the browser — no server upload.
 *
 * @param file - Image file to extract text from
 * @param language - OCR language code (default: "eng")
 * @param onProgress - Optional progress callback
 * @returns Extracted text string
 *
 * @example
 * const text = await imageToText(screenshot);
 * console.log(text);
 */
export async function imageToText(
  file: File,
  language = "eng",
  onProgress: (progress: number, statusText: string) => void = () => {}
): Promise<string> {
  onProgress(0, "Loading OCR engine...");
  const { createWorker } = await import("tesseract.js");

  const worker = await createWorker(language, undefined, {
    logger: (m: { status: string; progress: number }) => {
      if (m.status === "loading tesseract core") {
        onProgress(Math.round(m.progress * 30), "Loading OCR engine...");
      } else if (m.status === "initializing tesseract") {
        onProgress(30 + Math.round(m.progress * 20), "Initializing...");
      } else if (m.status === "recognizing text") {
        onProgress(50 + Math.round(m.progress * 50), "Recognizing text...");
      }
    },
  });

  const { data } = await worker.recognize(file);
  await worker.terminate();

  onProgress(100, "Done");
  return data.text;
}
