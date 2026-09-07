import Breadcrumb from "@/components/Breadcrumb";
/** Shared header for the flat content pages (about, contact, legal, forms). */
export default function PageHeader({ title, description, crumbs }) {
  return (
    <section className="border-b border-line bg-white">
      <div className="shell py-8 lg:py-10">
        <Breadcrumb items={crumbs} />
        <h1 className="mt-4 text-2xl font-semibold sm:text-3xl">{title}</h1>
        {description && (
          <p className="mt-2 max-w-2xl text-[17px] leading-relaxed text-ink-500">{description}</p>
        )}
      </div>
    </section>
  );
}
