import { cn } from '../../lib/cn'

const CONTROL =
  'w-full px-4 py-2.5 bg-gray-50 dark:bg-zinc-800/60 border border-gray-200 dark:border-zinc-700 ' +
  'rounded-xl text-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-zinc-500 ' +
  'focus:outline-none focus-visible:ring-2 focus-visible:ring-gray-900/15 dark:focus-visible:ring-white/20 ' +
  'focus-visible:border-gray-300 dark:focus-visible:border-zinc-600 transition-all duration-150 ' +
  'disabled:opacity-60 disabled:cursor-not-allowed'

export function Label({ children, htmlFor, required, className }) {
  return (
    <label
      htmlFor={htmlFor}
      className={cn(
        'block text-[11px] font-bold text-gray-500 dark:text-zinc-500 mb-1.5 uppercase tracking-[0.12em]',
        className,
      )}
    >
      {children}
      {required && <span className="text-red-500 ml-0.5">*</span>}
    </label>
  )
}

export function Input({ className, ...props }) {
  return <input className={cn(CONTROL, className)} {...props} />
}

export function Textarea({ className, ...props }) {
  return <textarea className={cn(CONTROL, 'resize-none', className)} {...props} />
}

export function Select({ className, children, ...props }) {
  return (
    <select className={cn(CONTROL, 'cursor-pointer', className)} {...props}>
      {children}
    </select>
  )
}

// Label + control + optional hint/error, consistently spaced.
export function Field({ label, htmlFor, required, hint, error, children, className }) {
  return (
    <div className={className}>
      {label && (
        <Label htmlFor={htmlFor} required={required}>
          {label}
        </Label>
      )}
      {children}
      {error ? (
        <p className="text-[11.5px] text-red-500 mt-1.5 font-medium">{error}</p>
      ) : hint ? (
        <p className="text-[11.5px] text-gray-400 dark:text-zinc-500 mt-1.5">{hint}</p>
      ) : null}
    </div>
  )
}
