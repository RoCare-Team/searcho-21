/**
 * View models — the shapes components consume, as JSDoc typedefs.
 *
 * Every field here is derived from a real column in `./db-types.js`;
 * `./mappers.js` performs the conversion. Nothing that the live database does
 * not store appears in this file.
 *
 * Note: the Searcho21 schema has NO reviews, ratings or price tables, so
 * listings carry `views` (the real counter on free_listing_tb) instead.
 */

/**
 * A locality — the first URL segment.
 * @typedef {object} City
 * @property {string} slug          locality_tb.locality_url — must not change
 * @property {string} name          locality_tb.locality_name
 * @property {string} [city]        joined city_tb.city_name
 * @property {string} state         joined state_tb.state_name
 * @property {number} [id]          locality_tb.id, needed for mapping lookups
 * @property {string[]} [nearby]    sibling locality slugs
 * @property {string[]} [localities] sibling locality names
 * @property {string} [photo]       city photo (assets/img/city)
 * @property {boolean} [popular]
 */

/**
 * A level-two node (category_level_two_tb).
 * @typedef {object} ServiceType
 * @property {number} [id]
 * @property {string} slug          cat_level_two_url, e.g. "service"
 * @property {string} name          cat_level_two_name
 * @property {string} [seoName]     short phrase for SEO titles; falls back to name
 * @property {string} [description]
 * @property {string} [image]       cat_level_two_image
 * @property {string} [photo]       cat_level_two_icon — a service photo, despite the name
 */

/**
 * A level-one node (category_level_one_tb).
 * @typedef {object} SubCategory
 * @property {number} [id]
 * @property {string} slug          cat_level_one_url, e.g. "water-purifier"
 * @property {string} name
 * @property {string} [description]
 * @property {string} [icon]
 * @property {string} [image]       cat_level_one_image
 * @property {string} [photo]       cat_level_one_icon — a service photo, despite the name
 * @property {ServiceType[]} serviceTypes
 * @property {Brand[]} [brands]     level-three nodes, presented as brands
 */

/**
 * A top-level category (category_tb).
 * @typedef {object} Category
 * @property {number} [id]
 * @property {string} slug          cat_url, e.g. "home-appliance"
 * @property {string} name
 * @property {string} [description]
 * @property {string} [icon]
 * @property {string} [image]       cat_image
 * @property {SubCategory[]} subCategories
 */

/**
 * A level-three node, e.g. "kent-ro-service".
 *
 * The same brand appears under several level-two parents with a different
 * cat_level_three_url each, so slugs are keyed by the parent's slug.
 *
 * @typedef {object} Brand
 * @property {string} name
 * @property {Record<string, string>} slugs  { [serviceTypeSlug]: cat_level_three_url }
 * @property {string} [image]                cat_level_three_image
 * @property {string} [logo]                 brand logo from uploads/brand_image
 */

/**
 * @typedef {object} OpeningHour
 * @property {string} day
 * @property {string|null} hours  null means closed; from closing_time JSON
 */

/**
 * Parsed from free_listing_tb.socale_links (the DB's spelling).
 * @typedef {object} SocialLinks
 * @property {string} [Facebook]
 * @property {string} [Twitter]
 * @property {string} [Instagram]
 * @property {string} [LinkedIn]
 * @property {string} [YouTube]
 * @property {string} [Pinterest]
 * @property {string} [Snapchat]
 */

/**
 * @typedef {object} BusinessAddress
 * @property {string} [line1]
 * @property {string} [line2]
 * @property {string} [locality]
 * @property {string} [city]
 * @property {string} [citySlug]  locality_url, so cards can link to the city page
 * @property {string} [state]
 * @property {string} [pincode]
 */

/**
 * free_listing_tb, joined with its gallery and keywords.
 *
 * @typedef {object} Business
 * @property {string} id                 free_listing_tb.id
 * @property {string} slug               free_listing_tb.listing_url
 * @property {string} name               business_name
 * @property {boolean} verified          verified_status === "1"
 * @property {string} [summary]          business_summary
 * @property {BusinessAddress} address
 * @property {string} phoneMasked        mobile_no, masked until revealed
 * @property {string} [phone]
 * @property {string} [whatsapp]
 * @property {string} [email]
 * @property {string} [website]
 * @property {string} [establishedYear]  estb_year
 * @property {string} [contactPerson]    cont_person
 * @property {string} [designation]
 * @property {string} [gstNumber]
 * @property {string|null} [logoUrl]     resolved URL for logo_img
 * @property {string|null} [bannerUrl]   resolved URL for banner_image
 * @property {number} [views]            free_listing_tb.views
 * @property {OpeningHour[]} [openingHours]
 * @property {SocialLinks} [social]
 * @property {string[]} [keywords]       vendor_business_keyword_tb → keyword_name
 * @property {string[]} categories       category slugs, for filtering
 * @property {string[]} categoryLabels   chips shown on the card
 * @property {{ src: string, alt: string }[]} [gallery]
 * @property {string} [metaTitle]
 * @property {string} [metaDescription]
 */

/**
 * @typedef {object} FaqItem
 * @property {string} question
 * @property {string} answer
 */

/**
 * @typedef {object} SeoSection
 * @property {string} heading
 * @property {string[]} paragraphs
 */

/**
 * Content backing an SEO landing page.
 *
 * `title`, `metaDescription` and `contentHtml` come from
 * location_category_mapping_tb; the rest is layout the template supplies.
 *
 * @typedef {object} ServicePageContent
 * @property {string} title
 * @property {string} metaDescription
 * @property {string} h1
 * @property {string} [intro]
 * @property {string|null} [contentHtml]  location_category_mapping_tb.content_text
 * @property {{ title: string, description: string }[]} [benefits]
 * @property {{ title: string, description: string }[]} [howItWorks]
 * @property {SeoSection[]} sections
 * @property {FaqItem[]} faqs
 */

/**
 * @typedef {"relevance"|"views"|"name"} SortKey
 *   Mirrors the controllers: listing_order desc is the default.
 */

/**
 * @typedef {object} BusinessFilters
 * @property {boolean} [verifiedOnly]
 * @property {string} [serviceType]
 * @property {string} [category]
 * @property {string} [locality]
 * @property {SortKey} [sort]
 */

export {};
