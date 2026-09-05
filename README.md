# Searcho21 — Frontend

Next.js 15 (App Router) rebuild of the Searcho21 frontend, written in **JavaScript
(.js / .jsx)**. **UI only** — the existing
business logic, database and backend are untouched, and every existing SEO URL still
resolves.

```bash
npm install
npm run dev      # http://localhost:3000
npm run build
npm run format   # prettier
```

Path alias `@/*` → `src/*` is configured in `jsconfig.json`. Shapes are
documented as JSDoc `@typedef` blocks in `src/lib/types.js` and
`src/lib/db-types.js` — editors read them for autocomplete, but nothing is
checked at build time, so the schema reference there is worth keeping accurate.

## URL structure (unchanged)

Routes were derived from the live site's sitemap index (`/sitemap.xml` → 13 sub-sitemaps)
and mirror it exactly:

| Route | File |
| --- | --- |
| `/` | `src/app/page.jsx` |
| `/[city]` | `src/app/[city]/page.jsx` |
| `/[city]/[category]` | `src/app/[city]/[category]/page.jsx` |
| `/[city]/[category]/[subcategory]` | `.../[subcategory]/page.jsx` |
| `/[city]/[category]/[subcategory]/[servicetype]` | `.../[servicetype]/page.jsx` |
| `/[city]/[category]/[subcategory]/[servicetype]/[brand]` | `.../[brand]/page.jsx` |
| `/business/[slug]/[id]` | `src/app/business/[slug]/[id]/page.jsx` |

Verified live examples that render:

```
/gurgaon
/gurgaon/home-appliance/water-purifier
/gurgaon/home-appliance/water-purifier/service/kent-ro-service
/gurgaon/home-appliance/water-purifier/installation/kent-ro-installation
/gurgaon/home-appliance/water-purifier/dealer/kent-ro-dealer
/gurgaon/home-appliance/ac/repair-service/voltas-service
/gurgaon/home-appliance/ac/ac-dealer/voltas-dealer
/business/ahuja-ac-repair-services-dlf-city-phase-3-gurgaon-haryana/22
```

Static routes (`/about-us`, `/business/...`, etc.) take precedence over `/[city]`, and an
unknown city slug returns a 404 rather than rendering an empty page.

## Connecting the backend

The data layer reads the **live MySQL database** when it is configured, and the
sample rows in `src/data` when it is not. Same return shapes either way, so no
component knows which is in play.

```
src/lib/db.js          connection pool + safe query helpers (server-only)
src/lib/repository.js  the actual SQL, one function per WebController query
src/lib/api.js         the single seam the UI reads
src/lib/db-types.js    exact row shapes of the live tables, as JSDoc typedefs
src/lib/mappers.js     DB rows -> view models (images, masked phone, JSON columns)
```

There is **no bundled dataset**. `src/data` is gone: cities, categories, the
level one/two/three nodes, brands, listings, gallery, keywords and the per-URL
SEO copy all come from MySQL. With the connection unconfigured the site renders
its empty states and shows a "Database not connected" banner, rather than
serving content that came from somewhere other than the database.

To go live, put the connection in `.env.local` and restart. The Laravel `DB_*`
names are accepted, so the existing app's .env can be pasted across unchanged:

```
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=searcho21
DB_USERNAME=searcho21_new
DB_PASSWORD=...
```

**`127.0.0.1` only works when the frontend runs on the same server as MySQL.**
From a laptop it refuses the connection; use an SSH tunnel
(`ssh -L 3306:127.0.0.1:3306 user@server`), a host that accepts remote
connections, or import a dump locally. `DataSourceNotice` tells the three states
apart — not configured, configured but unreachable, connected — so an empty site
is never mistaken for a broken build.

Reads only — the frontend never writes to or migrates these tables. A configured
but unreachable database logs the error and renders empty rather than taking the
page down.

### When the database is down

Rendering a page runs a dozen or more queries. Without a breaker each one dials
the dead server and logs its own stack trace, so a single unreachable database
showed up as sixteen identical errors in the dev overlay. `query()` now reports
a connection failure once as a **warning**, backs off for ten seconds, and
returns null in the meantime. It is a warning rather than an error because the
condition is handled — callers render empty states and `DataSourceNotice`
explains it in the UI — and logging it as an error made Next's dev overlay cover
the page for a problem the page already reports. Genuine SQL errors are still
logged as errors every time, because those are bugs. A successful query clears
the state so the next outage is reported again.

