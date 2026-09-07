/**
 * FAQ accordion built on <details>, so it opens without any client JS and stays
 * expandable for crawlers.
 */
export default function FAQ({ items, title }) {
  if (items.length === 0) return null;
  return (
    <section>
      {title && <h2 className="mb-4 text-lg font-semibold text-navy-900">{title}</h2>}

      <div className="divide-y divide-line overflow-hidden rounded-[--radius-card] border border-line bg-white">
        {items.map((item) => (
          <details key={item.question} className="group">
            <summary className="flex cursor-pointer list-none items-center justify-between gap-4 px-4 py-3.5 text-[16.5px] font-medium text-navy-900 transition-colors hover:bg-canvas sm:px-5">
              <h3 className="text-[16.5px] font-medium">{item.question}</h3>
              <span
                className="relative h-4 w-4 shrink-0 text-ink-400 before:absolute before:left-0 before:top-1/2 before:h-px before:w-4 before:bg-current after:absolute after:left-1/2 after:top-0 after:h-4 after:w-px after:bg-current after:transition-transform group-open:after:rotate-90 group-open:after:opacity-0"
                aria-hidden
              />
            </summary>
            <div className="px-4 pb-4 text-[15.5px] leading-relaxed text-ink-700 sm:px-5">
              {item.answer}
            </div>
          </details>
        ))}
      </div>
    </section>
  );
}
