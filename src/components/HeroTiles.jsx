"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import { assetUrl } from "@/lib/mappers";
import { CityLink } from "@/components/CitySelection";
/**
 * Category banner slider under the hero search.
 *
 * Banners are the designed 16:9 templates in `uploads/templates`, which already
 * carry the category name in the artwork — so no scrim and no caption, which
 * would only repeat the label. The name goes into `alt` instead, because it is
 * text baked into an image.
 *
 * Items are sized as exact fractions of the track (four across on desktop, two
 * on tablet, one on phones) so no banner is left half-visible at the edge.
 * Paging is measured from the track itself rather than hard-coded, so the dots
 * stay correct at every breakpoint without repeating the CSS in JS.
 */
export default function HeroTiles({ tiles }) {
  const trackRef = useRef(null);
  const [pages, setPages] = useState(1);
  const [active, setActive] = useState(0);
  const measure = useCallback(() => {
    const el = trackRef.current;
    if (!el || el.clientWidth === 0) return;
    // Count pages from how many items fit, not from scrollWidth / clientWidth:
    // the gaps inflate scrollWidth and that ratio over-counts (five one-up
    // slides read as 5.14 and rounded up to six pages).
    const items = Array.from(el.children);
    if (items.length === 0) return;
    const first = items[0].getBoundingClientRect();
    const step =
      items.length > 1 ? items[1].getBoundingClientRect().left - first.left : first.width;
    const perView = step > 0 ? Math.max(1, Math.round(el.clientWidth / step)) : 1;
    const total = Math.max(1, Math.ceil(items.length / perView));
    setPages(total);
    // The browser clamps the final page to maxScroll, which is less than
    // page * clientWidth, so derive the active dot from scroll progress.
    const maxScroll = el.scrollWidth - el.clientWidth;
    setActive(maxScroll > 0 ? Math.round((el.scrollLeft / maxScroll) * (total - 1)) : 0);
  }, []);
  useEffect(() => {
    const el = trackRef.current;
    if (!el) return;
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(el);
    return () => observer.disconnect();
  }, [measure]);
  function goTo(page) {
    const el = trackRef.current;
    if (!el || pages < 2) return;
    // Spread the pages across the real scrollable range so the last one lands
    // exactly at the end instead of being clamped short.
    const maxScroll = el.scrollWidth - el.clientWidth;
    el.scrollTo({ left: (page / (pages - 1)) * maxScroll, behavior: "smooth" });
  }
  return (
    <div>
      <ul
        ref={trackRef}
        onScroll={measure}
        className="no-scrollbar flex snap-x snap-mandatory gap-3 overflow-x-auto sm:gap-4"
      >
        {tiles.map((tile) => {
          const src = assetUrl("templates", tile.template);
          return (
            <li
              key={tile.path}
              // Exact fractions of the track, so nothing peeks past the edge.
              className="w-full shrink-0 snap-start sm:w-[calc((100%-1rem)/2)] lg:w-[calc((100%-3rem)/4)]"
            >
              <CityLink
                path={tile.path}
                className="relative block w-full aspect-video overflow-hidden rounded-xl border border-line bg-canvas transition-shadow hover:shadow-raised"
              >
                {src && (
                  <Image
                    src={src}
                    alt={tile.name}
                    fill
                    sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
                    className="object-cover"
                  />
                )}
              </CityLink>
            </li>
          );
        })}
      </ul>

      {pages > 1 && (
        <div className="mt-4 flex items-center justify-center gap-2">
          {Array.from({ length: pages }, (_, i) => (
            <button
              key={i}
              type="button"
              onClick={() => goTo(i)}
              aria-label={`Go to slide ${i + 1}`}
              aria-current={i === active}
              className={`h-2 rounded-full transition-all duration-200 ${i === active ? "w-6 bg-brand-500" : "w-2 bg-line-strong hover:bg-ink-400"}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
