/**
 * Page scaffolding for the SEO landing URLs, e.g.
 *   /gurgaon/home-appliance/water-purifier/service/kent-ro-service
 *
 * The real copy lives in `location_category_mapping_tb` — its `meta_title`,
 * `meta_description` and `content_text` are passed in as `mapping` and always
 * win. What is built here is the fallback headline and section structure for
 * URLs the admin panel has not authored yet, composed from the category names
 * the database returns.
 *
 * Nothing invented sits here: no prices (the schema has no price column) and no
 * ratings (it has no reviews table).
 */
const benefits = [
  {
    title: "Verified service providers",
    description:
      "Listings carry a verification badge once the business details have been checked, so you know who you are calling.",
  },
  {
    title: "Doorstep service",
    description:
      "Providers attend the request at your address, so the appliance does not have to be carried to a service centre.",
  },
  {
    title: "Compare before you book",
    description:
      "Check the service areas, working hours and charges of several providers on one page and choose the one that suits you.",
  },
  {
    title: "Support on call",
    description:
      "Reach the Searcho21 helpline on 9311587725 for help with finding or booking a provider in your city.",
  },
];
const howItWorks = [
  {
    title: "Tell us what you need",
    description:
      "Share the appliance, the problem and your locality through the enquiry form or over a call.",
  },
  {
    title: "Get matched with providers",
    description:
      "Nearby providers who handle that brand and service type receive your requirement.",
  },
  {
    title: "Compare quotes",
    description:
      "Providers call back with their charges and availability so you can compare before committing.",
  },
  {
    title: "Book the visit",
    description:
      "Confirm the provider you prefer and the technician attends the job at your doorstep.",
  },
];
function faqsFor(brandName, serviceLabel, cityName, subCategoryName) {
  return [
    {
      question: `How do I book ${brandName} ${serviceLabel.toLowerCase()} in ${cityName}?`,
      answer: `Choose a provider from the list on this page and use Call, WhatsApp or Get Quote to reach them directly. You can also call 9311587725 and the Searcho21 team will connect you with a provider in ${cityName}.`,
    },
    {
      question: `What does ${brandName} ${serviceLabel.toLowerCase()} cost in ${cityName}?`,
      answer:
        "Charges depend on the model, the parts that need replacing and the provider. Ask two or three providers for a quote before booking — every listing has Call, WhatsApp and Get Quote.",
    },
    {
      question: `Are the ${subCategoryName.toLowerCase()} providers listed on this page verified?`,
      answer:
        "Listings marked with the green Verified badge have had their business details checked. Unverified listings are shown without the badge so you can tell the difference.",
    },
    {
      question: "How soon can a technician visit?",
      answer: `Most providers in ${cityName} offer a same-day or next-day visit depending on their schedule and your locality. Confirm the slot with the provider when you call.`,
    },
    {
      question: `Do providers service all ${brandName} models?`,
      answer: `Providers listed under ${brandName} handle the common domestic models. If you have a commercial or older unit, mention the model number when you enquire so the provider can confirm before the visit.`,
    },
  ];
}
/**
 * Opening paragraph for the long-form block. Written per subcategory so an AC
 * page does not inherit water-purifier wording (and vice versa).
 */
function openingParagraph(subCategory, cityName) {
  switch (subCategory.slug) {
    case "water-purifier":
      return `A water supply that carries dissolved impurities puts a steady load on a water purifier, and the filters inside it collect that residue over time. Regular servicing keeps those filters clean so the unit keeps working at the efficiency it was built for, which is why households in ${cityName} book a service at fixed intervals rather than waiting for a fault.`;
    case "ac":
      return `An air conditioner loses cooling efficiency as its filters and coils collect dust through the season, and a unit that is low on gas works harder for the same result. A service before the summer, and a check afterwards, keeps the running cost down and catches faults early — which is why households in ${cityName} book servicing on a schedule.`;
    default:
      return `Booking the right professional matters more than booking quickly. Providers listed here in ${cityName} show the areas they cover and the work they take on, so you can match the job to someone who does it regularly rather than calling the first number you find.`;
  }
}
/**
 * Builds the SEO page payload. Replace the body of this function with an API
 * call once the backend exposes the stored per-page copy — the return shape is
 * what every component on the page consumes.
 */
