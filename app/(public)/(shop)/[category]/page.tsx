import type { Metadata, Route } from 'next';
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
    description: 'Premium items for men',
    filter: 'MEN',
    metaTitle: "Men's Collection - Polar Commerce",
    metaDescription: "Explore our men's collection",
  },
  women: {
    title: "Women's Collection",
    description: 'Stylish and functional items for women',
    filter: 'WOMEN',
    metaTitle: "Women's Collection - Polar Commerce",
    metaDescription:
      "Discover our women's collection",
  },
  kids: {
    title: "Kids' Collection",
    description: 'Fun and durable items for kids',
    filter: 'KIDS',
    metaTitle: "Kids' Collection - Polar Commerce",
    metaDescription: "Shop our kids' collection",
  },
  accessories: {
    title: 'Accessories',
    description: 'Premium accessories to complete your look',
    filter: 'ACCESSORIES',
    metaTitle: 'Accessories - Polar Commerce',
    metaDescription: 'Shop our premium accessories',
  },
  new: {
    title: 'New Arrivals',
    description: 'Fresh additions to our collection',
    filter: null,
    defaultSort: 'newest',
    metaTitle: 'New Arrivals - Polar Commerce',
    metaDescription:
      'Discover the latest additions to our collection',
  },
};

type CategorySlug = keyof typeof categoryConfig;

function isValidCategory(category: string): category is CategorySlug {
  return category in categoryConfig;
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

  const config = Object.prototype.hasOwnProperty.call(categoryConfig, category)
    ? categoryConfig[category as CategorySlug]
    : undefined;

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
    if (products.length === 0) { return getEmptyMessage(); }

    if (category === 'new') {
      return `${products.length} fresh additions to our collection`;
    }

    return `${products.length} ${config.description.toLowerCase()}`;
  };

  return (
    <main
      className="px-8 py-12"
      style={{ viewTransitionName: 'category-content' }}
    >
      <div className="mx-auto max-w-7xl">
        <div className="mb-12">
          <h1
            className="text-3xl font-bold tracking-tight mb-4"
            style={{ viewTransitionName: 'page-title' }}
          >
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
                href={`/product/${product.id}` as Route}
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

export default async function CategoryPage(props: PageProps<'/[category]'>) {
  const { category } = await props.params;
  const searchParams = await props.searchParams;

  return (
    <CachedCategoryContent
      category={category}
      search={searchParams?.search as string | undefined}
      sort={searchParams?.sort as ProductFilters['sort']}
    />
  );
}

export async function generateMetadata(props: PageProps<'/[category]'>): Promise<Metadata> {
  const { category } = await props.params;

  const config = Object.prototype.hasOwnProperty.call(categoryConfig, category)
    ? categoryConfig[category as CategorySlug]
    : undefined;

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
