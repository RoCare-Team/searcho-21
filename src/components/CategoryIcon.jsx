import {
  Armchair,
  Bath,
  Brush,
  Droplets,
  Dumbbell,
  Factory,
  Flower2,
  Hammer,
  HeartPulse,
  House,
  Laptop,
  Scissors,
  Smartphone,
  Sparkles,
  Stethoscope,
  Wind,
} from "lucide-react";

/**
 * Line icon for a category, chosen by its URL slug.
 *
 * The database's `cat_*_icon` columns hold photographs rather than icons, so a
 * dense tile grid built from them read as a wall of small pictures. Which glyph
 * represents a category is a presentation decision, not stored data, so the
 * mapping lives here — keyed by the slug the database already defines, so a new
 * category simply falls back to the generic icon rather than breaking.
 *
 * Slugs come from `category_tb.cat_url` and
 * `category_level_one_tb.cat_level_one_url`.
 */
const ICONS = {
  // Top-level categories
  "home-appliance": Hammer,
  "home-care": House,
  "fitness-care": Dumbbell,
  gadgets: Smartphone,
  "personal-care": Sparkles,
  "health-wellness": HeartPulse,
  industrial: Factory,

  // Level-one services
  "water-purifier": Droplets,
  ac: Wind,
  "sofa-cleaning": Armchair,
  "bathroom-cleaning": Bath,
  "yoga-at-home": Flower2,
  gym: Dumbbell,
  "mobile-repair": Smartphone,
  "laptop-repair": Laptop,
  makeup: Brush,
  salon: Scissors,
  "dental-clinic": Stethoscope,
  "ro-plant": Factory,
};

export default function CategoryIcon({ slug, className = "h-5 w-5" }) {
  const Icon = (slug && ICONS[slug]) || Hammer;
  return <Icon className={className} aria-hidden />;
}
