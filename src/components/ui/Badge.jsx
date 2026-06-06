import { cn } from '../../lib/cn'

const TONES = {
  neutral: 'bg-gray-100 text-gray-600 dark:bg-zinc-800 dark:text-zinc-300',
  success: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/25 dark:text-emerald-400',
  warning: 'bg-amber-50 text-amber-700 dark:bg-amber-900/25 dark:text-amber-400',
  danger: 'bg-red-50 text-red-700 dark:bg-red-900/25 dark:text-red-400',
  info: 'bg-blue-50 text-blue-700 dark:bg-blue-900/25 dark:text-blue-400',
}

export function Badge({ tone = 'neutral', dot = false, className, children }) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold',
        TONES[tone],
        className,
      )}
    >
      {dot && <span className="w-1.5 h-1.5 rounded-full bg-current opacity-70" />}
      {children}
    </span>
  )
}
