import { cn } from '../../lib/cn'

const SIZES = {
  sm: 'w-4 h-4 border-2',
  md: 'w-6 h-6 border-2',
  lg: 'w-8 h-8 border-[3px]',
}

export function Spinner({ size = 'md', className }) {
  return (
    <div
      role="status"
      aria-label="Loading"
      className={cn(
        'rounded-full animate-spin border-gray-200 border-t-gray-900 dark:border-zinc-700 dark:border-t-white',
        SIZES[size],
        className,
      )}
    />
  )
}

export function PageLoader({ label = 'Loading…' }) {
  return (
    <div className="flex flex-col items-center justify-center py-28 gap-4">
      <Spinner size="lg" />
      <p className="text-sm text-gray-400 dark:text-zinc-500">{label}</p>
    </div>
  )
}
