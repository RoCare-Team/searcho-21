import { getDataSourceStatus } from "@/lib/api";

/**
 * Explains an empty site.
 *
 * All content comes from MySQL and nothing is bundled as a stand-in, so when the
 * database is missing or unreachable every page renders empty. Without this the
 * result looks like a broken deploy rather than a connection problem.
 */
export default async function DataSourceNotice() {
  const status = await getDataSourceStatus();
  if (status === "connected") return null;

  const code = "font-mono text-[12px]";

  return (
    <div className="border-b border-brand-200 bg-brand-50">
      <div className="shell py-2.5 text-[13px] text-brand-700">
        {status === "not-configured" ? (
          <>
            <span className="font-medium">Database not connected.</span> Set{" "}
            <code className={code}>DB_HOST</code>, <code className={code}>DB_USERNAME</code>,{" "}
            <code className={code}>DB_PASSWORD</code> and <code className={code}>DB_DATABASE</code>{" "}
            in <code className={code}>.env.local</code> to load cities, categories and listings.
          </>
        ) : status === "rejected" ? (
          <>
            <span className="font-medium">Database refused the login.</span> The server answered, so
            it is reachable — the credentials in <code className={code}>.env.local</code> were
            turned away. Check <code className={code}>DB_USERNAME</code> /{" "}
            <code className={code}>DB_PASSWORD</code> and <code className={code}>DB_DATABASE</code>,
            and that the user is granted access from this machine&rsquo;s public IP — hosting panels
            allow remote MySQL per-IP, and a laptop is rarely on that list.
          </>
        ) : (
          <>
            <span className="font-medium">Database unreachable.</span> The credentials in{" "}
            <code className={code}>.env.local</code> are set, but the server never answered — check
            that <code className={code}>DB_HOST</code> and <code className={code}>DB_PORT</code> are
            right and that the port is open from here. If MySQL only listens on the hosting server,
            open an SSH tunnel or point <code className={code}>DB_HOST</code> at a remote-accessible
            address.
          </>
        )}
      </div>
    </div>
  );
}