export function buildServicePageContent({ city, mapping, subCategory, serviceType, brand }) {
  const cityName = city.name;
  // UI label (e.g. "Routine & Repair Service") vs. the SEO phrase (e.g. "RO Repair Service").
  const serviceLabel = serviceType.name;
  const seoLabel = serviceType.seoName ?? serviceType.name;
  /**
   * The full search phrase, e.g. "Kent RO Repair Service".
   *
   * The level-three name in the database is already a complete phrase
   * ("Kent RO Repair Service"), so appending the level-two name would repeat
   * it — "Kent RO Repair Service Repair Service".
   */
  /**
   * Joins two parts of a phrase unless the first already contains the second.
   *
   * The database's names overlap: level three is "Kent RO Repair Service" and
   * its level-two parent is "Repair Service", so a plain join produces
   * "Kent RO Repair Service Repair Service". Same for "RO Plant Service" under
   * the "RO Plant" subcategory.
   */
  const join = (lead, tail) =>
    lead.toLowerCase().includes(tail.toLowerCase()) ? lead : `${lead} ${tail}`;

  // Without the subcategory the phrase loses the product entirely — a page about
  // water purifier repair read as just "Repair Service".
  const brandPhrase = brand?.name ?? "";
  const phrase = brand ? join(brandPhrase, seoLabel) : join(subCategory.name, seoLabel);
  const shortSubject = brand ? brand.name : subCategory.name;
  const h1 = `${phrase} in ${cityName}`;
  const title = `${phrase} in ${cityName} @9311587725`;
  const metaDescription = `Searcho21 is one solution for all ${phrase} needs. You can browse ${phrase} providers in ${cityName} and choose from a wide variety.`;
  const intro = `Find and compare ${phrase.toLowerCase()} providers in ${cityName}. Every listing shows the provider's locality, the brands they handle and how to reach them, so you can pick the one nearest to you and book a doorstep visit.`;
  const sections = [
    {
      heading: `${phrase} in ${cityName} — a complete solution at your doorstep`,
      paragraphs: [
        openingParagraph(subCategory, cityName),
        `Searcho21 lists ${shortSubject} ${serviceLabel.toLowerCase()} providers across ${cityName} in one place. Each listing carries the provider's address, service areas and contact option, so you can shortlist by locality and reach the provider directly instead of searching one business at a time.`,
      ],
    },
    {
      heading: `${shortSubject} service centre — what to check before you book`,
      paragraphs: [
        `Before you hire a ${shortSubject.toLowerCase()} technician, check whether the listing is verified, which localities it covers, and ask for the charges upfront. Confirm whether the quote covers only the visit or includes the parts, and whether the provider offers a warranty on replaced components.`,
        `Providers on this page cover both individual service visits and annual maintenance contracts. If the appliance needs servicing several times a year, an AMC usually works out cheaper than booking each visit separately — ask the provider for both options when they call back.`,
      ],
    },
    {
      heading: `${phrase} near me in ${cityName}`,
      paragraphs: [
        `To find a provider close to you, use the locality filter on this page or pick a locality from the service areas listed on each card. Providers based nearer to your address can usually offer an earlier slot and a lower visit charge.`,
        `If you would rather not compare listings yourself, submit the enquiry form with your requirement and locality. Providers who cover that area in ${cityName} will call you back with their availability and charges.`,
      ],
    },
  ];
  return {
    // Stored SEO copy takes precedence over the generated fallback.
    title: mapping?.meta_title?.trim() || title,
    metaDescription: mapping?.meta_description?.trim() || metaDescription,
    // location_category_mapping_tb carries per-city keywords; where a row has
    // none, fall back to the category node the page is built from.
    keywords: mapping?.meta_keyword?.trim() || brand?.keywords || serviceType.keywords,
    h1,
    intro,
    contentHtml: mapping?.content_text ?? null,
    benefits,
    howItWorks,
    sections,
    faqs: faqsFor(shortSubject, seoLabel, cityName, subCategory.name),
  };
}
