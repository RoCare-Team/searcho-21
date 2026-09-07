import CategoryIcon from "@/components/CategoryIcon";
import { CityLink } from "@/components/CitySelection";

/**
 * Category card: an icon chip, the name, and how many businesses are listed
 * under it.
 *
 * No photograph — the service artwork is used in the hero collage instead, and
 * repeating it here turned a scannable grid into two rows of pictures.
 *
 * The count is the real number of listings mapped to this category, so it is
 * shown only where there is one: most categories on this site have a handful of
 * listings, and printing "0 businesses" under nine of twelve cards would read
 * worse than printing nothing.
 */
export default function CategoryTile({ name, path, slug, listings }) {
  return (
    <CityLink
      path={path}
      className="card card-hover group flex h-full w-full items-center gap-3 px-4 py-3.5 text-left"
    >
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-50 transition-colors group-hover:bg-brand-100">
        <CategoryIcon slug={slug} className="h-5 w-5 text-brand-500" />
      </span>

      <span className="flex min-w-0 flex-col">
        <span className="truncate text-[16px] font-semibold leading-tight text-navy-900 transition-colors group-hover:text-brand-600">
          {name}
        </span>
        {listings > 0 ? (
          <span className="mt-0.5 text-[14.5px] text-ink-500">
            {listings.toLocaleString("en-IN")} {listings === 1 ? "business" : "businesses"}
          </span>
        ) : null}
      </span>
    </CityLink>
  );
}

/** Trailing "see everything" card, closing the grid. */
export function AllCategoriesTile({ path, label = "All Categories" }) {
  return (
    <CityLink
      path={path}
      className="card card-hover group flex h-full w-full items-center gap-3 px-4 py-3.5 text-left"
    >
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-navy-900 transition-colors group-hover:bg-navy-800">
        <span className="flex flex-col gap-0.75" aria-hidden>
          {[0, 1, 2].map((i) => (
            <span key={i} className="flex gap-0.75">
              {[0, 1, 2].map((j) => (
                <span key={j} className="h-1 w-1 rounded-[1px] bg-white/85" />
              ))}
            </span>
          ))}
        </span>
      </span>
      <span className="text-[16px] font-semibold leading-tight text-navy-900 transition-colors group-hover:text-brand-600">
        {label}
      </span>
    </CityLink>
  );
}
