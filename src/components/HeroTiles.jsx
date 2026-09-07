import Image from "next/image";
import { assetUrl } from "@/lib/mappers";
import { CityLink } from "@/components/CitySelection";
import CardSlider from "@/components/CardSlider";
/**
 * Category banner slider under the hero search.
 *
 * Banners are the designed 16:9 templates in `uploads/templates`, which already
 * carry the category name in the artwork — so no scrim and no caption, which
 * would only repeat the label. The name goes into `alt` instead, because it is
 * text baked into an image.
 *
 * Items are sized as exact fractions of the track (four across on desktop, two
 * on tablet, one on phones) so no banner is left half-visible at the edge;
 * CardSlider owns the scrolling and the paging dots.
 */
export default function HeroTiles({ tiles }) {
  return (
    <CardSlider>
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
              className="relative block aspect-video w-full overflow-hidden rounded-xl border border-line bg-canvas transition-shadow hover:shadow-raised"
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
    </CardSlider>
  );
}