### Nothing hardcoded

Every piece of content comes from the database. The things that used to be typed
into `src/data` are gone, and so are the lists that were inlined in components:

| Was hardcoded | Now |
| --- | --- |
| 51 cities | `locality_tb` joined to `mb_city_tb` / `mb_state_tb` |
| category tree, brands | `category_tb` + `category_level_one/two/three_tb` |
| sample listings | `free_listing_tb` + its mapping, gallery and keyword tables |
| SEO page copy, price table | `location_category_mapping_tb`; the price rows are gone — no price column exists |
| hero banners | any `uploads/templates/<level-one-slug>.png` that exists |
| footer popular services | first level-two services in taxonomy order |
| default city | the visitor's `s21_city` cookie |
| search index | built from the category tree at request time |

What stays in code is site chrome, not data — nav links, the "how it works"
steps, contact channels, FAQs and legal pages. None of those exist as tables in
the schema.

### Tables in play

| Table | Used for |
| --- | --- |
| `locality_tb` | first URL segment (`locality_url`) |
| `category_tb` | second segment (`cat_url`) |
| `category_level_one_tb` | third segment (`cat_level_one_url`) |
| `category_level_two_tb` | fourth segment (`cat_level_two_url`) |
| `category_level_three_tb` | fifth segment (`cat_level_three_url`) |
| `location_category_mapping_tb` | per-URL `meta_title`, `meta_description`, `content_text` |
| `free_listing_tb` | business listings |
| `free_listing_category_location_maping_tb` | listing → locality/category mapping |
| `gallery_images_tb` | profile gallery |
| `vendor_business_keyword_tb` + `keyword_tb` | services shown on a listing |

Route ↔ controller mapping, for reference:

| Route | `WebController` method |
| --- | --- |
| `/[city]` | `locality_or_category()` |
| `/[city]/[category]` | `locality_category()` |
| `/[city]/[category]/[sub]` | `locality_category_categorylone()` |
| `/[city]/[category]/[sub]/[type]` | `locality_category_categoryltwo()` |
| `/[city]/[category]/[sub]/[type]/[brand]` | `locality_category_categorylthree()` |
| `/business/[slug]/[id]` | `free_listing_inner()` |

### There are no reviews or ratings

The schema has no reviews or ratings table anywhere — the models are
`category_*`, `locality_tb`, `free_listing_tb`, `gallery_images_tb`,
`keyword_tb`, `enquiry_*`, `user_tb` and friends. Listings store `views`,
`listing_order`, `status` and `verified_status`.

So the UI shows **no stars and no review counts**, and `localBusinessJsonLd()`
emits **no `aggregateRating`** — publishing one without stored reviews is
structured-data spam and risks a manual action. The real `views` counter and the
green Verified badge (`verified_status = "1"`) are shown instead. If a reviews
table is added later, the card and profile have room for it.

### Images

Two storage roots, both real, resolved by `assetUrl()` in `src/lib/mappers.js`.

**`assets/`** — written by the Laravel app, one filename per DB column:

| Folder | Column | Count |
| --- | --- | --- |
| `logo_img` | `free_listing_tb.logo_img` | 148 |
| `banner_image` | `free_listing_tb.banner_image` | 99 |
| `gallery_image` | `gallery_images_tb.image` | 343 |
| `category` | `cat_image` / `cat_level_*_image` | 173 |

**`uploads/`** — the shared media library, copied into `public/uploads` (359 images):

| Folder | Used for | Count |
| --- | --- | --- |
| `brand_image` | appliance brand logos, mapped to the level-three brands | 112 |
| `others` | orange line-icon set used for category cards | 120 |
| `banner_image`, `slides_image`, `slider_image`, `home_pages` | marketing artwork, available but not yet placed | 80 |
| `logo_image`, `vendor_logo_image`, `category_image`, `sub_category_image` | additional logos | 47 |
| `templates` | designed 16:9 category banners used by the hero | 5 |

