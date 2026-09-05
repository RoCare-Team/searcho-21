import Image from "next/image";
import { CityLink } from "@/components/CitySelection";
import QuoteDialog from "@/components/QuoteDialog";

/**
 * A panel of homepage services — one `category` group of home_page_services_tb.
 *
 * The panel carries the border and the heading; the tiles inside are bare
 * artwork with a label underneath, so a group reads as one block rather than as
 * a row of separate cards. Two panels sit side by side on a wide screen.
 */
export default function HomeServicePanel({ title, items }) {
  return (
    <section className="card p-5">
      <h3 className="text-[15px] font-semibold text-navy-900">{title}</h3>

      <ul className="mt-4 grid grid-cols-2 gap-x-3 gap-y-5 sm:grid-cols-3">
        {items.map((item) => (
          <li key={item.id}>
            <ServiceTile item={item} section={title} />
          </li>
        ))}
      </ul>
    </section>
  );
}

/**
 * One service: artwork, name, expert count, and its own enquiry action.
 *
 * The enquiry button sits outside the link rather than inside it — a button
 * nested in a link is neither valid markup nor predictably clickable — and is
 * kept as plain text so a panel of six does not turn into a wall of buttons.
 *
 * `experts` is a real column on the row, so it shows only when the row has one.
 */
function ServiceTile({ item, section }) {
  return (
    <div className="flex flex-col">
      <CityLink path={item.path} className="group flex flex-col text-left">
        <span className="relative block aspect-4/3 w-full overflow-hidden rounded-lg border border-line bg-canvas">
          {item.image ? (
            <Image
              src={item.image}
              alt=""
              fill
              loading="lazy"
              sizes="(min-width: 1024px) 14vw, (min-width: 640px) 22vw, 40vw"
              className="object-cover transition-transform duration-200 group-hover:scale-[1.04]"
            />
          ) : null}
        </span>

        <span className="mt-2 block text-center text-[13px] font-medium leading-tight text-ink-800 transition-colors group-hover:text-brand-600">
          {item.name}
        </span>
        {item.experts ? (
          <span className="mt-0.5 block text-center text-[11.5px] text-ink-400">
            {item.experts.toLocaleString("en-IN")} experts
          </span>
        ) : null}
      </CityLink>

      <div className="mt-1.5 text-center">
        <QuoteDialog
          label="Enquiry"
          title={`${section} — ${item.name}`}
          context={`Your requirement is shared with ${section.toLowerCase()} ${item.name.toLowerCase()} providers in your city.`}
          variant="link"
        />
      </div>
    </div>
  );
}
