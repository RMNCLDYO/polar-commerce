// Shared types that can be used in both Server and Client components
import type { StaticImageData } from 'next/image';

export interface Product {
  id: string;
  name: string;
  price: string;
  category: string;
  image: StaticImageData | string;
  description: string;
  inStock?: boolean;
  inventory_qty?: number;
}

export interface ProductFilters {
  category?: string;
  search?: string;
  sort?: 'price-asc' | 'price-desc' | 'name-asc' | 'name-desc' | 'newest';
  minPrice?: number;
  maxPrice?: number;
  limit?: number;
  excludeSubscriptions?: boolean;
}
