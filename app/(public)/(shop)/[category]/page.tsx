import type { Metadata } from 'next';
import {
  unstable_cacheLife as cacheLife,
  unstable_cacheTag as cacheTag,
} from 'next/cache';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import { QuickAddButton } from '@/components/cart/quick-add-button';
import { Link } from '@/components/link';
import { Badge } from '@/components/ui/badge';
import { AddToWishlistButton } from '@/components/wishlist/add-to-wishlist-button';
import type { Id } from '@/convex/_generated/dataModel';
import { getProducts, type ProductFilters } from '@/lib/server/data/products';
import { cn } from '@/lib/shared/utils';

type CategoryConfig = {
  title: string;
  description: string;
  filter: string | null;
  defaultSort?: ProductFilters['sort'];
  metaTitle: string;
  metaDescription: string;
};

const categoryConfig: Record<string, CategoryConfig> = {
  men: {
    title: "Men's Collection",
    description: 'Premium athletic items designed for peak performance',
    filter: 'MEN',
    metaTitle: "Men's Collection - BANANA SPORTSWEAR",
    metaDescription: "Explore our men's premium athletic gear and sportswear",
  },
  women: {
    title: "Women's Collection",
    description: 'Stylish and functional sportswear items for every workout',
    filter: 'WOMEN',
    metaTitle: "Women's Collection - BANANA SPORTSWEAR",
    metaDescription:
      "Discover our women's premium athletic gear and sportswear",
  },
  kids: {
    title: "Kids' Collection",
    description: 'Fun and durable sportswear items for young athletes',
    filter: 'KIDS',
    metaTitle: "Kids' Collection - BANANA SPORTSWEAR",
    metaDescription: "Shop our kids' premium athletic gear and sportswear",
  },
  accessories: {
    title: 'Accessories',
    description: 'Premium accessories to complete your athletic look',
    filter: 'ACCESSORIES',
    metaTitle: 'Accessories - BANANA SPORTSWEAR',
    metaDescription: 'Shop our premium athletic accessories and gear',
  },
  new: {
    title: 'New Arrivals',
    description: 'Fresh additions to our premium sportswear collection',
    filter: null,
    defaultSort: 'newest',
    metaTitle: 'New Arrivals - BANANA SPORTSWEAR',
    metaDescription:
      'Discover the latest additions to our premium sportswear collection',
  },
};

type CategorySlug = keyof typeof categoryConfig;

function isValidCategory(category: string): category is CategorySlug {
  return category in categoryConfig;
}

interface CategoryPageProps {
  params: Promise<{ category: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

async function CachedCategoryContent({
  category,
  search,
  sort,
}: {
  category: string;
  search?: string;
  sort?: ProductFilters['sort'];
}) {
  'use cache';
  cacheLife('hours');
  cacheTag('products', `category-${category}`);

  const config = categoryConfig[category];

  if (!config || !isValidCategory(category)) {
    notFound();
  }

  const filters: ProductFilters = {
    ...(config.filter && { category: config.filter }),
    search,
    sort: sort || config.defaultSort,
    ...(category === 'new' && { limit: 12, excludeSubscriptions: true }),
  };

  const products = await getProducts(filters);

  const getEmptyMessage = () => {
    if (category === 'new') {
      return 'Check back soon for our latest collection';
    }
    return `No ${category}'s products available${category !== 'new' ? ' yet' : ''}`;
  };

  const getProductCount = () => {
    if (products.length === 0) return getEmptyMessage();

    if (category === 'new') {
      return `${products.length} fresh additions to our premium sportswear collection`;
    }

    return `${products.length} ${config.description.toLowerCase()}`;
  };

  return (
    <main className="px-8 py-12">
      <div className="mx-auto max-w-7xl">
        <div className="mb-12">
          <h1 className="text-3xl font-bold tracking-tight mb-4">
            {config.title}
          </h1>
          <p className="text-muted-foreground min-h-[24px]">
            {getProductCount()}
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 min-h-[400px]">
          {products.length > 0 ? (
            products.map((product) => (
              <Link
                key={product.id}
                href={`/product/${product.id}`}
                prefetchStrategy="hover"
                className="group cursor-pointer"
              >
                <div
                  className="relative mb-4 overflow-hidden"
                  style={{ aspectRatio: '3/4' }}
                >
                  <div
                    className={cn(
                      'absolute inset-0 transition-all duration-300',
                      !product.inStock &&
                        'grayscale opacity-80 group-hover:grayscale-0 group-hover:opacity-100',
                    )}
                  >
                    <Image
                      src={product.image}
                      alt={product.name}
                      fill
                      className="object-cover transition-transform duration-300 group-hover:scale-105"
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, (max-width: 1280px) 33vw, 25vw"
                    />
                  </div>

                  {/* Out of Stock Badge */}
                  {!product.inStock && (
                    <Badge
                      variant="destructive"
                      className="absolute top-2 right-2 font-bold z-10 text-[10px] px-2 py-0.5"
                    >
                      SOLD OUT
                    </Badge>
                  )}
                </div>
                <div className="space-y-2">
                  <h2 className="text-sm font-semibold tracking-wide line-clamp-1">
                    {product.name}
                  </h2>
                  <p className="text-xs text-muted-foreground uppercase tracking-widest font-mono">
                    {product.category}
                  </p>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold">
                      {product.price}
                    </span>
                    <div className="flex items-center gap-2">
                      <AddToWishlistButton
                        catalogId={product.id as Id<'catalog'>}
                        variant="outline"
                        size="sm"
                        productInfo={{
                          name: product.name,
                          image:
                            typeof product.image === 'string'
                              ? product.image
                              : product.image.src,
                          price: product.price,
                        }}
                      />
                      <QuickAddButton
                        catalogId={product.id as Id<'catalog'>}
                        inStock={product.inStock}
                        productInfo={{
                          name: product.name,
                          image:
                            typeof product.image === 'string'
                              ? product.image
                              : product.image.src,
                          price: product.price,
                        }}
                      />
                    </div>
                  </div>
                </div>
              </Link>
            ))
          ) : (
            <div className="col-span-full flex items-center justify-center">
              <p className="text-muted-foreground text-center">
                {getEmptyMessage()}
              </p>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}

export default async function CategoryPage({
  params,
  searchParams,
}: CategoryPageProps) {
  const { category } = await params;
  const searchParamsData = await searchParams;

  return (
    <CachedCategoryContent
      category={category}
      search={searchParamsData?.search as string | undefined}
      sort={searchParamsData?.sort as ProductFilters['sort']}
    />
  );
}

export async function generateStaticParams() {
  return Object.keys(categoryConfig).map((category) => ({
    category,
  }));
}

export async function generateMetadata({
  params,
}: CategoryPageProps): Promise<Metadata> {
  const { category } = await params;

  const config = categoryConfig[category];

  if (!config || !isValidCategory(category)) {
    return {
      title: 'Category Not Found',
    };
  }

  return {
    title: config.metaTitle,
    description: config.metaDescription,
    openGraph: {
      title: config.metaTitle,
      description: config.metaDescription,
    },
  };
}
