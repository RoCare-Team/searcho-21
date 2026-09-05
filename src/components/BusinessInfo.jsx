import { Clock } from "lucide-react";
function Row({ label, value }) {
  return (
    <div className="flex justify-between gap-6 border-b border-line py-2.5 last:border-0">
      <dt className="text-[13px] text-ink-500">{label}</dt>
      <dd className="text-right text-[13px] font-medium text-navy-900">{value}</dd>
    </div>
  );
}
/**
 * "Business Information" block.
 *
 * Only the columns free_listing_tb actually stores, and only the ones this
 * listing has filled in — an empty row is omitted rather than shown blank.
 */
export default function BusinessInfo({ business }) {
  const rows = [];
  if (business.establishedYear)
    rows.push({ label: "Established", value: business.establishedYear });
  if (business.contactPerson) {
    rows.push({
      label: "Contact person",
      value: business.designation
        ? `${business.contactPerson} (${business.designation})`
        : business.contactPerson,
    });
  }
  if (business.gstNumber) rows.push({ label: "GST number", value: business.gstNumber });
  if (business.address.city) {
    rows.push({
      label: "City",
      value: [business.address.city, business.address.state].filter(Boolean).join(", "),
    });
  }
  if (business.address.pincode) rows.push({ label: "Pincode", value: business.address.pincode });
  const hasHours = Boolean(business.openingHours?.length);
  if (rows.length === 0 && !hasHours) {
    return (
      <div className="card px-5 py-10 text-center">
        <p className="text-sm font-medium text-navy-900">No further details yet</p>
        <p className="mt-1 text-[13px] text-ink-500">
          This listing has not added business information.
        </p>
      </div>
    );
  }
  return (
    <div className="grid gap-6 sm:grid-cols-2">
      {rows.length > 0 && (
        <div>
          <h3 className="mb-2 text-[13px] font-semibold uppercase tracking-wide text-ink-400">
            Business information
          </h3>
          <dl className="card px-4 py-1">
            {rows.map((row) => (
              <Row key={row.label} {...row} />
            ))}
          </dl>
        </div>
      )}

      {hasHours && (
        <div>
          <h3 className="mb-2 flex items-center gap-1.5 text-[13px] font-semibold uppercase tracking-wide text-ink-400">
            <Clock className="h-3.5 w-3.5" aria-hidden />
            Working hours
          </h3>
          <dl className="card px-4 py-1">
            {business.openingHours.map((entry) => (
              <div
                key={entry.day}
                className="flex justify-between gap-6 border-b border-line py-2.5 last:border-0"
              >
                <dt className="text-[13px] text-ink-500">{entry.day}</dt>
                <dd
                  className={`text-[13px] font-medium ${entry.hours ? "text-navy-900" : "text-ink-400"}`}
                >
                  {entry.hours ?? "Closed"}
                </dd>
              </div>
            ))}
          </dl>
        </div>
      )}
    </div>
  );
}
/** Tag list used for the listing's keywords. */
export function TagList({ title, items }) {
  if (!items || items.length === 0) return null;
  return (
    <div>
      <h3 className="mb-2.5 text-[13px] font-semibold uppercase tracking-wide text-ink-400">
        {title}
      </h3>
      <ul className="flex flex-wrap gap-2">
        {items.map((item) => (
          <li
            key={item}
            className="rounded-full border border-line bg-white px-3 py-1.5 text-[13px] text-ink-700"
          >
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}
