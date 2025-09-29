// Shared types that can be used in both Server and Client components

export interface Product {
  id: string;
  name: string;
  price: string;
  category: string;
  image: string;
  description: string;
}

export interface ProductFilters {
  category?: string;
  search?: string;
  sort?: 'price-asc' | 'price-desc' | 'name-asc' | 'name-desc';
  minPrice?: number;
  maxPrice?: number;
}