Brand logos are mapped by name in the category tables — Kent `brand_295.png`,
Aquaguard / Eureka Forbes `brand_296.jpg`, Pureit `brand_302.png`, Livpure
`brand_299.png`, Aquasure `brand_297.png`, AO Smith `brand_353.png`, Blue Star
`brand_307.png`, Havells `brand_357.jpg`, LG `brand_333.png`, Mi `brand_358.png`,
Voltas `brand_308.png`, Samsung `brand_383.png`, Hitachi `brand_384.png`.
Aquafresh has no logo in the library and falls back to its `assets/category` image.

**Why card icons do not use `assets/category`:** most files in that folder are
white-on-white line art that renders blank at icon size, and the rest are
photographs rather than icons. Card icons therefore use the `uploads/others`
orange set where a match exists (water purifier, air conditioner, RO plant, sofa
cleaning) and a matching line icon otherwise. The `cat_image` columns are still
carried in the data model for larger placements.

Only image files were copied — `uploads/` also contains `.php` files
(`sub_category_image/aclass.api.php`, `file_products/…/index.php`), which are never
copied into `public/` and are worth checking on the source server.

### Hero

Deliberately short — heading, search and the banner row all sit above the fold
(≈355px tall on desktop, down from ≈765px in an earlier pass). Left-aligned
one-line heading, search directly beneath it, then the category banner row
(`HeroTiles`) — four visible on desktop with the fifth peeking, sliding
horizontally for the rest.

The banners are the designed 16:9 templates in `uploads/templates`. They already
carry the category name typeset into the artwork, so the tile adds **no scrim and
no caption** — an overlay would just repeat the label and dull the design. The
name goes into `alt` instead, because it is text baked into an image.

The row is a slider (`HeroTiles`, the one client component in the hero) with dot
pagination underneath: four banners per page on desktop, two on tablet, one on
phones. Items are sized as exact fractions of the track
(`lg:w-[calc((100%-3rem)/4)]`) so no banner is left half-visible at the edge.

Page count comes from how many items fit per view, not `scrollWidth /
clientWidth` — the gaps inflate scrollWidth, so that ratio over-counts (five
one-up slides measured 5.14 and rounded to six dots). The active dot is derived
from scroll progress against `maxScroll`, because the browser clamps the last
page short of `page * clientWidth` and a naive division would keep the first dot
lit on the final slide.

The banners keep the artwork's 16:9 ratio: cropping them taller to gain height
cuts the typeset labels ("WATER PURIFIER" became "ATER URIFIER").

Each banner is a plain link to the same page as its matching category tile
further down — no hover zoom and no arrow overlay, just a shadow so it still
reads as clickable.

No badge, no sub-paragraph and no headline counter: the reference layouts this
was modelled on lead with a listing count, and the frontend has no honest number
to put there. Nothing here shows ratings, review counts or "from ₹" prices —
none of those exist in the schema.

### Category tiles

`CategoryTile` renders the dense category grids on the homepage and city pages —
artwork in a rounded square, label underneath. Twelve level-one categories
(Water Purifier, Air Conditioner, Gym, Salon, …) in two rows of six, rather than
the seven broad parents, so the grid matches how people actually search.
The homepage grid carries no heading — the tiles are self-labelling and sit
directly under the hero, so a title and blurb above them only added noise. The
city page keeps its "Top categories in <city>" heading, where the city name is
worth stating. "All Categories" closes the grid as a dark trailing tile.

The grid runs the full page width, eight across. Gap and tile size are locked
together: with a fixed column count the space between tiles is just
`columnWidth - tileWidth`, so shrinking the tile widens the gap. Eight columns
with a 104px tile leaves ~59px between them; the original 72px tile in seven
columns left ~110px of dead space. Tiles are 72px on mobile.

