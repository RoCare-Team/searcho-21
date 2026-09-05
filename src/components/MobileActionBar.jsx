import { MessageCircle, Phone } from "lucide-react";
import QuoteDialog from "@/components/QuoteDialog";
/**
 * Sticky action bar shown only on small screens, where the desktop action stack
 * is off-screen. Three targets, each comfortably tappable.
 */
export default function MobileActionBar({ business }) {
  return (
    <div className="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-white/95 px-4 py-3 backdrop-blur-sm lg:hidden">
      <div className="flex items-center gap-2">
        {business.phone && (
          <a
            href={`tel:+91${business.phone}`}
            className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-line py-2.5 text-[13px] font-medium text-navy-900"
          >
            <Phone className="h-4 w-4" aria-hidden />
            Call
          </a>
        )}

        {business.whatsapp && (
          <a
            href={`https://wa.me/91${business.whatsapp}`}
            target="_blank"
            rel="noopener noreferrer nofollow"
            className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-line py-2.5 text-[13px] font-medium text-navy-900"
          >
            <MessageCircle className="h-4 w-4" aria-hidden />
            WhatsApp
          </a>
        )}

        <QuoteDialog
          label="Get Quote"
          title={`Get a quote from ${business.name}`}
          context={`Your requirement is shared with ${business.name}, ${business.address.city}.`}
          className="flex-1 !py-2.5 !text-[13px]"
        />
      </div>
    </div>
  );
}
