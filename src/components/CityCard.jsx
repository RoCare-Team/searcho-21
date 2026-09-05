import Link from "next/link";
import Image from "next/image";
import { MapPin } from "lucide-react";
import { assetUrl } from "@/lib/mappers";
/**
 * Compact city tile: photo in a rounded box, name underneath.
 *
 * Deliberately small and label-below rather than a large photo card with the
 * name burnt into a dark scrim. The photos are a mixed set — a grey monument, a
 * night market, an overcast street — so laying a gradient over them and blowing
 * them up made the row heavy and inconsistent. Kept small with the label outside
 * the frame, they read as one set and match the category tiles above.
 */
export default function CityCard({ name, slug, photo }) {
  const src = assetUrl("img_city", photo);
  return (
    <Link href={`/${slug}`} className="group flex flex-col gap-2">
      <span className="relative block aspect-4/3 w-full overflow-hidden rounded-lg border border-line-strong bg-canvas transition-colors group-hover:border-brand-300">
        {src ? (
          <Image
            src={src}
            alt=""
            fill
            loading="lazy"
            sizes="(min-width: 1024px) 12vw, (min-width: 640px) 25vw, 33vw"
            className="object-cover"
          />
        ) : (
          <span className="flex h-full w-full items-center justify-center">
            <MapPin className="h-6 w-6 text-ink-400" aria-hidden />
          </span>
        )}
      </span>

      <span className="text-center text-[12.5px] leading-tight text-ink-700 transition-colors group-hover:text-brand-600">
        {name}
      </span>
    </Link>
  );
}
