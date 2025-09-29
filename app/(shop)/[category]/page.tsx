import { ArrowLeft } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getProducts, type ProductFilters } from "@/lib/products";

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
    description: "Premium athletic items designed for peak performance",
    filter: "MEN",
    metaTitle: "Men's Collection - BANANA SPORTSWEAR",
    metaDescription: "Explore our men's premium athletic gear and sportswear",
  },
  women: {
    title: "Women's Collection",
    description: "Stylish and functional sportswear items for every workout",
    filter: "WOMEN",
    metaTitle: "Women's Collection - BANANA SPORTSWEAR",
    metaDescription: "Discover our women's premium athletic gear and sportswear",
  },
  kids: {
    title: "Kids' Collection",
    description: "Fun and durable sportswear items for young athletes",
    filter: "KIDS",
    metaTitle: "Kids' Collection - BANANA SPORTSWEAR",
    metaDescription: "Shop our kids' premium athletic gear and sportswear",
  },
  new: {
    title: "New Arrivals",
    description: "Fresh additions to our premium sportswear collection",
    filter: null,
    defaultSort: 'name-desc',
    metaTitle: "New Arrivals - BANANA SPORTSWEAR",
    metaDescription: "Discover the latest additions to our premium sportswear collection",
  },
};

type CategorySlug = keyof typeof categoryConfig;

function isValidCategory(category: string): category is CategorySlug {
  return category in categoryConfig;
}

export default async function CategoryPage(props: PageProps<'/[category]'>) {
  const { category } = await props.params;
  const searchParams = await props.searchParams;

  const config = categoryConfig[category];

  if (!config || !isValidCategory(category)) {
    notFound();
  }

  const filters: ProductFilters = {
    ...(config.filter && { category: config.filter }),
    search: searchParams?.search as string | undefined,
    sort: (searchParams?.sort as ProductFilters['sort']) || config.defaultSort,
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
    <div className="min-h-screen bg-background">
      <header className="px-8 py-6 border-b border-border">
        <div className="mx-auto max-w-7xl">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm font-mono tracking-wider uppercase hover:text-muted-foreground transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Store
          </Link>
        </div>
      </header>
      <main className="px-8 py-12">
        <div className="mx-auto max-w-7xl">
          <div className="mb-12">
            <h1 className="text-3xl font-bold tracking-tight mb-4">
              {config.title}
            </h1>
            <p className="text-muted-foreground">
              {getProductCount()}
            </p>
          </div>

          {products.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
              {products.map((product) => (
                <Link
                  key={product.id}
                  href={`/product/${product.id}`}
                  prefetch={false}
                  className="group cursor-pointer"
                >
                  <div className="relative aspect-square mb-4 overflow-hidden bg-muted/50">
                    <Image
                      src={product.image}
                      alt={product.name}
                      fill
                      className="object-contain transition-transform duration-300 group-hover:scale-105"
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, (max-width: 1280px) 33vw, 25vw"
                    />
                  </div>
                  <div className="space-y-2">
                    <h2 className="text-sm font-semibold tracking-wide line-clamp-1">
                      {product.name}
                    </h2>
                    <p className="text-xs text-muted-foreground uppercase tracking-widest font-mono">
                      {product.category}
                    </p>
                    <span className="text-sm font-semibold">{product.price}</span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

export async function generateStaticParams() {
  return Object.keys(categoryConfig).map((category) => ({
    category,
  }));
}

export async function generateMetadata(props: PageProps<'/[category]'>) {
  const { category } = await props.params;

  const config = categoryConfig[category];

  if (!config || !isValidCategory(category)) {
    return {
      title: "Category Not Found",
    };
  }

  return {
    title: config.metaTitle,
    description: config.metaDescription,
  };
}