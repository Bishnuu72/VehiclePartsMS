export function EmptyState({ icon: Icon, title, description, action }) {
  return (
    <div className="flex flex-col items-center justify-center text-center py-16 px-6">
      {Icon && (
        <div className="w-12 h-12 rounded-2xl bg-gray-100 dark:bg-zinc-800 flex items-center justify-center mb-4">
          <Icon className="w-5 h-5 text-gray-400 dark:text-zinc-500" strokeWidth={2} />
        </div>
      )}
      <p className="text-sm font-semibold text-gray-700 dark:text-zinc-300">{title}</p>
      {description && (
        <p className="text-sm text-gray-400 dark:text-zinc-500 mt-1 max-w-xs">
          {description}
        </p>
      )}
      {action && <div className="mt-5">{action}</div>}
    </div>
  )
}
