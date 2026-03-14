/**
 * Generate a QR code as a PNG image from text or URL.
 * Uses the qrcode library. Runs in the browser.
 *
 * @param text - Text or URL to encode
 * @param options - QR code options
 * @param options.width - Image width in pixels (default: 400)
 * @param options.fgColor - Foreground color (default: "#000000")
 * @param options.bgColor - Background color (default: "#FFFFFF")
 * @returns PNG image file of the QR code
 *
 * @example
 * const qr = await generateQrCode("https://filegod.app");
 */
export async function generateQrCode(
  text: string,
  options: { width?: number; fgColor?: string; bgColor?: string } = {}
): Promise<File> {
  const QRCode = (await import("qrcode")).default;
  const { width = 400, fgColor = "#000000", bgColor = "#FFFFFF" } = options;

  const canvas = document.createElement("canvas");
  await QRCode.toCanvas(canvas, text, {
    width,
    margin: 2,
    color: { dark: fgColor, light: bgColor },
  });

  const blob = await new Promise<Blob>((resolve, reject) => {
    canvas.toBlob((b) => (b ? resolve(b) : reject(new Error("Failed to export QR code"))), "image/png");
  });

  return new File([blob], "qr-code.png", { type: "image/png" });
}
