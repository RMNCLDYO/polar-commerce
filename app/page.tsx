import { StorefrontClient } from "@/components/storefront-client";
import { getProducts, type ProductFilters } from "@/lib/products";

export default async function Page(props: PageProps<'/'>) {
  const searchParams = await props.searchParams;

  const filters: ProductFilters = {
    search: searchParams?.search as string | undefined,
    category: searchParams?.category as string | undefined,
    sort: searchParams?.sort as ProductFilters['sort'],
  };

  const products = await getProducts(filters);
  return <StorefrontClient products={products} />;
}
