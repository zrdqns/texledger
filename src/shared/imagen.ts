/**
 * Lee un File de imagen y devuelve un data URL JPEG cuadrado: recorta al centro
 * y reescala a `lado` px (256 por defecto). Mantiene el peso bajo (~20-40 KB) para
 * guardarlo directo en la base de datos sin necesidad de Storage. Solo navegador.
 */
export function archivoAFotoDataUrl(file: File, lado = 256, calidad = 0.82): Promise<string> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      const min = Math.min(img.width, img.height);
      const sx = (img.width - min) / 2;
      const sy = (img.height - min) / 2;
      const canvas = document.createElement("canvas");
      canvas.width = lado;
      canvas.height = lado;
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        reject(new Error("No se pudo procesar la imagen"));
        return;
      }
      ctx.drawImage(img, sx, sy, min, min, 0, 0, lado, lado);
      resolve(canvas.toDataURL("image/jpeg", calidad));
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Imagen inválida"));
    };
    img.src = url;
  });
}
