import "server-only";
import { unstable_cache } from "next/cache";
import type { Product, ProductFilters } from "./types";

export type { Product, ProductFilters };

const allProducts: Product[] = [
  {
    id: "1",
    name: "Nike ZoomX Vomero Plus",
    price: "$180",
    category: "RUNNING SHOES",
    image: "/products/nike-vomero.jpeg",
    description: "Premium running shoes with ZoomX foam technology",
  },
  {
    id: "2",
    name: "Nike Club Cap",
    price: "$25",
    category: "ACCESSORIES",
    image: "/products/nike-cap.jpeg",
    description: "Classic baseball cap with Nike logo",
  },
  {
    id: "3",
    name: "Nike Tech Woven Pants",
    price: "$120",
    category: "MEN'S PANTS",
    image: "/products/nike-tech-set.jpeg",
    description: "Camo tracksuit with modern tech fabric",
  },
  {
    id: "4",
    name: "Jordan Fleece Hoodie",
    price: "$85",
    category: "MEN'S HOODIE",
    image: "/products/jordan-hoodie.jpeg",
    description: "Premium hoodie with signature graphics",
  },
];

async function getProductsInternal(
  filters?: ProductFilters,
): Promise<Product[]> {
  let products = [...allProducts];

  // Filter by category
  if (filters?.category) {
    const categoryFilter = filters.category.toUpperCase();
    products = products.filter((p) =>
      p.category.toUpperCase().includes(categoryFilter),
    );
  }

  // Filter by search term
  if (filters?.search) {
    const searchTerm = filters.search.toLowerCase();
    products = products.filter(
      (p) =>
        p.name.toLowerCase().includes(searchTerm) ||
        p.description.toLowerCase().includes(searchTerm) ||
        p.category.toLowerCase().includes(searchTerm),
    );
  }

  // Filter by price range
  if (filters?.minPrice !== undefined || filters?.maxPrice !== undefined) {
    products = products.filter((p) => {
      const price = parseFloat(p.price.replace("$", ""));
      if (filters.minPrice !== undefined && price < filters.minPrice)
        return false;
      if (filters.maxPrice !== undefined && price > filters.maxPrice)
        return false;
      return true;
    });
  }

  // Sort products
  if (filters?.sort) {
    products.sort((a, b) => {
      const priceA = parseFloat(a.price.replace("$", ""));
      const priceB = parseFloat(b.price.replace("$", ""));

      switch (filters.sort) {
        case "price-asc":
          return priceA - priceB;
        case "price-desc":
          return priceB - priceA;
        case "name-asc":
          return a.name.localeCompare(b.name);
        case "name-desc":
          return b.name.localeCompare(a.name);
        default:
          return 0;
      }
    });
  }

  return products;
}

export async function getProducts(
  filters?: ProductFilters,
): Promise<Product[]> {
  const cacheKey = JSON.stringify(filters || {});

  const getCachedProducts = unstable_cache(
    async () => {
      return getProductsInternal(filters);
    },
    ["products", cacheKey],
    {
      tags: ["products"],
      revalidate: 3600,
    },
  );

  return getCachedProducts();
}

export async function getProduct(id: string): Promise<Product | null> {
  const getCachedProduct = unstable_cache(
    async () => {
      const products = await getProductsInternal();
      return products.find((p) => p.id === id) || null;
    },
    ["product", id],
    {
      tags: ["products", `product-${id}`],
      revalidate: 3600,
    },
  );

  return getCachedProduct();
}