Tile borders use `line-strong` (#d3d7de), not `line` (#e6e8ec) — the lighter
token is invisible between a white tile and the near-white canvas.

Icons prefer the orange line art in `uploads/others` where a match exists and
fall back to a matching Lucide stroke icon, both in brand orange, so the row
reads as one set. The wider `CategoryCard` remains for places where a
description earns its space.

### City selection

Every URL is city-scoped (`/[city]/...`), so a link cannot be built without a
city. Nothing picks one on the visitor's behalf: the chosen city lives in the
`s21_city` cookie, the header shows it (or "Select city"), and `CityLink` opens
the picker instead of guessing when none is set.

The cookie, not localStorage, because server components build these links. That
does mean the root layout reads `cookies()`, so `/`, `/[city]` and the static
content pages are now server-rendered per request rather than prerendered — the
deep SEO pages were already dynamic (they read `searchParams` for filters). The
alternative is to read the cookie in the browser and keep those pages static, at
the cost of the homepage shipping buttons rather than crawlable links.

### Popular services

`ServiceGroupCard` renders each category as a panel — the category name, then
its services as a photo with a label underneath, two panels per row. Items are
the level-two service types where a subcategory has them (RO Repair Service, RO
Installation, …) and the subcategory itself where it does not (Salon, Gym), taken
round-robin across subcategories so Home Appliance leads with both water purifier
and air conditioner instead of three water-purifier rows.

Items keep a fixed one-third width rather than stretching, so a panel with two
services lines up with one that has three. Services with no photograph in
`assets/img/category` (sofa cleaning, bathroom cleaning) fall back to their line
icon rather than an empty frame.

### Popular cities

Small photo tiles with the city name underneath, eight across, matching the
category grid's rhythm. Earlier these were large photo cards with the name burnt
into a dark gradient; the city photos are a mixed set — a washed-out monument, a
night market, an overcast street — so enlarging them and laying a scrim over each
made the row heavy and inconsistent with the rest of the page. Small, with the
label outside the frame and no scrim, they read as one set. The section went from
roughly 500px tall to 180px.

Only cities the media library has a photo for are shown; every other city stays
reachable from the header dropdown and the footer.

### Empty states

`EmptyListings` separates the two cases that look the same but need different
wording: results filtered away (offer a reset) versus nothing listed in that
city/category at all (offer the enquiry form and vendor sign-up). The filter bar
is hidden when there is nothing to filter and no filter is active, so a page with
no providers does not tell the visitor to clear filters they never set.

### Forms

`QuoteForm`, `VendorRegistrationForm` and `LoginForm` validate client-side but their submit
handlers are placeholders marked with `TODO`. Nothing is transmitted today; point them at
the existing enquiry / registration / OTP endpoints.

## SEO

- Per-page `title`, `description`, canonical, OpenGraph and robots via `buildMetadata()` in `src/lib/seo.js`
- JSON-LD: `BreadcrumbList` (all templates), `FAQPage` (SEO pages), `LocalBusiness` with
  `OpeningHoursSpecification`, `makesOffer` and `sameAs` (profiles), `Organization` +
  `WebSite` with `SearchAction` (root layout)
- No `aggregateRating` anywhere — see "There are no reviews or ratings" above
- Stored `meta_title` / `meta_description` (listing row, or location_category_mapping_tb)
  always win over the generated fallbacks
- `src/app/sitemap.js` walks the full taxonomy; `src/app/robots.js` disallows `/login`
- One `h1` per page, semantic `h2`/`h3` beneath it
- Titles follow the live site's pattern, e.g. `Kent RO Repair Service in Gurgaon @9311587725`

`ServiceType.seoName` holds the search phrase ("RO Repair Service") separately from the UI
label ("Routine & Repair Service"), so titles stay tight without making the interface terse.

## Design system

Tokens live in `src/app/globals.css` under `@theme` (Tailwind v4 — no `tailwind.config`).

| Role | Token |
| --- | --- |
| Primary action | `brand-500` / `brand-600` (orange) |
| Structure, headings | `navy-900` / `navy-700` |
| Page ground | `canvas` (off-white) |
| Cards | white on `line` borders |
| Text | `ink-900` body, `ink-500` secondary |
| Success / verification | `success-600` |

Conventions: `.shell` is the single page container (max-width 88rem, 1rem/1.5rem gutters); `.card` +
`.card-hover` are the only card treatments; hover is a 1px lift and nothing more.
Long-form copy (`ProseSection`, the stored `content_text` block) is capped at
`max-w-3xl` so the wide container never stretches body text past a readable
measure. Motion is
limited to a small fade, hover elevation and `<details>` accordions, and everything is
disabled under `prefers-reduced-motion`.

## Performance

Server Components by default. Client components are only `SearchBar`, `SearchSuggestions`,
`HeaderClient`, `FilterBar`, `FilterDrawer`, `ProfileTabs`, `QuoteDialog`, `RevealPhone` and
the three forms. FAQs use `<details>` so they need no JS, and profile tab panels are all
server-rendered and kept in the DOM (visibility toggled) so their content stays crawlable.
Shared first-load JS is ~102 kB.
