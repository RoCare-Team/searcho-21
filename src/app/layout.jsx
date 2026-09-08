import { Inter } from "next/font/google";
import { SITE_NAME, SITE_TAGLINE, SITE_URL } from "@/lib/seo";
import "./globals.css";

/**
 * Document shell only.
 *
 * The public site's header, footer and city picker live in the `(site)` route
 * group instead, so the superadmin panel — which sits outside that group —
 * renders without them. Putting them here stacked the directory's header above
 * the panel's own.
 */
const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: `${SITE_NAME} - ${SITE_TAGLINE}`,
    template: `%s | ${SITE_NAME}`,
  },
  description:
    "Find verified local service experts near you. Compare water purifier, air conditioner, home care, personal care and gadget repair providers across India.",
  applicationName: SITE_NAME,
  formatDetection: { telephone: true },
};

export const viewport = {
  themeColor: "#ffffff",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }) {
  return (
    <html lang="en-IN" className={inter.variable}>
      <body className="flex min-h-screen flex-col">{children}</body>
    </html>
  );
}
