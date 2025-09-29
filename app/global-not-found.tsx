import { Link } from '@/components/link';
import { Button } from '@/components/ui/button';

export default function GlobalNotFound() {
  return (
    <html lang="en">
      <body className="antialiased">
        <div className="min-h-screen flex items-center justify-center bg-background">
          <div className="text-center space-y-6 p-8 max-w-md">
            <div className="space-y-2">
              <h1 className="text-6xl font-bold tracking-tight">404</h1>
              <h2 className="text-2xl font-semibold">Page not found</h2>
              <p className="text-sm text-muted-foreground">
                Sorry, we couldn't find the page you're looking for.
              </p>
            </div>
            <Link href="/" prefetchStrategy="always">
              <Button variant="default" className="px-6">
                Go back home
              </Button>
            </Link>
          </div>
        </div>
      </body>
    </html>
  );
}
