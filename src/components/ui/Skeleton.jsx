import { cn } from '../../lib/cn'

export function Skeleton({ className }) {
  return (
    <div
      className={cn(
        'animate-pulse rounded-lg bg-gray-200/70 dark:bg-zinc-800',
        className,
      )}
    />
  )
}

// Table-shaped skeleton for list/CRUD pages while data loads.
export function TableSkeleton({ rows = 6, cols = 4 }) {
  return (
    <div className="p-5 space-y-4">
      <div className="flex gap-4">
        {Array.from({ length: cols }).map((_, i) => (
          <Skeleton key={i} className="h-3.5 flex-1" />
        ))}
      </div>
      <div className="space-y-3">
        {Array.from({ length: rows }).map((_, r) => (
          <div key={r} className="flex items-center gap-4">
            {Array.from({ length: cols }).map((_, c) => (
              <Skeleton
                key={c}
                className={cn('h-10 flex-1', c === 0 && 'max-w-[40%]')}
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}

// Card grid skeleton for dashboards.
export function CardGridSkeleton({ count = 4 }) {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="bg-white dark:bg-zinc-900 rounded-2xl border border-gray-200/80 dark:border-zinc-800 p-6 space-y-4"
        >
          <Skeleton className="w-10 h-10 rounded-xl" />
          <Skeleton className="h-9 w-20" />
          <Skeleton className="h-3 w-24" />
        </div>
      ))}
    </div>
  )
}
