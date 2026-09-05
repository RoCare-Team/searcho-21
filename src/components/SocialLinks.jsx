import { Facebook, Instagram, Linkedin, Twitter, Youtube } from "lucide-react";
/** Icons for the keys stored in free_listing_tb.socale_links. */
const ICONS = {
  Facebook,
  Twitter,
  Instagram,
  LinkedIn: Linkedin,
  YouTube: Youtube,
};
export default function SocialLinks({ links }) {
  const entries = Object.entries(links ?? {}).filter(([key]) => key in ICONS);
  if (entries.length === 0) return null;
  return (
    <div>
      <h3 className="mb-2.5 text-[13px] font-semibold uppercase tracking-wide text-ink-400">
        Social profiles
      </h3>
      <ul className="flex flex-wrap gap-2">
        {entries.map(([key, href]) => {
          const Icon = ICONS[key];
          return (
            <li key={key}>
              <a
                href={href}
                target="_blank"
                rel="noopener noreferrer nofollow"
                className="inline-flex items-center gap-2 rounded-lg border border-line bg-white px-3 py-1.5 text-[13px] text-ink-700 transition-colors hover:border-line-strong hover:text-brand-600"
              >
                <Icon className="h-3.5 w-3.5 text-ink-400" aria-hidden />
                {key}
              </a>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
