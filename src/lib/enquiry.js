import "server-only";
import { query } from "@/lib/db";

/**
 * The "Submit your Request" popup — WebController::save_enquiry().
 *
 * Writes to `enquiry_tb`, which stores only these columns:
 *
 *   name, mobile, email, address,
 *   category_id, cat_level_one_id, cat_level_two_id, cat_level_three_id,
 *   locality_id
 *
 * The live form also asks for a pin code, state, city and the kind of work
 * wanted, and then drops all four on save because there is nowhere to put them.
 * Rather than lose what someone typed, those are folded into `address` — a real
 * column — so a lead arrives complete without altering the schema the Laravel
 * app also writes to.
 */

/** The CRM the live handler forwards every lead to. */
const CRM_URL = process.env.CRM_LEAD_URL ?? "https://www.rocareindia.net/popup/get_popup_data.php";
const CRM_BRAND = process.env.CRM_BRAND ?? "10";
const CRM_SOURCE = "searcho21";

/**
 * Builds the address line, keeping every location detail the form collected.
 * Empty parts are dropped so a sparse answer does not become ", , ,".
 */
function composeAddress({ house, road, landmark, city, state, pincode, workType }) {
  const location = [house, road, landmark, city, state, pincode]
    .map((part) => String(part ?? "").trim())
    .filter(Boolean)
    .join(", ");

  const work = String(workType ?? "").trim();
  return work ? `${location}${location ? " — " : ""}${work}` : location;
}

/**
 * Forwards the lead to the RO Care CRM, as save_enquiry does.
 *
 * A CRM failure must not lose the enquiry: the row is already saved by the time
 * this runs, and its result only decides what the log says.
 */
async function forwardToCrm({ name, email, mobile }) {
  try {
    const response = await fetch(CRM_URL, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        name,
        email,
        mobile,
        brand: CRM_BRAND,
        ld_source: CRM_SOURCE,
        hiddn_field: "https://www.searcho21.com",
      }),
      cache: "no-store",
    });
    return response.ok;
  } catch {
    return false;
  }
}

/**
 * Validates and saves one enquiry.
 *
 * The three checks are the live handler's, in its order and wording, so a
 * visitor sees the same messages on either site.
 */
export async function saveEnquiry(form) {
  const name = String(form.name ?? "").trim();
  const mobile = String(form.mobile ?? "").replace(/\D/g, "");
  const email = String(form.email ?? "").trim();

  const address = composeAddress(form);

  if (!name) return { ok: false, message: "Please enter your name." };
  if (mobile.length !== 10) return { ok: false, message: "Please enter a 10 digit mobile number." };
  if (!address) return { ok: false, message: "Please enter your address." };

  const saved = await query(
    `INSERT INTO enquiry_tb
       (name, mobile, email, address, category_id, cat_level_one_id,
        cat_level_two_id, cat_level_three_id, locality_id, created_at)
     VALUES (?, ?, ?, ?, ?, 0, 0, 0, 0, NOW())`,
    [name, mobile, email, address, Number(form.categoryId) || 0],
  );

  if (!saved) return { ok: false, message: "Could not save your request. Please try again." };

  await forwardToCrm({ name, email, mobile });
  return { ok: true, message: "Thank you. Our team will contact you shortly." };
}
