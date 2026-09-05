/**
 * Joins address parts, dropping empties and consecutive duplicates.
 *
 * Listings frequently repeat a value across fields (line1 and locality are
 * often both "Sector 48", or both just the city name), which would otherwise
 * render as "Sector 48, Sector 48, Gurgaon".
 */
export function formatAddress(parts) {
  const seen = new Set();
  const out = [];
  for (const part of parts) {
    // Not every column is a string: pincode comes back from MySQL as a number,
    // so coerce before trimming rather than assuming the driver's type.
    if (part === null || part === undefined) continue;
    const value = String(part).trim();
    if (!value) continue;
    const key = value.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(value);
  }
  return out.join(", ");
}
/** Short address used on listing cards. */
export function shortAddress(business) {
  return formatAddress([business.address.line1, business.address.locality, business.address.city]);
}
/** Full address used on the profile page and in structured data. */
export function fullAddress(business) {
  return formatAddress([
    business.address.line1,
    business.address.line2,
    business.address.locality,
    business.address.city,
    business.address.state,
    business.address.pincode,
  ]);
}
/** "gurgaon" -> "Gurgaon", "navi-mumbai" -> "Navi Mumbai". */
export function titleCaseSlug(slug) {
  return slug.replace(/-/g, " ").replace(/\b\w/g, (m) => m.toUpperCase());
}

/**
 * Turns a stored HTML fragment into plain text.
 *
 * Several columns hold editor output rather than plain strings —
 * `business_summary` comes back as `<p>RO Care India Is One Of The Trusted
 * &amp; Independent…</p>`, and `cat_desc` is the same. Rendered as text the
 * tags and entities showed through, so strip them where a short summary or a
 * meta description is wanted.
 */
export function stripHtml(value) {
  if (value === null || value === undefined) return undefined;

  const text = String(value)
    .replace(/<br\s*\/?>/gi, " ")
    .replace(/<\/(p|div|li|h[1-6])>/gi, " ")
    .replace(/<[^>]*>/g, "")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&quot;/gi, '"')
    .replace(/&#0?39;|&apos;|&rsquo;/gi, "'")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/\s+/g, " ")
    .trim();

  return text || undefined;
}
