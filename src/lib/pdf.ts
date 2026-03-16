export async function getPdfLib() {
  const pdfjsLib = await import('pdfjs-dist');
  pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.mjs`;
  return pdfjsLib;
}

export async function getPdfDocument(data: ArrayBuffer) {
  const pdfjsLib = await getPdfLib();
  const loadingTask = pdfjsLib.getDocument({ data: new Uint8Array(data) });
  return await loadingTask.promise;
}

export async function generateThumbnail(data: ArrayBuffer): Promise<string> {
  const pdf = await getPdfDocument(data);
  const page = await pdf.getPage(1);
  const viewport = page.getViewport({ scale: 0.5 });

  const canvas = document.createElement('canvas');
  canvas.width = viewport.width;
  canvas.height = viewport.height;

  await page.render({ canvas, viewport }).promise;

  const thumbnail = canvas.toDataURL('image/jpeg', 0.7);
  pdf.destroy();
  return thumbnail;
}

export async function renderPage(
  canvas: HTMLCanvasElement,
  data: ArrayBuffer,
  pageNumber: number,
  scale: number = 1.5
) {
  const pdf = await getPdfDocument(data);
  const page = await pdf.getPage(pageNumber);

  const viewport = page.getViewport({ scale });
  canvas.width = viewport.width;
  canvas.height = viewport.height;

  await page.render({ canvas, viewport }).promise;
  pdf.destroy();
}

export async function getPdfPageCount(data: ArrayBuffer): Promise<number> {
  const pdf = await getPdfDocument(data);
  const count = pdf.numPages;
  pdf.destroy();
  return count;
}
