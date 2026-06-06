import { cn } from '../../lib/cn'

// Accent ring colors kept subtle/professional — the icon tile is the only color.
const ACCENTS = {
  neutral: 'bg-gray-900 dark:bg-white text-white dark:text-gray-900',
  indigo: 'bg-indigo-600 text-white',
  blue: 'bg-blue-600 text-white',
  emerald: 'bg-emerald-600 text-white',
  amber: 'bg-amber-500 text-white',
  violet: 'bg-violet-600 text-white',
  red: 'bg-red-600 text-white',
}

export function StatCard({ label, value, sub, icon: Icon, accent = 'neutral', valueClassName }) {
  return (
    <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-gray-200/80 dark:border-zinc-800 p-6 shadow-[0_1px_2px_rgba(0,0,0,0.04)] dark:shadow-none transition-shadow hover:shadow-[0_4px_16px_rgba(0,0,0,0.06)] dark:hover:shadow-none">
      {Icon && (
        <div
          className={cn(
            'w-10 h-10 rounded-xl flex items-center justify-center mb-5',
            ACCENTS[accent],
          )}
        >
          <Icon className="w-5 h-5" strokeWidth={2} />
        </div>
      )}
      <p
        className={cn(
          'text-3xl font-bold leading-tight tracking-tight tabular-nums break-words',
          valueClassName || 'text-gray-900 dark:text-white',
        )}
      >
        {value}
      </p>
      <p className="text-sm font-semibold text-gray-700 dark:text-zinc-300 mt-2">{label}</p>
      {sub && <p className="text-xs text-gray-400 dark:text-zinc-500 mt-0.5">{sub}</p>}
    </div>
  )
}
