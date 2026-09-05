/**
 * EXACT row shapes of the live Searcho21 database, as JSDoc typedefs.
 *
 * These mirror the tables used by the existing Laravel app in
 * `Controllers/Controllers/*.php`, column for column. Nothing here is invented:
 * every field was taken from the controllers' inserts, updates and selects.
 *
 * Editors read these typedefs for autocomplete and hints; nothing is enforced at
 * build time, so treat them as the schema reference they are.
 *
 * MySQL returns "0"/"1" flags as strings in this codebase, so `status` is a
 * string rather than a boolean.
 */

/**
 * locality_tb — the first URL segment, e.g. "gurgaon".
 * @typedef {object} LocalityRow
 * @property {number} id
 * @property {string} locality_name
 * @property {string} locality_url  URL segment, matched by WebController::locality_or_category()
 * @property {number|null} city_id
 * @property {number|null} state_id
 * @property {string} status
 * @property {string} [city_name]   joined from mb_city_tb
 * @property {string} [state_name]  joined from mb_state_tb
 */

/**
 * category_tb — second URL segment, e.g. "home-appliance".
 * @typedef {object} CategoryRow
 * @property {number} id
 * @property {string} cat_name
 * @property {string} cat_url
 * @property {string|null} cat_title
 * @property {string|null} cat_desc
 * @property {string|null} cat_icon
 * @property {string|null} cat_image  filename under assets/category/
 * @property {string|null} cat_meta_title
 * @property {string|null} cat_meta_description
 * @property {string|null} cat_meta_keyword
 * @property {string} status
 */

/**
 * category_level_one_tb — third URL segment, e.g. "water-purifier".
 * @typedef {object} CategoryLevelOneRow
 * @property {number} id
 * @property {number} category_id
 * @property {string} cat_level_one_name
 * @property {string} cat_level_one_url
 * @property {string|null} cat_level_one_description
 * @property {string|null} cat_level_one_icon
 * @property {string|null} cat_level_one_image
 * @property {string|null} cat_level_one_meta_title
 * @property {string|null} cat_level_one_meta_description
 * @property {string|null} cat_level_one_meta_keyword
 * @property {string} status
 */

/**
 * category_level_two_tb — fourth URL segment, e.g. "service".
 * @typedef {object} CategoryLevelTwoRow
 * @property {number} id
 * @property {number} category_id
 * @property {number} cat_level_one_id
 * @property {string} cat_level_two_name
 * @property {string} cat_level_two_url
 * @property {string|null} cat_level_two_description
 * @property {string|null} cat_level_two_icon
 * @property {string|null} cat_level_two_image
 * @property {string|null} cat_level_two_meta_title
 * @property {string|null} cat_level_two_meta_description
 * @property {string|null} cat_level_two_meta_keyword
 * @property {string} status
 */

/**
 * category_level_three_tb — fifth URL segment, e.g. "kent-ro-service".
 * @typedef {object} CategoryLevelThreeRow
 * @property {number} id
 * @property {number} category_id
 * @property {number} cat_level_one_id
 * @property {number} cat_level_two_id
 * @property {string} cat_level_three_name
 * @property {string} cat_level_three_url
 * @property {string|null} cat_level_three_description
 * @property {string|null} cat_level_three_icon
 * @property {string|null} cat_level_three_image
 * @property {string|null} cat_level_three_meta_title
 * @property {string|null} cat_level_three_meta_description
 * @property {string|null} cat_level_three_meta_keyword
 * @property {string} status
 */

/**
 * location_category_mapping_tb — per-URL SEO record.
 *
 * One row per (locality, category, L1, L2, L3) combination. A level that does
 * not apply is stored as 0, which is how the controllers detect page depth
 * (`->where('cat_level_one_id', 0)` selects the category-level page). This is
 * where the long-form copy for every landing page lives.
 *
 * @typedef {object} LocationCategoryMappingRow
 * @property {number} id
 * @property {number} locality_id
 * @property {number} category_id
 * @property {number} cat_level_one_id
 * @property {number} cat_level_two_id
 * @property {number} cat_level_three_id
 * @property {string|null} url
 * @property {string|null} meta_title
 * @property {string|null} meta_description
 * @property {string|null} meta_keyword
 * @property {string|null} content_text  long-form page copy, stored as HTML
 */

/**
 * free_listing_tb — a business listing.
 *
 * @typedef {object} FreeListingRow
 * @property {number} id
 * @property {number|null} user_id
 * @property {string} business_name
 * @property {string} listing_url        slug used in /business/[listing_url]/[id]
 * @property {string|null} physical_address
 * @property {string|null} physical_address_two
 * @property {string|null} state
 * @property {string|null} city
 * @property {string|null} locality
 * @property {string|null} pincode
 * @property {string|null} mobile_no
 * @property {string|null} whatsapp
 * @property {string|null} email
 * @property {string|null} website
 * @property {string|null} estb_year
 * @property {string|null} gst_number
 * @property {string|null} pan_number
 * @property {string|null} business_summary
 * @property {string|null} cont_person
 * @property {string|null} cont_person_email
 * @property {string|null} cont_person_mobile
 * @property {string|null} designation
 * @property {string|null} meta_title
 * @property {string|null} meta_desc
 * @property {string|null} meta_keyword
 * @property {string|null} logo_img       filename under assets/logo_img/
 * @property {string|null} banner_image   filename under assets/banner_image/
 * @property {string|null} closing_time   JSON: { Monday: "...", ... }
 * @property {string|null} socale_links   JSON: { Facebook: url, ... } — note the DB spelling
 * @property {number} views               incremented by WebController::free_listing_inner()
 * @property {number} listing_order       higher sorts first
 * @property {string} status
 * @property {string} [verified_status]   "1" shows the green Verified badge
 */

/**
 * free_listing_category_location_maping_tb — note the DB's single "p" spelling.
 * @typedef {object} FreeListingCategoryLocationMappingRow
 * @property {number} id
 * @property {number} free_listing_id
 * @property {number} locality_id
 * @property {number} category_id
 * @property {number} cat_level_one_id
 * @property {number} cat_level_two_id
 * @property {number} cat_level_three_id
 */

/**
 * gallery_images_tb — filenames under assets/gallery_image/.
 * @typedef {object} GalleryImageRow
 * @property {number} id
 * @property {number} free_listing_id
 * @property {string} image
 */

/**
 * keyword_tb — searchable service keywords.
 * @typedef {object} KeywordRow
 * @property {number} id
 * @property {string} keyword_name
 * @property {number|null} category_id
 * @property {number|null} cat_level_one_id
 * @property {number|null} cat_level_two_id
 * @property {number|null} cat_level_three_id
 */

/**
 * vendor_business_keyword_tb — keywords attached to a listing.
 * @typedef {object} VendorBusinessKeywordRow
 * @property {number} id
 * @property {number} free_listing_id
 * @property {number} keyword_id
 * @property {string} [keyword_name]
 */

export {};
