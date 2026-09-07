import Image from "next/image";
import { BadgeCheck, Sparkles, Star } from "lucide-react";
import { assetUrl } from "@/lib/mappers";

/**
 * The hero's right-hand column: three service photographs and a brand panel.
 *
 * The two columns split at different points rather than forming an even 2×2
 * grid — that stagger is what stops four rectangles from reading as a table.
 *
 * The photographs are the real per-service artwork from `assets/category`,
 * passed in by the page rather than named here, so the collage follows the
 * taxonomy instead of a fixed list. The floating labels describe what the site
 * does ("Verified" is a real badge on listings); none carries a count, because
 * no number here would come from the database.
 */
export default function HeroCollage({ photos }) {
  if (photos.length === 0) return null;
  const [first, second, third] = photos;

  return (
    <div className="relative hidden h-92 lg:block">
      <div className="flex h-full gap-3.5">
        <div className="flex flex-[0.92] flex-col gap-3.5">
          <Tile photo={first} className="flex-[1.15]" priority />
          <Tile photo={third} className="flex-[0.85]" />
        </div>

        <div className="flex flex-[1.08] flex-col gap-3.5">
          <Tile photo={second} className="flex-[1.35]" priority />

          {/* The fourth cell is the brand panel rather than a fourth
              photograph, which keeps the block from reading as a stock-photo
              wall. */}
          <span className="flex flex-[0.65] flex-col items-center justify-center gap-1.5 rounded-2xl border border-brand-100 bg-brand-50 px-4 text-center">
            <span className="text-[19px] font-semibold leading-tight text-navy-900">
              Your Local
              <br />
              Search Partner
            </span>
            <svg
              viewBox="0 0 120 8"
              preserveAspectRatio="none"
              className="h-1.5 w-16 text-brand-400"
              aria-hidden
            >
              <path
                d="M2 6c22-4 48-5 74-3 14 1 28 2 42 3"
                fill="none"
                stroke="currentColor"
                strokeWidth="3"
                strokeLinecap="round"
              />
            </svg>
          </span>
        </div>
      </div>

      {/* Floating labels, deliberately few and small. */}
      <Badge className="-left-4 bottom-[38%]" icon={BadgeCheck} iconClass="text-success-600">
        Verified Professionals
      </Badge>
      <Badge className="-right-3 -top-3" icon={Sparkles} iconClass="text-brand-500">
        Quality Services
      </Badge>
      <Badge className="-bottom-3 left-6" icon={Star} iconClass="text-star">
        Trusted by Thousands
      </Badge>
    </div>
  );
}

function Tile({ photo, className = "", priority = false }) {
  const src = assetUrl("category", photo?.image);
  return (
    <span
      className={`relative block w-full overflow-hidden rounded-2xl border border-line bg-white shadow-card ${className}`}
    >
      {src ? (
        <Image
          src={src}
          alt=""
          fill
          sizes="(min-width: 1024px) 21vw, 0px"
          priority={priority}
          className="object-cover"
        />
      ) : null}
    </span>
  );
}

function Badge({ children, icon: Icon, iconClass, className }) {
  return (
    <span
      className={`absolute inline-flex items-center gap-1.5 rounded-lg border border-line bg-white px-2.5 py-1.5 text-[14.5px] font-medium text-navy-900 shadow-raised ${className}`}
    >
      <Icon className={`h-3.5 w-3.5 ${iconClass}`} aria-hidden />
      {children}
    </span>
  );
}
