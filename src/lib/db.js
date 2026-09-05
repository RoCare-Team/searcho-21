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
/** Failures that mean the server is unreachable, not that the SQL was wrong. */
const CONNECTION_ERRORS = new Set([
  "ECONNREFUSED",
  "ETIMEDOUT",
  "ENOTFOUND",
  "EHOSTUNREACH",
  "ER_ACCESS_DENIED_ERROR",
  "ER_BAD_DB_ERROR",
  "PROTOCOL_CONNECTION_LOST",
]);

/** How long to stop dialling after the server refuses a connection. */
const BACKOFF_MS = 10_000;

// Rendering a page runs a dozen or more queries. Without a breaker each one
// dials a dead server and logs its own stack trace, so a single unreachable
// database turned into sixteen identical errors in the dev overlay.
let downUntil = 0;
let reportedDown = false;

function noteConnectionFailure(error) {
  downUntil = Date.now() + BACKOFF_MS;
  if (reportedDown) return;

  reportedDown = true;
  // warn, not error: this condition is handled — callers render empty states and
  // DataSourceNotice explains it in the UI. Logging it as an error made Next's
  // dev overlay pop up over the page for a problem the page already reports.
  console.warn(
    `[searcho21] cannot reach the database (${error.code ?? "error"}: ${error.message}). ` +
      `Pages will render empty until it is reachable. ` +
      `A ${DB_HOST} host only works when this app runs on the same server as MySQL — ` +
      `otherwise open an SSH tunnel or point DB_HOST at a remote-accessible host.`,
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
    return rows;
  } catch (error) {
    if (CONNECTION_ERRORS.has(error.code)) {
      noteConnectionFailure(error);
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
 * "configured but unreachable" is its own state: the credentials are present so
 * nothing warns about missing env, yet every query returns empty. Naming it
 * separately is what makes an empty site explainable.
 *
 * @returns {Promise<"not-configured" | "connected" | "unreachable">}
 */
export async function getDataSourceStatus() {
  if (!isDbConfigured()) return "not-configured";
  const rows = await query("SELECT 1 AS ok");
  return rows ? "connected" : "unreachable";
}
