import { SkeletonCard } from '@/components/ui/Skeleton';

export default function ProductsLoading() {
  return (
    <main className="container-page grid gap-8 py-12">
      <div>
        <div className="h-10 w-48 rounded-xl bg-white/[0.06]" />
        <div className="mt-3 h-4 w-full max-w-2xl rounded-xl bg-white/[0.06]" />
      </div>
      <div className="glass h-40 rounded-2xl" />
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {Array.from({ length: 8 }, (_, index) => (
          <SkeletonCard key={index} />
        ))}
      </div>
    </main>
  );
}
