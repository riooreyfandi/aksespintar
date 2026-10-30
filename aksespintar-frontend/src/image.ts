const MAX_SOURCE_BYTES = 8 * 1024 * 1024;
const OUTPUT_SIZE = 320;

function loadImage(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const image = new Image();
    image.onload = () => {
      URL.revokeObjectURL(url);
      resolve(image);
    };
    image.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Gambar tidak bisa dibaca. Coba file lain."));
    };
    image.src = url;
  });
}

// Foto dari perangkat dipotong persegi di tengah lalu diperkecil agar hemat
// kuota database. Hasilnya berupa data URL yang langsung disimpan sebagai avatar.
export async function fileToAvatarDataUrl(file: File): Promise<string> {
  if (!file.type.startsWith("image/")) {
    throw new Error("File harus berupa gambar (JPG, PNG, atau WebP).");
  }
  if (file.size > MAX_SOURCE_BYTES) {
    throw new Error("Ukuran gambar maksimal 8 MB.");
  }

  const image = await loadImage(file);
  const canvas = document.createElement("canvas");
  canvas.width = OUTPUT_SIZE;
  canvas.height = OUTPUT_SIZE;

  const ctx = canvas.getContext("2d");
  if (!ctx) {
    throw new Error("Peramban tidak mendukung pengolahan gambar.");
  }

  const side = Math.min(image.naturalWidth, image.naturalHeight);
  const offsetX = (image.naturalWidth - side) / 2;
  const offsetY = (image.naturalHeight - side) / 2;
  ctx.drawImage(image, offsetX, offsetY, side, side, 0, 0, OUTPUT_SIZE, OUTPUT_SIZE);

  const webp = canvas.toDataURL("image/webp", 0.86);
  if (webp.startsWith("data:image/webp")) {
    return webp;
  }
  return canvas.toDataURL("image/jpeg", 0.86);
}
