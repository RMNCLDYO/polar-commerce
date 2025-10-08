export default function ProductLoading() {
  return (
    <main className="px-8 py-12">
      <div className="mx-auto max-w-7xl">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          <div className="relative aspect-square bg-muted animate-pulse rounded-lg" />

          <div className="space-y-8">
            <div className="space-y-4">
              <div className="space-y-2">
                <div className="h-4 w-32 bg-muted animate-pulse rounded" />
                <div className="h-8 w-64 bg-muted animate-pulse rounded" />
              </div>
              <div className="h-6 w-20 bg-muted animate-pulse rounded" />
              <div className="h-4 w-full bg-muted animate-pulse rounded" />
            </div>

            <div className="space-y-4">
              <div className="flex gap-3">
                <div className="flex-1 h-12 bg-muted animate-pulse rounded" />
                <div className="w-12 h-12 bg-muted animate-pulse rounded" />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-5 bg-muted animate-pulse rounded" />
                ))}
              </div>
            </div>

            <div className="border-t border-border pt-8 space-y-4">
              <div className="h-5 w-40 bg-muted animate-pulse rounded" />
              <div className="space-y-2">
                {[1, 2, 3, 4].map((i) => (
                  <div
                    key={i}
                    className="h-4 w-full bg-muted animate-pulse rounded"
                  />
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="mt-20 pt-12 border-t border-border">
          <div className="h-6 w-48 bg-muted animate-pulse rounded mb-8" />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3].map((i) => (
              <div key={i} className="space-y-4">
                <div className="aspect-square bg-muted animate-pulse rounded" />
                <div className="h-4 w-3/4 bg-muted animate-pulse rounded" />
                <div className="h-3 w-1/2 bg-muted animate-pulse rounded" />
                <div className="h-4 w-16 bg-muted animate-pulse rounded" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}
