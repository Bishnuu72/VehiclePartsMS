import { useState } from 'react'
import { usersApi } from '../api/usersApi'
import { Modal } from './ui/Modal'
import { Button } from './ui/Button'
import { Field, Input } from './ui/Field'
import { Alert } from './ui/Alert'

const EMPTY = { current: '', next: '', confirm: '' }

export function ChangePasswordModal({ open, onClose }) {
  const [form, setForm] = useState(EMPTY)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [loading, setLoading] = useState(false)

  function close() {
    setForm(EMPTY)
    setError('')
    setSuccess(false)
    onClose()
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    if (form.next.length < 6) {
      setError('New password must be at least 6 characters.')
      return
    }
    if (form.next !== form.confirm) {
      setError('New password and confirmation do not match.')
      return
    }
    setLoading(true)
    try {
      await usersApi.changePassword(form.current, form.next)
      setSuccess(true)
      setForm(EMPTY)
    } catch (err) {
      setError(
        err.response?.data?.message ||
          err.response?.data?.Detailed ||
          'Could not change password. Check your current password and try again.',
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <Modal open={open} onClose={close} size="sm" title="Change Password" description="Confirm your current password to set a new one.">
      {success ? (
        <div className="space-y-4">
          <Alert tone="success">Your password has been changed successfully.</Alert>
          <Button className="w-full" onClick={close}>Done</Button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && <Alert tone="error">{error}</Alert>}
          <Field label="Current Password" required>
            <Input
              type="password" value={form.current} autoComplete="current-password"
              onChange={(e) => setForm((f) => ({ ...f, current: e.target.value }))}
              required placeholder="Enter current password"
            />
          </Field>
          <Field label="New Password" required hint="At least 6 characters">
            <Input
              type="password" value={form.next} autoComplete="new-password"
              onChange={(e) => setForm((f) => ({ ...f, next: e.target.value }))}
              required minLength={6} placeholder="Enter new password"
            />
          </Field>
          <Field label="Confirm New Password" required>
            <Input
              type="password" value={form.confirm} autoComplete="new-password"
              onChange={(e) => setForm((f) => ({ ...f, confirm: e.target.value }))}
              required placeholder="Re-enter new password"
            />
          </Field>
          <div className="flex gap-3 pt-1">
            <button
              type="button" onClick={close}
              className="flex-1 py-2.5 border border-gray-200 dark:border-zinc-700 text-gray-700 dark:text-zinc-300 text-sm font-semibold rounded-xl hover:bg-gray-50 dark:hover:bg-zinc-800 transition-colors"
            >
              Cancel
            </button>
            <Button type="submit" loading={loading} className="flex-1">
              {loading ? 'Saving…' : 'Change Password'}
            </Button>
          </div>
        </form>
      )}
    </Modal>
  )
}
