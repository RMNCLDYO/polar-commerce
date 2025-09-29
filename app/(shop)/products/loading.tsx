export default function ProductsLoading() {
  return (
    <div className="min-h-screen bg-background">
      <header className="px-8 py-6 border-b border-border">
        <div className="mx-auto max-w-7xl">
          <nav className="flex items-center justify-between">
            <div className="h-8 w-48 bg-muted animate-pulse rounded" />
            <div className="flex items-center gap-6">
              <div className="h-8 w-8 bg-muted animate-pulse rounded" />
              <div className="h-8 w-8 bg-muted animate-pulse rounded" />
            </div>
          </nav>
        </div>
      </header>

      <main className="px-8 py-12">
        <div className="mx-auto max-w-7xl">
          <div className="mb-12">
            <div className="h-9 w-48 bg-muted animate-pulse rounded mb-4" />
            <div className="h-5 w-96 bg-muted animate-pulse rounded" />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {Array.from({ length: 8 }, (_, i) => (
              <div key={`skeleton-${i}`} className="space-y-4">
                <div className="aspect-square bg-muted animate-pulse rounded" />
                <div className="space-y-2">
                  <div className="h-4 w-3/4 bg-muted animate-pulse rounded" />
                  <div className="h-3 w-1/2 bg-muted animate-pulse rounded" />
                  <div className="flex items-center justify-between">
                    <div className="h-4 w-16 bg-muted animate-pulse rounded" />
                    <div className="h-8 w-20 bg-muted animate-pulse rounded" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
