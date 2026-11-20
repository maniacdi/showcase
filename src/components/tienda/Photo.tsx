import type { Photo as PhotoData } from "@/data/productos";

/**
 * Plain <img> (optional srcset): the demo photos are local files in
 * public/images, already cropped and compressed, so they skip the image
 * optimizer. The caller's class sets the frame (aspect-ratio + object-fit: cover).
 */
export default function Photo({
  photo,
  sizes,
  className,
  priority = false,
  decorative = false,
}: {
  photo: PhotoData;
  sizes: string;
  className?: string;
  priority?: boolean;
  /** Next to a visible name (cart rows): empty alt so it isn't read twice. */
  decorative?: boolean;
}) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={photo.src}
      srcSet={photo.srcSet}
      sizes={photo.srcSet ? sizes : undefined}
      width={photo.width}
      height={photo.height}
      alt={decorative ? "" : photo.alt}
      loading={priority ? "eager" : "lazy"}
      fetchPriority={priority ? "high" : undefined}
      decoding="async"
      className={className}
      style={photo.position ? { objectPosition: photo.position } : undefined}
    />
  );
}
