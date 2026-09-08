import Link from "next/link";
import { redirect } from "next/navigation";
import { ClipboardList, LayoutDashboard, LogOut, ShieldCheck } from "lucide-react";
import { clearAdminSession, getAdmin } from "@/lib/admin-auth";

/**
 * Shell for the superadmin area.
 *
 * Guards every page in the (panel) route group. The login screen sits outside
 * the group on purpose: a layout applies to everything nested under it, so
 * guarding at /superadmin would have redirected an unauthenticated visitor away
 * from the very page they need — straight into a loop.
 *
 * The site header and footer are deliberately absent: this is a staff tool, not
 * part of the public directory.
 */
const NAV = [
  { href: "/superadmin", label: "Dashboard", Icon: LayoutDashboard },
  { href: "/superadmin/listings", label: "Listings", Icon: ClipboardList },
];

export default async function SuperadminLayout({ children }) {
  const admin = await getAdmin();
  if (!admin) redirect("/superadmin/login");

  async function signOut() {
    "use server";
    await clearAdminSession();
    redirect("/superadmin/login");
  }

  return (
    <div className="min-h-screen bg-canvas">
      <header className="sticky top-0 z-40 border-b border-line bg-white">
        <div className="flex h-16 items-center justify-between gap-4 px-5 lg:px-8">
          <Link href="/superadmin" className="flex items-center gap-2.5">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-50">
              <ShieldCheck className="h-5 w-5 text-brand-500" aria-hidden />
            </span>
            <span className="text-[17px] font-semibold text-navy-900">Superadmin</span>
          </Link>

          <nav className="hidden items-center gap-1 sm:flex">
            {NAV.map(({ href, label, Icon }) => (
              <Link
                key={href}
                href={href}
                className="inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-[15px] font-medium text-ink-700 transition-colors hover:bg-canvas hover:text-brand-600"
              >
                <Icon className="h-4 w-4" aria-hidden />
                {label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-3">
            <span className="hidden text-[14.5px] text-ink-500 sm:block">{admin.name}</span>
            <form action={signOut}>
              <button
                type="submit"
                className="inline-flex h-10 items-center gap-1.5 rounded-lg border border-line px-3.5 text-[14.5px] font-medium text-navy-900 transition-colors hover:border-line-strong hover:bg-canvas"
              >
                <LogOut className="h-4 w-4" aria-hidden />
                Sign out
              </button>
            </form>
          </div>
        </div>

        {/* The nav collapses to a scrolling row rather than a drawer: there are
            only a couple of destinations. */}
        <nav className="no-scrollbar flex gap-1 overflow-x-auto border-t border-line px-5 py-2 sm:hidden">
          {NAV.map(({ href, label, Icon }) => (
            <Link
              key={href}
              href={href}
              className="inline-flex shrink-0 items-center gap-1.5 rounded-lg px-3 py-1.5 text-[14.5px] font-medium text-ink-700"
            >
              <Icon className="h-4 w-4" aria-hidden />
              {label}
            </Link>
          ))}
        </nav>
      </header>

      <main className="px-5 py-6 lg:px-8 lg:py-8">{children}</main>
    </div>
  );
}
