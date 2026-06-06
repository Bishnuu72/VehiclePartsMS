import { useState, useEffect } from 'react'
import { usersApi } from '../../api/usersApi'
import { UserPlus, Users } from 'lucide-react'
import { formatDate } from '../../utils/formatters'
import { PageHeader } from '../../components/ui/PageHeader'
import { Button } from '../../components/ui/Button'
import { Card } from '../../components/ui/Card'
import { Badge } from '../../components/ui/Badge'
import { Alert } from '../../components/ui/Alert'
import { EmptyState } from '../../components/ui/EmptyState'
import { TableSkeleton } from '../../components/ui/Skeleton'
import { Modal, ConfirmDialog } from '../../components/ui/Modal'
import { Field, Input } from '../../components/ui/Field'
import { PageLoader } from '../../components/ui/Spinner'

const EMPTY_FORM = { firstName: '', lastName: '', email: '', password: '' }
const AVATAR_COLORS = [
  'from-violet-400 to-violet-600',
  'from-blue-400 to-blue-600',
  'from-emerald-400 to-emerald-600',
  'from-amber-400 to-amber-600',
  'from-rose-400 to-rose-600',
  'from-cyan-400 to-cyan-600',
]

function getInitials(name) {
  if (!name) return '?'
  return name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase()
}

