import { AlertCircle, CheckCircle2, Info } from 'lucide-react'
import { cn } from '../../lib/cn'

const TONES = {
  error: {
    box: 'bg-red-50 dark:bg-red-950/40 border-red-100 dark:border-red-900/40 text-red-600 dark:text-red-400',
    icon: AlertCircle,
  },
  success: {
    box: 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-100 dark:border-emerald-900/40 text-emerald-700 dark:text-emerald-400',
    icon: CheckCircle2,
  },
  info: {
    box: 'bg-blue-50 dark:bg-blue-950/40 border-blue-100 dark:border-blue-900/40 text-blue-700 dark:text-blue-400',
    icon: Info,
  },
}

export function Alert({ tone = 'error', children, className }) {
  if (!children) return null
  const { box, icon: Icon } = TONES[tone]
  return (
    <div
      className={cn(
        'flex items-start gap-2.5 px-4 py-3 rounded-xl border text-sm',
        box,
        className,
      )}
    >
      <Icon className="w-4 h-4 mt-0.5 flex-shrink-0" strokeWidth={2.2} />
      <span className="min-w-0">{children}</span>
    </div>
  )
}
