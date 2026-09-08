import { notFound } from "next/navigation";
import ServiceSeoPage from "@/components/ServiceSeoPage";
import {
  getBrandsForServiceType,
  getBusinesses,
  getCity,
  getPageContent,
  getServiceType,
  getServiceTypeCounts,
} from "@/lib/api";
import { buildServicePageContent } from "@/lib/service-content";
import { buildCityIndex, buildServiceIndex, popularCityIndex } from "@/lib/search-index";
import { buildMetadata } from "@/lib/seo";
async function load(params) {
  const { city: citySlug, category, subcategory, servicetype } = await params;
  const [city, found] = await Promise.all([
    getCity(citySlug),
    getServiceType(category, subcategory, servicetype),
  ]);
  if (!city || !found) return null;
  return { city, ...found };
}
export async function generateMetadata({ params }) {
  const data = await load(params);
  if (!data) return {};
  // Stored copy for this exact URL wins over the generated fallback.
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
    mapping,
  });
  return buildMetadata({
    title: content.title,
    description: content.metaDescription,
    path: `/${data.city.slug}/${data.category.slug}/${data.subCategory.slug}/${data.serviceType.slug}`,
    keywords: content.keywords,
  });
}
export default async function ServiceTypePage({ params, searchParams }) {
  const data = await load(params);
  if (!data) notFound();
  const query = await searchParams;
  const { city, category, subCategory, serviceType } = data;
  const basePath = `/${city.slug}/${category.slug}/${subCategory.slug}/${serviceType.slug}`;
  const [listings, relatedBrands] = await Promise.all([
    getBusinesses({
      citySlug: city.slug,
      categorySlug: subCategory.slug,
      verifiedOnly: query.verified === "1",
      locality: query.locality,
      serviceType: query.type,
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
  const content = buildServicePageContent({ city, category, subCategory, serviceType, mapping });
  const serviceTypeCounts = await getServiceTypeCounts({
    citySlug: city.slug,
    categorySlug: category.slug,
    subCategorySlug: subCategory.slug,
  });
  const crumbs = [
    { name: "Home", href: "/" },
    { name: city.name, href: `/${city.slug}` },
    { name: category.name, href: `/${city.slug}/${category.slug}` },
    { name: subCategory.name, href: `/${city.slug}/${category.slug}/${subCategory.slug}` },
    { name: serviceType.name, href: basePath },
  ];
  return (
    <ServiceSeoPage
      city={city}
      category={category}
      subCategory={subCategory}
      serviceType={serviceType}
      content={content}
      crumbs={crumbs}
      basePath={basePath}
      listings={listings}
      searchParams={query}
      relatedBrands={relatedBrands}
      serviceTypeCounts={serviceTypeCounts}
      searchServices={await buildServiceIndex()}
      searchCities={await buildCityIndex()}
      searchPopularCities={await popularCityIndex()}
    />
  );
}
