'use server';

import { revalidatePath, revalidateTag } from 'next/cache';
import 'server-only';

export async function revalidateProducts() {
  revalidateTag('products', 'hours');
  revalidatePath('/products');
  revalidatePath('/');
}

export async function revalidateProduct(id: string) {
  revalidateTag(`product-${id}`, 'hours');
  revalidateTag('products', 'hours');
  revalidatePath(`/product/${id}`);
  revalidatePath('/products');
  revalidatePath('/');
}

export async function revalidateCategory(category: string) {
  revalidateTag('products', 'hours');
  revalidatePath(`/${category.toLowerCase()}`);
  revalidatePath('/');
}
