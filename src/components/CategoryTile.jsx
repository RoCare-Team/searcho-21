import CategoryIcon from "@/components/CategoryIcon";
import { CityLink } from "@/components/CitySelection";
/**
 * Compact category tile: artwork in a rounded square, label underneath.
 *
 * Used for the dense category grids on the homepage and city pages, where the
 * point is to scan many services at once rather than read a description of each.
 * The wider `CategoryCard` is still used where a description earns its space.
 */
export default function CategoryTile({ name, path, slug }) {
  return (
    <CityLink path={path} className="group flex w-full flex-col items-center gap-2 text-center">
      <span className="flex h-[4.5rem] w-[4.5rem] items-center justify-center rounded-xl border border-line-strong bg-white transition-all duration-150 group-hover:border-brand-300 group-hover:shadow-raised sm:h-[5.5rem] sm:w-[5.5rem] lg:h-[6.5rem] lg:w-[6.5rem]">
        <CategoryIcon
          slug={slug}
          className="h-8 w-8 text-brand-500 sm:h-10 sm:w-10 lg:h-12 lg:w-12"
        />
      </span>

      <span className="text-[13px] leading-tight text-ink-700 transition-colors group-hover:text-brand-600">
        {name}
      </span>
    </CityLink>
  );
}
/** Trailing "see everything" tile, closing the grid. */
export function AllCategoriesTile({ path, label = "All Categories" }) {
  return (
    <CityLink path={path} className="group flex w-full flex-col items-center gap-2 text-center">
      <span className="flex h-[4.5rem] w-[4.5rem] items-center justify-center rounded-xl border border-navy-900 bg-navy-900 transition-colors group-hover:bg-navy-800 sm:h-[5.5rem] sm:w-[5.5rem] lg:h-[6.5rem] lg:w-[6.5rem]">
        <span className="flex flex-col gap-[5px]" aria-hidden>
          {[0, 1, 2].map((i) => (
            <span key={i} className="flex gap-[5px]">
              {[0, 1, 2].map((j) => (
                <span key={j} className="h-2 w-2 rounded-[3px] bg-white/85 lg:h-2.5 lg:w-2.5" />
              ))}
            </span>
          ))}
        </span>
      </span>
      <span className="text-[13px] leading-tight text-ink-700 transition-colors group-hover:text-brand-600">
        {label}
      </span>
    </CityLink>
  );
}
