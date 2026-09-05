import "server-only";
import fs from "node:fs/promises";
import path from "node:path";
/**
 * Category banners available in `public/uploads/templates`.
 *
 * The schema has no banner-per-category column, so the artwork is matched by
 * filename convention instead of a hardcoded map: `<level-one-slug>.png`. Drop
 * `mobile-repair.png` in that folder and the mobile repair banner appears; no
 * code change, nothing to keep in sync.
 */
const TEMPLATE_DIR = path.join(process.cwd(), "public", "uploads", "templates");
export async function getCategoryTemplates() {
  try {
    const files = await fs.readdir(TEMPLATE_DIR);
    return new Map(
      files
        .filter((file) => /\.(png|jpe?g|webp)$/i.test(file))
        .map((file) => [file.replace(/\.[^.]+$/, ""), file]),
    );
  } catch {
    // No templates folder deployed — the hero simply has no banners.
    return new Map();
  }
}
