"use client";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronDown, Menu, Search, X } from "lucide-react";
import SearchBar from "@/components/SearchBar";
import { CityChip, CityLink, useCitySelection } from "@/components/CitySelection";
import Logo from "@/components/Logo";
const LINKS = [
  { href: "/about-us", label: "About" },
  { href: "/contact-us", label: "Contact" },
];
export default function HeaderClient({ nav, services, allCities, popularCities }) {
  const { city: selectedCity } = useCitySelection();
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [dropdown, setDropdown] = useState(null);
  const navRef = useRef(null);
  // Any navigation closes every transient surface.
  useEffect(() => {
    setMenuOpen(false);
    setSearchOpen(false);
    setDropdown(null);
  }, [pathname]);
  useEffect(() => {
    if (!dropdown) return;
    function onPointerDown(e) {
      if (!navRef.current?.contains(e.target)) setDropdown(null);
    }
    function onKey(e) {
      if (e.key === "Escape") setDropdown(null);
    }
    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [dropdown]);
  // The mobile drawer owns the viewport while open.
  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen]);
  const cityFromPath = pathname.split("/")[1];
  const cityInUrl = allCities.some((c) => c.slug === cityFromPath) ? cityFromPath : undefined;
  // The city in the URL wins, then the visitor's saved choice.
  const activeCity = cityInUrl ?? selectedCity?.slug;
  return (
    <header className="sticky top-0 z-50 border-b border-line bg-white">
      <div className="shell flex h-16 items-center gap-6">
        <Logo />

        {/* ---------- Desktop navigation ---------- */}
        <div ref={navRef} className="hidden flex-1 items-center gap-1 lg:flex">
          <NavDropdown
            label="Categories"
            open={dropdown === "categories"}
            onToggle={() => setDropdown(dropdown === "categories" ? null : "categories")}
          >
            <div className="grid w-[34rem] grid-cols-2 gap-x-6 gap-y-4 p-5">
              {nav.categories.map((cat) => (
                <div key={cat.slug}>
                  <p className="mb-1.5 text-[15.5px] font-semibold text-navy-900">{cat.name}</p>
                  <ul className="space-y-1">
                    {cat.subCategories.map((sub) => (
                      <li key={sub.slug}>
                        <CityLink
                          path={`/${cat.slug}/${sub.slug}`}
                          className="text-left text-[15.5px] text-ink-500 transition-colors hover:text-brand-600"
                        >
                          {sub.name}
                        </CityLink>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </NavDropdown>

          <NavDropdown
            label="Cities"
            open={dropdown === "cities"}
            onToggle={() => setDropdown(dropdown === "cities" ? null : "cities")}
          >
            <div className="grid w-[26rem] grid-cols-3 gap-x-4 gap-y-2 p-5">
              {nav.cities.map((city) => (
                <Link
                  key={city.slug}
                  href={`/${city.slug}`}
                  className="text-[15.5px] text-ink-500 transition-colors hover:text-brand-600"
                >
                  {city.name}
                </Link>
              ))}
            </div>
          </NavDropdown>

          {LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="rounded-md px-3 py-2 text-sm text-ink-700 transition-colors hover:text-brand-600"
            >
              {link.label}
            </Link>
          ))}
        </div>

        {/* ---------- Desktop actions ---------- */}
        <div className="ml-auto hidden items-center gap-2 lg:flex">
          <CityChip />
          <button
            type="button"
            onClick={() => setSearchOpen((v) => !v)}
            aria-expanded={searchOpen}
            aria-label="Toggle search"
            className="rounded-md p-2 text-ink-500 transition-colors hover:bg-canvas hover:text-navy-900"
          >
            <Search className="h-[18px] w-[18px]" aria-hidden />
          </button>
          <Link
            href="/list-your-business"
            className="rounded-md border border-line px-3.5 py-2 text-sm font-medium text-navy-900 transition-colors hover:border-line-strong hover:bg-canvas"
          >
            List Your Business
          </Link>
          <Link
            href="/login"
            className="rounded-md bg-brand-500 px-3.5 py-2 text-sm font-medium text-white transition-colors hover:bg-brand-600"
          >
            Login
          </Link>
        </div>

        {/* ---------- Mobile actions ---------- */}
        <div className="ml-auto flex items-center gap-1 lg:hidden">
          <button
            type="button"
            onClick={() => setSearchOpen((v) => !v)}
            aria-expanded={searchOpen}
            aria-label="Search"
            className="rounded-md p-2 text-ink-700"
          >
            <Search className="h-5 w-5" aria-hidden />
          </button>
          <button
            type="button"
            onClick={() => setMenuOpen(true)}
            aria-label="Open menu"
            className="rounded-md p-2 text-ink-700"
          >
            <Menu className="h-5 w-5" aria-hidden />
          </button>
        </div>
      </div>

      {/* ---------- Collapsible search strip ---------- */}
      {searchOpen && (
        <div className="fade-in border-t border-line bg-white py-3">
          <div className="shell">
            <SearchBar
              variant="compact"
              services={services}
              cities={allCities}
              popularCities={popularCities}
              defaultCitySlug={activeCity}
            />
          </div>
        </div>
      )}

      {/* ---------- Mobile drawer ---------- */}
      {menuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="absolute inset-0 bg-navy-900/40"
            onClick={() => setMenuOpen(false)}
            aria-hidden
          />
          <nav
            aria-label="Site menu"
            className="absolute inset-y-0 right-0 flex w-[86%] max-w-sm flex-col bg-white shadow-pop"
          >
            <div className="flex h-16 shrink-0 items-center justify-between border-b border-line px-5">
              <Logo />
              <button
                type="button"
                onClick={() => setMenuOpen(false)}
                aria-label="Close menu"
                className="rounded-md p-2 text-ink-700"
              >
                <X className="h-5 w-5" aria-hidden />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-5 py-5">
              <div className="mb-5">
                <CityChip />
              </div>

              <p className="mb-2 text-[13.5px] font-semibold uppercase tracking-wide text-ink-400">
                Categories
              </p>
              <ul className="mb-6 space-y-3">
                {nav.categories.map((cat) => (
                  <li key={cat.slug}>
                    <p className="text-sm font-medium text-navy-900">{cat.name}</p>
                    <ul className="mt-1 space-y-1 pl-3">
                      {cat.subCategories.map((sub) => (
                        <li key={sub.slug}>
                          <CityLink
                            path={`/${cat.slug}/${sub.slug}`}
                            className="block py-1 text-left text-sm text-ink-500"
                          >
                            {sub.name}
                          </CityLink>
                        </li>
                      ))}
                    </ul>
                  </li>
                ))}
              </ul>

              <p className="mb-2 text-[13.5px] font-semibold uppercase tracking-wide text-ink-400">
                Popular cities
              </p>
              <ul className="mb-6 grid grid-cols-2 gap-y-1">
                {nav.cities.map((city) => (
                  <li key={city.slug}>
                    <Link href={`/${city.slug}`} className="block py-1 text-sm text-ink-500">
                      {city.name}
                    </Link>
                  </li>
                ))}
              </ul>

              <ul className="space-y-1 border-t border-line pt-4">
                {LINKS.map((link) => (
                  <li key={link.href}>
                    <Link href={link.href} className="block py-1.5 text-sm text-ink-700">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div className="shrink-0 space-y-2 border-t border-line px-5 py-4">
              <Link
                href="/list-your-business"
                className="block rounded-md border border-line py-2.5 text-center text-sm font-medium text-navy-900"
              >
                List Your Business
              </Link>
              <Link
                href="/login"
                className="block rounded-md bg-brand-500 py-2.5 text-center text-sm font-medium text-white"
              >
                Login
              </Link>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
function NavDropdown({ label, open, onToggle, children }) {
  return (
    <div className="relative">
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={open}
        className="flex items-center gap-1 rounded-md px-3 py-2 text-sm text-ink-700 transition-colors hover:text-brand-600"
      >
        {label}
        <ChevronDown
          className={`h-3.5 w-3.5 transition-transform ${open ? "rotate-180" : ""}`}
          aria-hidden
        />
      </button>
      {open && (
        <div className="fade-in absolute left-0 top-[calc(100%+0.35rem)] rounded-xl border border-line bg-white shadow-pop">
          {children}
        </div>
      )}
    </div>
  );
}
