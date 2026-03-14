/**
 * Compress a PDF by re-encoding embedded images as JPEG at reduced quality.
 * Works best on image-heavy PDFs (scans, screenshots). Runs in the browser.
 *
 * @param file - PDF file to compress
 * @param quality - JPEG quality for embedded images, 0-1 (default: 0.65)
 * @param onProgress - Optional progress callback (progress 0-100, statusText)
 * @returns Compressed PDF file
 *
 * @example
 * const input = document.querySelector('input[type="file"]').files[0];
 * const compressed = await compressPdf(input);
 * console.log(`Reduced from ${input.size} to ${compressed.size} bytes`);
 */
export async function compressPdf(
  file: File,
  quality = 0.65,
  onProgress: (progress: number, statusText: string) => void = () => {}
): Promise<File> {
  const { PDFDocument, PDFName, PDFRawStream, PDFNumber } = await import("pdf-lib");

  onProgress(0, `Loading ${file.name}...`);
  const bytes = await file.arrayBuffer();
  const doc = await PDFDocument.load(bytes, { ignoreEncryption: true });
  const context = (doc as any).context;

  onProgress(20, `Analyzing ${file.name}...`);

  // Find all image XObjects
  const imageRefs: { ref: any; dict: any; width: number; height: number }[] = [];
  context.enumerateIndirectObjects().forEach(([ref, obj]: [any, any]) => {
    if (obj instanceof PDFRawStream || (obj && obj.dict)) {
      const dict = obj instanceof PDFRawStream ? obj.dict : obj.dict;
      if (!dict) return;
      const type = dict.get(PDFName.of("Type"));
      const subtype = dict.get(PDFName.of("Subtype"));
      if (
        (subtype && subtype.toString() === "/Image") ||
        (type && type.toString() === "/XObject" && subtype && subtype.toString() === "/Image")
      ) {
        const w = dict.get(PDFName.of("Width"));
        const h = dict.get(PDFName.of("Height"));
        if (w instanceof PDFNumber && h instanceof PDFNumber) {
          imageRefs.push({ ref, dict, width: w.asNumber(), height: h.asNumber() });
        }
      }
    }
  });

  onProgress(30, `Found ${imageRefs.length} images. Compressing...`);

  let compressed = 0;
  for (let j = 0; j < imageRefs.length; j++) {
    try {
      const { ref, width, height } = imageRefs[j];
      const obj = context.lookup(ref);
      if (!obj) continue;

      let imageBytes: Uint8Array | undefined;
      if (obj instanceof PDFRawStream) imageBytes = obj.contents;
      else if (obj.contents) imageBytes = obj.contents;
      if (!imageBytes || imageBytes.length === 0) continue;
      if (width < 100 || height < 100) continue;

      const dict = imageRefs[j].dict;
      const filter = dict.get(PDFName.of("Filter"));
      const filterStr = filter ? filter.toString() : "";
      const isJpeg = filterStr.includes("DCTDecode");
      const isFlate = filterStr.includes("FlateDecode");

      let bitmap: ImageBitmap | null = null;

      if (isJpeg) {
        try {
          const blob = new Blob([imageBytes], { type: "image/jpeg" });
          bitmap = await createImageBitmap(blob);
        } catch { continue; }
      } else if (isFlate || !filterStr || filterStr === "[]") {
        const bitsPerComponent = dict.get(PDFName.of("BitsPerComponent"));
        const colorSpace = dict.get(PDFName.of("ColorSpace"));
        const bpc = bitsPerComponent instanceof PDFNumber ? bitsPerComponent.asNumber() : 8;
        if (bpc !== 8) continue;
        const csStr = colorSpace ? colorSpace.toString() : "";
        let channels = 3;
        if (csStr.includes("DeviceGray") || csStr.includes("Gray")) channels = 1;
        else if (csStr.includes("DeviceCMYK") || csStr.includes("CMYK")) continue;
        const expectedLen = width * height * channels;
        if (imageBytes.length < expectedLen) continue;
        const rgba = new Uint8ClampedArray(width * height * 4);
        for (let p = 0; p < width * height; p++) {
          if (channels === 3) {
            rgba[p * 4] = imageBytes[p * 3];
            rgba[p * 4 + 1] = imageBytes[p * 3 + 1];
            rgba[p * 4 + 2] = imageBytes[p * 3 + 2];
          } else {
            rgba[p * 4] = imageBytes[p];
            rgba[p * 4 + 1] = imageBytes[p];
            rgba[p * 4 + 2] = imageBytes[p];
          }
          rgba[p * 4 + 3] = 255;
        }
        try {
          bitmap = await createImageBitmap(new ImageData(rgba, width, height));
        } catch { continue; }
      } else { continue; }

      if (!bitmap) continue;

      const canvas = new OffscreenCanvas(bitmap.width, bitmap.height);
      const ctx = canvas.getContext("2d")!;
      ctx.drawImage(bitmap, 0, 0);
      bitmap.close();

      const jpegBlob = await canvas.convertToBlob({ type: "image/jpeg", quality });
      const jpegBytes = new Uint8Array(await jpegBlob.arrayBuffer());
      if (jpegBytes.length >= imageBytes.length) continue;

      const newDict = context.obj({});
      newDict.set(PDFName.of("Type"), PDFName.of("XObject"));
      newDict.set(PDFName.of("Subtype"), PDFName.of("Image"));
      newDict.set(PDFName.of("Width"), PDFNumber.of(width));
      newDict.set(PDFName.of("Height"), PDFNumber.of(height));
      newDict.set(PDFName.of("ColorSpace"), PDFName.of("DeviceRGB"));
      newDict.set(PDFName.of("BitsPerComponent"), PDFNumber.of(8));
      newDict.set(PDFName.of("Filter"), PDFName.of("DCTDecode"));
      newDict.set(PDFName.of("Length"), PDFNumber.of(jpegBytes.length));
      context.assign(ref, PDFRawStream.of(newDict, jpegBytes));
      compressed++;
    } catch { continue; }

    onProgress(30 + Math.round((j / imageRefs.length) * 60), `Compressing image ${j + 1}/${imageRefs.length}...`);
  }

  onProgress(90, `Saving (${compressed} images optimized)...`);
  const compressedBytes = await doc.save({ useObjectStreams: true, addDefaultPage: false, objectsPerTick: 100 });
  const blob = new Blob([compressedBytes], { type: "application/pdf" });

  onProgress(100, "Done!");
  return new File([blob], file.name.replace(/\.pdf$/i, "-compressed.pdf"), { type: "application/pdf" });
}
