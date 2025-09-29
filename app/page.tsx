import { StorefrontClient } from "@/components/storefront-client";
import { getProducts } from "@/lib/products";

export default async function Page() {
  const products = await getProducts();
  return <StorefrontClient products={products} />;
}
