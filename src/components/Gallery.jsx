import Image from "next/image";
import { ImageOff } from "lucide-react";
/** Photo grid. Images are lazy-loaded and sized so they never shift the layout. */
export default function Gallery({ images }) {
  if (!images || images.length === 0) {
    return (
      <div className="card flex flex-col items-center px-5 py-10 text-center">
        <ImageOff className="h-7 w-7 text-ink-400" aria-hidden />
        <p className="mt-3 text-sm font-medium text-navy-900">No photos yet</p>
        <p className="mt-1 text-[15.5px] text-ink-500">This listing has not uploaded any photos.</p>
      </div>
    );
  }
  return (
    <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3">
      {images.map((image) => (
        <li
          key={image.src}
          className="relative aspect-4/3 overflow-hidden rounded-[--radius-card] border border-line bg-canvas"
        >
          <Image
            src={image.src}
            alt={image.alt}
            fill
            loading="lazy"
            sizes="(min-width: 640px) 33vw, 50vw"
            className="object-cover"
          />
        </li>
      ))}
    </ul>
  );
}
