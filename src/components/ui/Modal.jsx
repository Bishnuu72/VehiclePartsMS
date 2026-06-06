import { useEffect } from 'react'
import { createPortal } from 'react-dom'
import { X } from 'lucide-react'
import { cn } from '../../lib/cn'

const WIDTHS = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-lg',
  xl: 'max-w-2xl',
}

export function Modal({ open, onClose, title, description, size = 'md', children }) {
  useEffect(() => {
    if (!open) return
    function onKey(e) {
      if (e.key === 'Escape') onClose?.()
    }
    document.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [open, onClose])

  if (!open) return null

  return createPortal(
    <div
      className="fixed inset-0 z-[100] overflow-y-auto bg-black/50 dark:bg-black/70 backdrop-blur-sm"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose?.()
      }}
    >
      <div className="flex min-h-full items-center justify-center p-4">
      <div
        role="dialog"
        aria-modal="true"
        onMouseDown={(e) => e.stopPropagation()}
        className={cn(
          'w-full my-8 bg-white dark:bg-zinc-900 rounded-2xl border border-gray-200/80 dark:border-zinc-800',
          'shadow-2xl animate-[modalIn_140ms_ease-out]',
          WIDTHS[size],
        )}
      >
        <div className="flex items-start justify-between gap-4 px-7 pt-6 pb-5">
          <div className="min-w-0">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">{title}</h3>
            {description && (
              <p className="text-sm text-gray-400 dark:text-zinc-500 mt-1">{description}</p>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="p-1.5 -mr-1.5 -mt-1 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 dark:text-zinc-500 dark:hover:text-zinc-200 dark:hover:bg-zinc-800 transition-colors"
          >
            <X className="w-4 h-4" strokeWidth={2.5} />
          </button>
        </div>
        <div className="px-7 pb-7">{children}</div>
      </div>
      </div>
    </div>,
    document.body,
  )
}

// Confirmation dialog (used for destructive actions).
export function ConfirmDialog({
  open,
  onClose,
  onConfirm,
  title = 'Are you sure?',
  description,
  confirmLabel = 'Confirm',
  loading = false,
  icon: Icon,
  tone = 'danger',
}) {
  const confirmTone =
    tone === 'danger'
      ? 'bg-red-600 hover:bg-red-700'
      : 'bg-gray-900 hover:bg-gray-800 dark:bg-white dark:text-gray-900 dark:hover:bg-zinc-200'
  return (
    <Modal open={open} onClose={onClose} size="sm" title={title} description={description}>
      <div className="flex gap-3 pt-1">
        <button
          type="button"
          onClick={onClose}
          className="flex-1 py-2.5 border border-gray-200 dark:border-zinc-700 text-gray-700 dark:text-zinc-300 text-sm font-semibold rounded-xl hover:bg-gray-50 dark:hover:bg-zinc-800 transition-colors"
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={onConfirm}
          disabled={loading}
          className={`flex-1 inline-flex items-center justify-center gap-2 py-2.5 disabled:opacity-60 text-white text-sm font-bold rounded-xl transition-colors ${confirmTone}`}
        >
          {loading && (
            <span className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
          )}
          {Icon && !loading && <Icon className="w-4 h-4" strokeWidth={2.4} />}
          {confirmLabel}
        </button>
      </div>
    </Modal>
  )
}
