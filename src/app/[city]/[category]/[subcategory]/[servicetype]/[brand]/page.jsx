import { notFound } from "next/navigation";
import ServiceSeoPage from "@/components/ServiceSeoPage";
import {
  getBrandBySlug,
  getBrandsForServiceType,
  getBusinesses,
  getCity,
  getPageContent,
  getServiceType,
} from "@/lib/api";
import { buildServicePageContent } from "@/lib/service-content";
import { buildMetadata } from "@/lib/seo";
async function load(params) {
  const { city: citySlug, category, subcategory, servicetype, brand: brandSlug } = await params;
  const [city, found, brand] = await Promise.all([
    getCity(citySlug),
    getServiceType(category, subcategory, servicetype),
    getBrandBySlug(category, subcategory, servicetype, brandSlug),
  ]);
  if (!city || !found || !brand) return null;
  return { city, brand, brandSlug, ...found };
}
export async function generateMetadata({ params }) {
  const data = await load(params);
  if (!data) return {};
  const mapping = await getPageContent({
    localityId: data.city.id,
    categoryId: data.category.id,
    levelOneId: data.subCategory.id,
    levelTwoId: data.serviceType.id,
  });
  const content = buildServicePageContent({
    city: data.city,
    category: data.category,
    subCategory: data.subCategory,
    serviceType: data.serviceType,
    brand: data.brand,
    mapping,
  });
  return buildMetadata({
    title: content.title,
    description: content.metaDescription,
    path: `/${data.city.slug}/${data.category.slug}/${data.subCategory.slug}/${data.serviceType.slug}/${data.brandSlug}`,
    keywords: content.keywords,
  });
}
export default async function BrandServicePage({ params, searchParams }) {
  const data = await load(params);
  if (!data) notFound();
  const query = await searchParams;
  const { city, category, subCategory, serviceType, brand, brandSlug } = data;
  const basePath = `/${city.slug}/${category.slug}/${subCategory.slug}/${serviceType.slug}/${brandSlug}`;
  const [listings, brands] = await Promise.all([
    getBusinesses({
      citySlug: city.slug,
      categorySlug: subCategory.slug,
      verifiedOnly: query.verified === "1",
      locality: query.locality,
      sort: query.sort ?? undefined,
      page: Number(query.page) || 1,
      perPage: 10,
    }),
    getBrandsForServiceType(category.slug, subCategory.slug, serviceType.slug),
  ]);
  const mapping = await getPageContent({
    localityId: city.id,
    categoryId: category.id,
    levelOneId: subCategory.id,
    levelTwoId: serviceType.id,
  });
  const content = buildServicePageContent({
    city,
    category,
    subCategory,
    serviceType,
    brand,
    mapping,
  });
  const crumbs = [
    { name: "Home", href: "/" },
    { name: city.name, href: `/${city.slug}` },
    { name: category.name, href: `/${city.slug}/${category.slug}` },
    { name: subCategory.name, href: `/${city.slug}/${category.slug}/${subCategory.slug}` },
    {
      name: serviceType.name,
      href: `/${city.slug}/${category.slug}/${subCategory.slug}/${serviceType.slug}`,
    },
    { name: brand.name, href: basePath },
  ];
  return (
    <ServiceSeoPage
      city={city}
      category={category}
      subCategory={subCategory}
      serviceType={serviceType}
      brand={brand}
      content={content}
      crumbs={crumbs}
      basePath={basePath}
      listings={listings}
      searchParams={query}
      // Sibling brands, so the user can switch brand without going up a level.
      relatedBrands={brands.filter((b) => b.name !== brand.name)}
    />
  );
}
