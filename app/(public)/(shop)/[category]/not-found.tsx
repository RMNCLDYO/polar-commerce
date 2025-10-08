import { Link } from '@/components/link';
import { Button } from '@/components/ui/button';

export default function CategoryNotFound() {
  return (
    <main className="px-8 py-12">
      <div className="mx-auto max-w-7xl">
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center space-y-6 p-8 max-w-md">
            <div className="space-y-2">
              <h1 className="text-6xl font-bold tracking-tight">404</h1>
              <h2 className="text-2xl font-semibold">Category not found</h2>
              <p className="text-sm text-muted-foreground">
                Sorry, we couldn't find the category you're looking for.
              </p>
            </div>
            <div className="flex gap-3 justify-center">
              <Link href="/products">
                <Button variant="default" className="px-6">
                  Browse All Products
                </Button>
              </Link>
              <Link href="/">
                <Button variant="outline" className="px-6">
                  Go Home
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
