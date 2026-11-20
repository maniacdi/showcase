/** Max upload we even try to decode (bytes). */
export const LOGO_MAX_BYTES = 8 * 1024 * 1024;

/**
 * Read an image file and return a data URL no larger than `max` px on its
 * longest side (aspect kept, never upscaled). WebP when the browser can
 * encode it, PNG otherwise; both keep transparency for logos.
 */
export async function downscaleImage(file: File, max = 256): Promise<string> {
  if (!file.type.startsWith("image/")) throw new Error("not-image");
  if (file.size > LOGO_MAX_BYTES) throw new Error("too-big");

  const url = URL.createObjectURL(file);
  try {
    const img = await new Promise<HTMLImageElement>((resolve, reject) => {
      const el = new Image();
      el.onload = () => resolve(el);
      el.onerror = () => reject(new Error("decode"));
      el.src = url;
    });
    // SVGs without intrinsic size report 0: give them a square box.
    const w0 = img.naturalWidth || max;
    const h0 = img.naturalHeight || max;
    const scale = Math.min(1, max / Math.max(w0, h0));
    const w = Math.max(1, Math.round(w0 * scale));
    const h = Math.max(1, Math.round(h0 * scale));

    const canvas = document.createElement("canvas");
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("canvas");
    ctx.imageSmoothingQuality = "high";
    ctx.drawImage(img, 0, 0, w, h);
    const webp = canvas.toDataURL("image/webp", 0.86);
    return webp.startsWith("data:image/webp") ? webp : canvas.toDataURL("image/png");
  } finally {
    URL.revokeObjectURL(url);
  }
}
