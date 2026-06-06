export function PageHeader({ title, description, children }) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div className="min-w-0">
        <h1 className="text-2xl sm:text-[1.75rem] font-bold text-gray-900 dark:text-white tracking-tight">
          {title}
        </h1>
        {description && (
          <p className="text-sm text-gray-500 dark:text-zinc-500 mt-1">{description}</p>
        )}
      </div>
      {children && <div className="flex items-center gap-2.5 flex-shrink-0">{children}</div>}
    </div>
  )
}
