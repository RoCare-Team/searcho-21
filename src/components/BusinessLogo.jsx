import Image from "next/image";
import { initialsOf } from "@/lib/mappers";
/**
 * Business logo from free_listing_tb.logo_img.
 *
 * Many listings have no logo, so the initials block is the normal case, not an
 * error state.
 */
export default function BusinessLogo({ name, src, size = 48, className = "" }) {
  const shell = `relative flex shrink-0 items-center justify-center overflow-hidden rounded-lg border border-line bg-white ${className}`;
  if (!src) {
    return (
      <div
        className={`${shell} bg-canvas text-sm font-semibold text-navy-500`}
        style={{ width: size, height: size }}
        aria-hidden
      >
        {initialsOf(name)}
      </div>
    );
  }
  return (
    <div className={shell} style={{ width: size, height: size }}>
      <Image
        src={src}
        alt={`${name} logo`}
        width={size}
        height={size}
        loading="lazy"
        className="h-full w-full object-contain"
      />
    </div>
  );
}
