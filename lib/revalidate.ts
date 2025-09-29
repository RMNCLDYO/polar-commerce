'use server';

import { revalidatePath, revalidateTag } from 'next/cache';

export async function revalidateProducts() {
  revalidateTag('products');
  revalidatePath('/products');
  revalidatePath('/');
}

export async function revalidateProduct(id: string) {
  revalidateTag(`product-${id}`);
  revalidateTag('products');
  revalidatePath(`/product/${id}`);
  revalidatePath('/products');
  revalidatePath('/');
}

export async function revalidateCategory(category: string) {
  revalidateTag('products');
  revalidatePath(`/${category.toLowerCase()}`);
  revalidatePath('/');
}
