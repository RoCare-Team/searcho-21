import "server-only";
import mysql from "mysql2/promise";
/**
 * Connection to the live Searcho21 MySQL database.
 *
 * The frontend reads the same tables the existing Laravel app writes; it never
 * creates or migrates anything. With the connection variables absent the site
 * renders empty — there is no bundled dataset standing in for the real thing.
 */
/**
 * Connection settings.
 *
 * `SEARCHO21_DB_*` is preferred, but the Laravel `DB_*` names are accepted too
 * so the existing app's .env can be pasted across unchanged.
 */
const env = process.env;
const DB_HOST = env.SEARCHO21_DB_HOST || env.DB_HOST;
const DB_USER = env.SEARCHO21_DB_USER || env.DB_USERNAME;
const DB_PASSWORD = env.SEARCHO21_DB_PASSWORD ?? env.DB_PASSWORD;
const DB_NAME = env.SEARCHO21_DB_NAME || env.DB_DATABASE;
const DB_PORT = env.SEARCHO21_DB_PORT || env.DB_PORT;
export function isDbConfigured() {
  return Boolean(DB_HOST && DB_USER && DB_NAME);
}

function getPool() {
  if (!globalThis.__searcho21Pool) {
    globalThis.__searcho21Pool = mysql.createPool({
      host: DB_HOST,
      port: DB_PORT ? Number(DB_PORT) : 3306,
      user: DB_USER,
      password: DB_PASSWORD,
      database: DB_NAME,
      waitForConnections: true,
      connectionLimit: 10,
      // The schema stores dates as strings; keep them as-is rather than letting
      // the driver build Date objects that then differ between server and client.
      dateStrings: true,
    });
  }
  return globalThis.__searcho21Pool;
}
/** Failures that mean the server never answered, not that the SQL was wrong. */
const CONNECTION_ERRORS = new Set([
  "ECONNREFUSED",
  "ETIMEDOUT",
  "ENOTFOUND",
  "EHOSTUNREACH",
  "PROTOCOL_CONNECTION_LOST",
]);

/**
 * Failures where the server answered and turned us away: wrong credentials, no
 * grant for this client's IP, or a database that is not there. Handled like an
 * outage — every query returns null — but they call for the opposite advice, so
 * they are kept apart from CONNECTION_ERRORS rather than folded into it.
 */
const REJECTED_ERRORS = new Set(["ER_ACCESS_DENIED_ERROR", "ER_BAD_DB_ERROR"]);

/** How long to stop dialling after the server refuses a connection. */
const BACKOFF_MS = 10_000;

// Rendering a page runs a dozen or more queries. Without a breaker each one
// dials a dead server and logs its own stack trace, so a single unreachable
// database turned into sixteen identical errors in the dev overlay.
let downUntil = 0;
let reportedDown = false;
// Which of the two the last failure was, so the UI can say which one it is
// looking at long after the warning scrolled out of the terminal.
let lastFailure = null;

function noteUnavailable(error) {
  downUntil = Date.now() + BACKOFF_MS;
  lastFailure = REJECTED_ERRORS.has(error.code) ? "rejected" : "unreachable";
  if (reportedDown) return;

  reportedDown = true;
  // A rejected login and an unanswered dial look the same from here — empty
  // pages — but the fix is nowhere near the same, so say which one happened.
  const advice = REJECTED_ERRORS.has(error.code)
    ? `${DB_HOST}:${DB_PORT ?? 3306} answered and refused the login, so the host is ` +
      `reachable. Check the credentials, that ${DB_NAME} exists, and that ${DB_USER} is ` +
      `granted from this machine's public IP — remote MySQL access is allowed per-IP on ` +
      `most hosting panels, and a laptop's IP usually is not on that list.`
    : `${DB_HOST}:${DB_PORT ?? 3306} did not answer. Pages render empty until it does. ` +
      `If MySQL only listens on the hosting server, open an SSH tunnel or point the host ` +
      `at a remote-accessible address.`;
  // warn, not error: this condition is handled — callers render empty states and
  // DataSourceNotice explains it in the UI. Logging it as an error made Next's
  // dev overlay pop up over the page for a problem the page already reports.
  console.warn(
    `[searcho21] database unavailable (${error.code ?? "error"}: ${error.message}). ${advice}`,
  );
}

/**
 * Runs a read query and returns its rows, or null when the data is unavailable.
 *
 * An unreachable database must not take the page down, so callers get null and
 * render their empty states. Connection failures are reported once and then
 * back off; genuine SQL errors are always logged, since those are bugs.
 */
export async function query(sql, params = []) {
  if (!isDbConfigured()) return null;
  if (Date.now() < downUntil) return null;

  try {
    const [rows] = await getPool().execute(sql, params);
    // Recovered — log the next outage again.
    reportedDown = false;
    downUntil = 0;
    lastFailure = null;
    return rows;
  } catch (error) {
    if (CONNECTION_ERRORS.has(error.code) || REJECTED_ERRORS.has(error.code)) {
      noteUnavailable(error);
    } else {
      console.error("[searcho21] query failed:", error.message, "\n", sql);
    }
    return null;
  }
}
/** Convenience for queries expected to return at most one row. */
export async function queryOne(sql, params = []) {
  const rows = await query(sql, params);
  return rows && rows.length > 0 ? rows[0] : null;
}

/**
 * Whether the database is configured, and whether it actually answers.
 *
 * "configured but not answering" is its own state: the credentials are present
 * so nothing warns about missing env, yet every query returns empty. Naming it
 * is what makes an empty site explainable — and "rejected" is split from
 * "unreachable" because one is fixed in the hosting panel and the other in
 * .env.local, and guessing wrong sends you looking in the wrong place.
 *
 * @returns {Promise<"not-configured" | "connected" | "rejected" | "unreachable">}
 */
export async function getDataSourceStatus() {
  if (!isDbConfigured()) return "not-configured";
  const rows = await query("SELECT 1 AS ok");
  if (rows) return "connected";
  return lastFailure === "rejected" ? "rejected" : "unreachable";
}
