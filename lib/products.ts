import "server-only";
import {
  unstable_cacheLife as cacheLife,
  unstable_cacheTag as cacheTag,
} from "next/cache";
import JordanHoodieImage from "@/public/products/jordan-hoodie.jpeg";
import NikeCapImage from "@/public/products/nike-cap.jpeg";
import NikeTechSetImage from "@/public/products/nike-tech-set.jpeg";
import NikeVomeroImage from "@/public/products/nike-vomero.jpeg";
import type { Product, ProductFilters } from "./types";

export type { Product, ProductFilters };

const allProducts: Product[] = [
  {
    id: "1",
    name: "Nike ZoomX Vomero Plus",
    price: "$180",
    category: "RUNNING SHOES",
    image: NikeVomeroImage,
    description: "Premium running shoes with ZoomX foam technology",
  },
  {
    id: "2",
    name: "Nike Club Cap",
    price: "$25",
    category: "ACCESSORIES",
    image: NikeCapImage,
    description: "Classic baseball cap with Nike logo",
  },
  {
    id: "3",
    name: "Nike Tech Woven Pants",
    price: "$120",
    category: "MEN'S PANTS",
    image: NikeTechSetImage,
    description: "Camo tracksuit with modern tech fabric",
  },
  {
    id: "4",
    name: "Jordan Fleece Hoodie",
    price: "$85",
    category: "MEN'S HOODIE",
    image: JordanHoodieImage,
    description: "Premium hoodie with signature graphics",
  },
];

export async function getProducts(
  filters?: ProductFilters,
): Promise<Product[]> {
  "use cache";
  cacheLife("hours");
  cacheTag("products");

  let products = [...allProducts];

  if (filters?.category) {
    const categoryFilter = filters.category.toUpperCase();
    products = products.filter((p) =>
      p.category.toUpperCase().includes(categoryFilter),
    );
  }

  if (filters?.search) {
    const searchTerm = filters.search.toLowerCase();
    products = products.filter(
      (p) =>
        p.name.toLowerCase().includes(searchTerm) ||
        p.description.toLowerCase().includes(searchTerm) ||
        p.category.toLowerCase().includes(searchTerm),
    );
  }

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

export async function getProduct(id: string): Promise<Product | null> {
  "use cache";
  cacheLife("hours");
  cacheTag("products", `product-${id}`);

  const products = await getProducts();
  return products.find((p) => p.id === id) || null;
}
