import { SkeletonCard } from '@/components/ui/Skeleton';

export default function ProductsLoading() {
  return (
    <main className="container-page grid gap-8 py-12 animate-fade-in">
      <div>
        <div className="h-9 w-48 rounded-lg bg-cafe-dark-700" />
        <div className="mt-2 h-4 w-full max-w-md rounded-md bg-cafe-dark-700" />
      </div>
      <div className="h-20 rounded-card bg-cafe-dark-700" />
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {Array.from({ length: 8 }, (_, index) => (
          <SkeletonCard key={index} />
        ))}
      </div>
    </main>
  );
}
