# @filegod/file-tools

31 pure file-processing functions that run entirely in the browser. No server uploads. No API keys. MIT licensed.

Extracted from [fileGOD](https://filegod.app) — the privacy-first file toolkit.

## Install

```bash
npm install @filegod/file-tools
```

## Tools

### PDF (10)

| Function | Description |
|----------|-------------|
| `compressPdf` | Reduce PDF file size by compressing images and removing metadata |
| `mergePdf` | Combine multiple PDFs into a single document |
| `splitPdf` | Split a PDF into individual pages or page ranges |
| `rotatePdf` | Rotate PDF pages by 90/180/270 degrees |
| `addPageNumbers` | Add page numbers to PDF with position and format options |
| `deletePdfPages` | Remove specific pages from a PDF |
| `watermarkPdf` | Add text or image watermarks to PDF pages |
| `flattenPdf` | Flatten PDF form fields and annotations |
| `pdfToJpg` | Convert PDF pages to JPG images |
| `jpgToPdf` | Convert JPG/PNG images to a PDF document |

### Image (20)

| Function | Description |
|----------|-------------|
| `compressJpeg` | Compress JPEG images with quality control |
| `compressPng` | Compress PNG images by reducing color palette |
| `resizeImage` | Resize images by dimensions or percentage |
| `cropImage` | Crop images to a specific region |
| `circleCrop` | Crop images into a circle with transparent background |
| `rotateImage` | Rotate images by any angle |
| `flipImage` | Flip images horizontally or vertically |
| `grayscaleImage` | Convert images to grayscale |
| `invertColors` | Invert image colors |
| `adjustBrightnessContrast` | Adjust image brightness and contrast |
| `blurImage` | Apply Gaussian blur to images |
| `addWatermark` | Add text watermarks to images |
| `stripMetadata` | Remove all metadata from images |
| `convertImage` | Convert between image formats (JPG, PNG, WebP, BMP, GIF) |
| `jpgPng` | Convert JPG to PNG |
| `jpgWebp` | Convert JPG to WebP |
| `pngWebp` | Convert PNG to WebP |
| `svgToPng` | Rasterize SVG to PNG at any resolution |
| `heicToJpg` | Convert Apple HEIC photos to JPG |
| `squareImage` | Pad images to a perfect square with configurable background |

### Utility (5)

| Function | Description |
|----------|-------------|
| `generateQrCode` | Generate QR codes from text or URLs |
| `imageToText` | Extract text from images using OCR (Tesseract.js) |
| `pickColor` | Extract color values from image coordinates |
| `zipFiles` | Create ZIP archives from multiple files |
| `unzipFiles` | Extract files from ZIP archives |

## Usage

```typescript
import { compressPdf, resizeImage, generateQrCode } from "@filegod/file-tools";

// Compress a PDF
const file = document.querySelector("input[type=file]").files[0];
const buffer = await file.arrayBuffer();
const compressed = await compressPdf(new Uint8Array(buffer));

// Resize an image
const resized = await resizeImage(imageFile, { width: 800, height: 600 });

// Generate a QR code
const qrDataUrl = await generateQrCode("https://filegod.app");
```

## Dependencies

| Package | Used by |
|---------|---------|
| `pdf-lib` | All PDF tools |
| `pdfjs-dist` | PDF-to-JPG conversion |
| `tesseract.js` | OCR / image-to-text |
| `jszip` | ZIP/unzip |
| `heic2any` | HEIC-to-JPG conversion |
| `qrcode` | QR code generation |
| `piexifjs` | EXIF metadata manipulation |

## Browser Only

These functions use the Canvas API, Blob, and other browser APIs. They are designed for client-side use and will not work in Node.js without polyfills.

## License

MIT - [fileGOD](https://filegod.app)
