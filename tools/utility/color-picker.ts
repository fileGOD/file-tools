/**
 * Extract the color of a specific pixel from an image.
 * Runs entirely in the browser — no server upload.
 *
 * @param file - Image file to pick color from
 * @param x - X coordinate (pixel)
 * @param y - Y coordinate (pixel)
 * @returns Color object with hex, rgb, and hsl values
 *
 * @example
 * const color = await pickColor(photo, 100, 200);
 * console.log(color.hex); // "#3A7BD5"
 */
export async function pickColor(
  file: File,
  x: number,
  y: number
): Promise<{ hex: string; rgb: string; hsl: string; r: number; g: number; b: number }> {
  const bitmap = await createImageBitmap(file);
  const canvas = new OffscreenCanvas(bitmap.width, bitmap.height);
  const ctx = canvas.getContext("2d")!;
  ctx.drawImage(bitmap, 0, 0);
  bitmap.close();

  const clampedX = Math.max(0, Math.min(x, canvas.width - 1));
  const clampedY = Math.max(0, Math.min(y, canvas.height - 1));
  const d = ctx.getImageData(clampedX, clampedY, 1, 1).data;
  const [r, g, b] = [d[0], d[1], d[2]];

  const hex = `#${r.toString(16).padStart(2, "0")}${g.toString(16).padStart(2, "0")}${b.toString(16).padStart(2, "0")}`.toUpperCase();
  const rgb = `rgb(${r}, ${g}, ${b})`;

  // RGB to HSL
  const rn = r / 255, gn = g / 255, bn = b / 255;
  const max = Math.max(rn, gn, bn), min = Math.min(rn, gn, bn);
  const l = (max + min) / 2;
  let h = 0, s = 0;
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    if (max === rn) h = ((gn - bn) / d + (gn < bn ? 6 : 0)) / 6;
    else if (max === gn) h = ((bn - rn) / d + 2) / 6;
    else h = ((rn - gn) / d + 4) / 6;
  }
  const hsl = `hsl(${Math.round(h * 360)}, ${Math.round(s * 100)}%, ${Math.round(l * 100)}%)`;

  return { hex, rgb, hsl, r, g, b };
}
