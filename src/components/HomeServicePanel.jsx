import Image from "next/image";
import CardSlider from "@/components/CardSlider";
import CategoryIcon from "@/components/CategoryIcon";
import { CityLink } from "@/components/CitySelection";

/**
 * One `category` group of home_page_services_tb — its name over its services.
 *
 * The heading is what tells Water Purifier's "Routine Service" from AC's:
 * level-two names repeat across groups, so a flat grid of all nine left two
 * pairs of cards indistinguishable.
 *
 * Every group sizes its items to the same five-across fraction, so a card is
 * identical whether its group holds four services or nine.
 */
export default function HomeServiceGroup({ title, items }) {
  return (
    <section className="min-w-0">
      <h3 className="text-[17px] font-semibold text-navy-900">{title}</h3>

      {/* A slider, not a wrapping grid: the groups hold four and five services
          today and any number tomorrow, and a grid puts the overflow on a
          second row with empty cells beside it. Items are exact fractions of
          the track so none is left half-visible at the edge. */}
      <CardSlider className="mt-3" gapClass="gap-3 lg:gap-4">
        {items.map((item) => (
          <li
            key={item.id}
            className="flex w-full shrink-0 snap-start sm:w-[calc((100%-1.5rem)/3)] lg:w-[calc((100%-4rem)/5)]"
          >
            <ServiceCard item={item} />
          </li>
        ))}
      </CardSlider>
    </section>
  );
}

/**
 * One service: an inset photograph, then a single footer row carrying the
 * icon, the name and the expert count.
 *
 * The whole card is the link. An enquiry action used to sit here as well, but
 * it stole the name's width and added a third storey; the service page it
 * links to opens with the enquiry form in its sidebar.
 *
 * `experts` is a real column on the row, so it shows only when the row has one.
 */
function ServiceCard({ item }) {
  return (
    <CityLink
      path={item.path}
      className="card card-hover group flex h-full w-full flex-col p-2 text-left"
    >
      {/* The photograph is inset rather than bled to the card's edges: with the
          card itself already carrying a border, a full-bleed image left two
          hard edges stacked a pixel apart. */}
      <span className="relative block aspect-video w-full overflow-hidden rounded-lg bg-canvas">
        {item.image ? (
          <Image
            src={item.image}
            alt=""
            fill
            loading="lazy"
            sizes="(min-width: 1024px) 16vw, (min-width: 640px) 22vw, 40vw"
            className="object-cover transition-transform duration-200 group-hover:scale-[1.04]"
          />
        ) : null}
      </span>

      <span className="flex flex-1 items-center gap-2.5 px-1 pb-0.5 pt-2.5">
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-brand-50">
          <CategoryIcon slug={item.slug} className="h-4 w-4 text-brand-500" />
        </span>

        <span className="flex min-w-0 flex-col">
          <span className="text-[15px] font-semibold leading-tight text-navy-900 transition-colors group-hover:text-brand-600">
            {item.name}
          </span>
          {item.experts ? (
            <span className="mt-0.5 text-[13.5px] text-ink-500">
              {item.experts.toLocaleString("en-IN")} experts
            </span>
          ) : null}
        </span>
      </span>
    </CityLink>
  );
}
