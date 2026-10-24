type StorefrontRouteLoadingProps = {
  variant: "product" | "collection";
};

function Skeleton({ className = "" }: { className?: string }) {
  return (
    <div
      aria-hidden="true"
      className={`animate-pulse rounded-lg bg-[#e8e3d9] ${className}`}
    />
  );
}

export default function StorefrontRouteLoading({
  variant,
}: StorefrontRouteLoadingProps) {
  if (variant === "product") {
    return (
      <main
        aria-label="Loading product"
        aria-busy="true"
        className="min-h-screen bg-[#F8F7F4] px-4 py-6 sm:px-6 lg:px-8"
      >
        <div className="mx-auto max-w-7xl">
          <Skeleton className="mb-6 h-4 w-44" />
          <div className="grid gap-8 lg:grid-cols-2 lg:gap-12">
            <Skeleton className="aspect-square w-full rounded-2xl" />
            <div className="space-y-5 py-2">
              <Skeleton className="h-3 w-28" />
              <Skeleton className="h-9 w-4/5" />
              <Skeleton className="h-5 w-32" />
              <Skeleton className="h-24 w-full" />
              <Skeleton className="h-12 w-full max-w-sm rounded-xl" />
              <Skeleton className="h-12 w-full max-w-sm rounded-xl" />
              <div className="border-t border-[#e9e1d4] pt-5">
                <Skeleton className="mb-3 h-4 w-40" />
                <Skeleton className="h-4 w-3/4" />
              </div>
            </div>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main
      aria-label="Loading collection"
      aria-busy="true"
      className="min-h-screen bg-[#F8F7F4]"
    >
      <div className="relative h-[220px] overflow-hidden bg-[#071A35] sm:h-[280px] lg:h-[320px]">
        <div className="absolute inset-0 bg-gradient-to-r from-[#071A35] via-[#071A35]/80 to-[#10294A]" />
        <div className="relative mx-auto flex h-full max-w-7xl flex-col justify-center px-5 sm:px-8 lg:px-12">
          <Skeleton className="h-3 w-36 bg-white/20" />
          <Skeleton className="mt-5 h-8 w-3/5 max-w-lg bg-white/20 sm:h-12" />
          <Skeleton className="mt-4 h-4 w-4/5 max-w-md bg-white/15" />
        </div>
      </div>
      <div className="mx-auto max-w-7xl px-4 py-9 sm:px-6 lg:px-8">
        <Skeleton className="mb-3 h-3 w-24" />
        <Skeleton className="mb-6 h-7 w-52" />
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {Array.from({ length: 4 }, (_, index) => (
            <div key={index} className="space-y-3">
              <Skeleton className="aspect-[1.2] w-full rounded-xl" />
              <Skeleton className="h-4 w-4/5" />
              <Skeleton className="h-3 w-2/5" />
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
