import { cn } from '../../lib/cn'

const VARIANTS = {
  primary:
    'bg-gray-900 text-white hover:bg-gray-800 dark:bg-white dark:text-gray-900 dark:hover:bg-zinc-200 ' +
    'shadow-[0_1px_2px_rgba(0,0,0,0.08)]',
  secondary:
    'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50 ' +
    'dark:bg-zinc-800 dark:text-zinc-200 dark:border-zinc-700 dark:hover:bg-zinc-700/70',
  ghost:
    'text-gray-600 hover:bg-gray-100 hover:text-gray-900 ' +
    'dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-white',
  danger:
    'bg-red-600 text-white hover:bg-red-700 shadow-[0_1px_2px_rgba(0,0,0,0.08)]',
  dangerSoft:
    'bg-red-50 text-red-600 hover:bg-red-100 ' +
    'dark:bg-red-900/20 dark:text-red-400 dark:hover:bg-red-900/30',
}

const SIZES = {
  sm: 'text-xs px-3 py-1.5 gap-1.5 rounded-lg',
  md: 'text-sm px-4 py-2.5 gap-2 rounded-xl',
  lg: 'text-sm px-5 py-3 gap-2 rounded-xl',
}

export function Button({
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  icon: Icon,
  className,
  children,
  type = 'button',
  ...props
}) {
  return (
    <button
      type={type}
      disabled={disabled || loading}
      className={cn(
        'inline-flex items-center justify-center font-semibold whitespace-nowrap',
        'transition-all duration-150 active:scale-[0.98]',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-900/20 dark:focus-visible:ring-white/25',
        'disabled:opacity-50 disabled:pointer-events-none',
        VARIANTS[variant],
        SIZES[size],
        className,
      )}
      {...props}
    >
      {loading ? (
        <span className="w-4 h-4 rounded-full border-2 border-current/30 border-t-current animate-spin" />
      ) : (
        Icon && <Icon className="w-4 h-4 flex-shrink-0" strokeWidth={2.4} />
      )}
      {children}
    </button>
  )
}