export default function StaffPage() {
  const [staff, setStaff] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [form, setForm] = useState(EMPTY_FORM)
  const [formError, setFormError] = useState('')
  const [formLoading, setFormLoading] = useState(false)
  const [deleteId, setDeleteId] = useState(null)
  const [deleting, setDeleting] = useState(false)
  const [detail, setDetail] = useState(null)
  const [detailLoading, setDetailLoading] = useState(false)

  useEffect(() => { fetchStaff() }, [])

  async function openDetail(id) {
    setDetail(null)
    setDetailLoading(true)
    try {
      const { data } = await usersApi.getById(id)
      setDetail(data)
    } catch {
      setError('Failed to load staff details.')
    } finally {
      setDetailLoading(false)
    }
  }

  async function fetchStaff() {
    setLoading(true); setError('')
    try { const { data } = await usersApi.getStaff(); setStaff(data) }
    catch { setError('Failed to load staff.') }
    finally { setLoading(false) }
  }

  function handleChange(e) { setForm((p) => ({ ...p, [e.target.name]: e.target.value })) }

  async function handleCreate(e) {
    e.preventDefault(); setFormError(''); setFormLoading(true)
    try {
      await usersApi.createStaff({ ...form, role: 'Staff' })
      setShowModal(false); setForm(EMPTY_FORM); fetchStaff()
    } catch (err) { setFormError(err.response?.data?.message || 'Failed to create staff.') }
    finally { setFormLoading(false) }
  }

  async function handleDelete(id) {
    setDeleting(true)
    try { await usersApi.deleteStaff(id); setDeleteId(null); fetchStaff() }
    catch { setError('Failed to delete staff.') }
    finally { setDeleting(false) }
  }

  return (
    <div className="space-y-6 animate-fade-in-up">
      <PageHeader title="Staff" description="Register and manage staff accounts.">
        <Button icon={UserPlus} onClick={() => { setShowModal(true); setFormError('') }}>Add Staff</Button>
      </PageHeader>

      {error && <Alert tone="error">{error}</Alert>}

      <Card className="overflow-hidden">
        {loading ? (
          <TableSkeleton rows={5} cols={4} />
        ) : staff.length === 0 ? (
          <EmptyState
            icon={Users}
            title="No staff members yet"
            description='Click "Add Staff" to create the first account.'
            action={<Button icon={UserPlus} onClick={() => { setShowModal(true); setFormError('') }}>Add Staff</Button>}
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[600px]">
              <thead>
                <tr className="border-b border-gray-100 dark:border-zinc-800 bg-gray-50/80 dark:bg-zinc-800/40">
                  {['Member', 'Email', 'Role', 'Status', ''].map((h, i) => (
                    <th key={i} className="px-5 py-3.5 text-left text-[11px] font-bold text-gray-400 dark:text-zinc-500 uppercase tracking-[0.1em]">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-zinc-800/70">
                {staff.map((s, i) => (
                  <tr key={s.id} className="hover:bg-gray-50/60 dark:hover:bg-zinc-800/25 transition-colors">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className={`w-9 h-9 rounded-full bg-gradient-to-br ${AVATAR_COLORS[i % AVATAR_COLORS.length]} flex items-center justify-center flex-shrink-0`}>
                          <span className="text-[11px] font-bold text-white">{getInitials(s.fullName)}</span>
                        </div>
                        <p className="font-semibold text-gray-900 dark:text-white">{s.fullName}</p>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-gray-500 dark:text-zinc-400">{s.email}</td>
                    <td className="px-5 py-4"><Badge tone="info">{s.role}</Badge></td>
                    <td className="px-5 py-4">
                      <Badge tone={s.isActive ? 'success' : 'neutral'}>{s.isActive ? 'Active' : 'Inactive'}</Badge>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex justify-end gap-2">
                        <Button size="sm" variant="secondary" onClick={() => openDetail(s.id)}>View</Button>
                        <Button size="sm" variant="dangerSoft" onClick={() => setDeleteId(s.id)}>Delete</Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      <Modal
        open={showModal}
        onClose={() => { setShowModal(false); setForm(EMPTY_FORM) }}
        size="md"
        title="Add New Staff"
        description="Create a new staff account with portal access."
      >
        {formError && <Alert tone="error" className="mb-4">{formError}</Alert>}
        <form onSubmit={handleCreate} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Field label="First Name" required>
              <Input type="text" name="firstName" value={form.firstName} onChange={handleChange} required placeholder="John" />
            </Field>
            <Field label="Last Name" required>
              <Input type="text" name="lastName" value={form.lastName} onChange={handleChange} required placeholder="Doe" />
            </Field>
          </div>
          <Field label="Email" required>
            <Input type="email" name="email" value={form.email} onChange={handleChange} required placeholder="staff@example.com" />
          </Field>
          <Field label="Password" required hint="Minimum 6 characters">
            <Input type="password" name="password" value={form.password} onChange={handleChange} required minLength={6} placeholder="Create a password" />
          </Field>
          <div className="flex gap-3 pt-1">
            <button type="button" onClick={() => { setShowModal(false); setForm(EMPTY_FORM) }} className="flex-1 py-2.5 border border-gray-200 dark:border-zinc-700 text-gray-700 dark:text-zinc-300 text-sm font-semibold rounded-xl hover:bg-gray-50 dark:hover:bg-zinc-800 transition-colors">
              Cancel
            </button>
            <Button type="submit" loading={formLoading} className="flex-1">
              {formLoading ? 'Creating…' : 'Create Staff'}
            </Button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        open={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={() => handleDelete(deleteId)}
        loading={deleting}
        title="Remove Staff Member?"
        description="This will permanently delete the account and revoke portal access immediately."
        confirmLabel="Delete"
      />

      <Modal
        open={detailLoading || !!detail}
        onClose={() => setDetail(null)}
        size="md"
        title="Staff Detail"
      >
        {detailLoading || !detail ? (
          <PageLoader label="Loading…" />
        ) : (
          <div>
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl overflow-hidden flex-shrink-0 bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center">
                {detail.profilePictureUrl ? (
                  <img
                    src={detail.profilePictureUrl} alt="Profile"
                    className="w-full h-full object-cover"
                    onError={(e) => { e.currentTarget.style.display = 'none' }}
                  />
                ) : (
                  <span className="text-lg font-bold text-white">
                    {getInitials(`${detail.firstName} ${detail.lastName}`)}
                  </span>
                )}
              </div>
              <div className="min-w-0">
                <p className="text-lg font-bold text-gray-900 dark:text-white">
                  {detail.firstName} {detail.lastName}
                </p>
                <p className="text-sm text-gray-500 dark:text-zinc-400 truncate">{detail.email}</p>
                <div className="flex items-center gap-2 mt-1.5">
                  <Badge tone="info">{detail.role}</Badge>
                  <Badge tone={detail.isActive ? 'success' : 'neutral'}>
                    {detail.isActive ? 'Active' : 'Inactive'}
                  </Badge>
                </div>
              </div>
            </div>
            <dl className="mt-5 divide-y divide-gray-100 dark:divide-zinc-800/70">
              {[
                ['Phone', detail.phone ?? '—'],
                ['Member since', formatDate(detail.createdAt)],
              ].map(([label, val]) => (
                <div key={label} className="flex justify-between items-center gap-4 py-3">
                  <dt className="text-[11px] font-bold text-gray-400 dark:text-zinc-500 uppercase tracking-[0.1em]">
                    {label}
                  </dt>
                  <dd className="text-sm font-semibold text-gray-900 dark:text-white text-right">{val}</dd>
                </div>
              ))}
            </dl>
          </div>
        )}
      </Modal>
    </div>
  )
}
