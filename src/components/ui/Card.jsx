import { cn } from '../../lib/cn'

const BASE =
  'bg-white dark:bg-zinc-900 border border-gray-200/80 dark:border-zinc-800 rounded-2xl ' +
  'shadow-[0_1px_2px_rgba(0,0,0,0.04),0_1px_3px_rgba(0,0,0,0.03)] dark:shadow-none'

export function Card({ className, children, padded = false, ...props }) {
  return (
    <div className={cn(BASE, padded && 'p-6', className)} {...props}>
      {children}
    </div>
  )
}

export function CardHeader({ title, description, icon: Icon, action, className }) {
  return (
    <div
      className={cn(
        'flex items-center justify-between gap-4 px-6 py-5 border-b border-gray-100 dark:border-zinc-800',
        className,
      )}
    >
      <div className="flex items-center gap-3 min-w-0">
        {Icon && (
          <div className="w-9 h-9 rounded-xl bg-gray-100 dark:bg-zinc-800 flex items-center justify-center flex-shrink-0">
            <Icon className="w-4 h-4 text-gray-500 dark:text-zinc-400" strokeWidth={2} />
          </div>
        )}
        <div className="min-w-0">
          <h3 className="font-semibold text-gray-900 dark:text-white text-[15px] truncate">
            {title}
          </h3>
          {description && (
            <p className="text-xs text-gray-400 dark:text-zinc-500 mt-0.5 truncate">
              {description}
            </p>
          )}
        </div>
      </div>
      {action && <div className="flex-shrink-0">{action}</div>}
    </div>
  )
}

export function CardBody({ className, children }) {
  return <div className={cn('p-6', className)}>{children}</div>
}
