import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { partRequestsApi } from '../../api/partRequestsApi'
import { useCustomerProfile } from '../../hooks/useCustomerProfile'
import { formatDate } from '../../utils/formatters'
import { Wrench, Plus, Pencil, Trash2 } from 'lucide-react'
import { PageHeader } from '../../components/ui/PageHeader'
import { Button } from '../../components/ui/Button'
import { Card } from '../../components/ui/Card'
import { Badge } from '../../components/ui/Badge'
import { Alert } from '../../components/ui/Alert'
import { EmptyState } from '../../components/ui/EmptyState'
import { PageLoader } from '../../components/ui/Spinner'
import { ConfirmDialog } from '../../components/ui/Modal'
import { Field, Input, Textarea } from '../../components/ui/Field'

const STATUS_TONE = {
  Pending: 'warning',
  Available: 'success',
  Unavailable: 'danger',
}
const EMPTY_FORM = { partName: '', description: '' }

export default function PartRequestsPage() {
  const { profile, loading: profileLoading, error: profileError } = useCustomerProfile()

  const [requests, setRequests] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [form, setForm] = useState(EMPTY_FORM)
  const [formLoading, setFormLoading] = useState(false)
  const [formError, setFormError] = useState('')
  const [deleteId, setDeleteId] = useState(null)
  const [deleting, setDeleting] = useState(false)
  const [searchParams, setSearchParams] = useSearchParams()

  useEffect(() => { fetchRequests() }, [])

  // Prefill + open the form when arriving from the catalog (?part=Name)
  useEffect(() => {
    const part = searchParams.get('part')
    if (part) {
      setEditingId(null)
      setForm({ partName: part, description: '' })
      setShowForm(true)
      setFormError('')
      searchParams.delete('part')
      setSearchParams(searchParams, { replace: true })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  async function fetchRequests() {
    setLoading(true)
    try {
      const { data } = await partRequestsApi.getAll()
      setRequests(data)
    } catch {
      setError('Failed to load requests.')
    } finally {
      setLoading(false)
    }
  }

  function openCreate() {
    setEditingId(null)
    setForm(EMPTY_FORM)
    setFormError('')
    setShowForm((v) => !v)
  }

  function openEdit(req) {
    setEditingId(req.id)
    setForm({ partName: req.partName, description: req.description ?? '' })
    setFormError('')
    setShowForm(true)
  }

  function closeForm() {
    setShowForm(false)
    setEditingId(null)
    setForm(EMPTY_FORM)
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (!profile) return
    setFormError('')
    setFormLoading(true)
    try {
      if (editingId) {
        await partRequestsApi.update(editingId, {
          partName: form.partName,
          description: form.description || null,
        })
      } else {
        await partRequestsApi.create({
          customerProfileId: profile.id,
          partName: form.partName,
          description: form.description || null,
        })
      }
      closeForm()
      fetchRequests()
    } catch (err) {
      setFormError(err.response?.data?.message || 'Failed to save request.')
    } finally {
      setFormLoading(false)
    }
  }

  async function handleDelete() {
    if (!deleteId) return
    setDeleting(true)
    try {
      await partRequestsApi.delete(deleteId)
      setDeleteId(null)
      fetchRequests()
    } catch {
      setError('Failed to delete request.')
      setDeleteId(null)
    } finally {
      setDeleting(false)
    }
  }

  const myRequests = profile
    ? requests.filter((r) => r.customerProfileId === profile.id)
    : []

  if (profileLoading) return <PageLoader />
  if (profileError) return <Alert tone="error">{profileError}</Alert>

  return (
    <div className="max-w-2xl space-y-6 animate-fade-in-up">
      <PageHeader title="Part Requests" description="Request parts that are not currently in stock.">
        <Button variant="primary" icon={Plus} onClick={openCreate}>
          {showForm && !editingId ? 'Close' : 'New Request'}
        </Button>
      </PageHeader>

      {error && <Alert tone="error">{error}</Alert>}

      {showForm && (
        <Card padded>
          <h3 className="text-[15px] font-semibold text-gray-900 dark:text-white mb-5">
            {editingId ? 'Edit Request' : 'Request a Part'}
          </h3>
          {formError && <Alert tone="error" className="mb-4">{formError}</Alert>}
          <form onSubmit={handleSubmit} className="space-y-4">
            <Field label="Part Name" required>
              <Input
                type="text" value={form.partName}
                onChange={(e) => setForm((f) => ({ ...f, partName: e.target.value }))}
                required placeholder="e.g. Brake pad for Toyota Hilux 2019"
              />
            </Field>
            <Field label="Description">
              <Textarea
                value={form.description}
                onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                rows={3} placeholder="Additional details about the part…"
              />
            </Field>
            <div className="flex gap-3 pt-1">
              <button type="button" onClick={closeForm} className="flex-1 py-2.5 border border-gray-200 dark:border-zinc-700 text-gray-700 dark:text-zinc-300 text-sm font-semibold rounded-xl hover:bg-gray-50 dark:hover:bg-zinc-800 transition-colors">
                Cancel
              </button>
              <Button type="submit" loading={formLoading} className="flex-1">
                {formLoading ? 'Saving…' : editingId ? 'Save Changes' : 'Submit Request'}
              </Button>
            </div>
          </form>
        </Card>
      )}

      <div className="space-y-3">
        {loading ? (
          <PageLoader label="Loading requests…" />
        ) : myRequests.length === 0 ? (
          <Card>
            <EmptyState icon={Wrench} title="No part requests yet" description="Submit a request for a part that's out of stock." />
          </Card>
        ) : (
          myRequests.map((req) => {
            const editable = req.status === 'Pending'
            return (
              <Card key={req.id} className="p-4">
                <div className="flex justify-between items-start gap-4">
                  <div className="flex items-start gap-3 min-w-0">
                    <div className="w-9 h-9 rounded-xl bg-indigo-600 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Wrench className="w-4 h-4 text-white" strokeWidth={2} />
                    </div>
                    <div className="min-w-0">
                      <p className="font-semibold text-gray-900 dark:text-white text-sm">{req.partName}</p>
                      {req.description && <p className="text-xs text-gray-500 dark:text-zinc-400 mt-0.5">{req.description}</p>}
                      <p className="text-xs text-gray-400 dark:text-zinc-500 mt-1">{formatDate(req.requestDate)}</p>
                    </div>
                  </div>
                  <Badge tone={STATUS_TONE[req.status] ?? 'neutral'} className="flex-shrink-0">{req.status}</Badge>
                </div>
                {req.status === 'Available' && (
                  <div className="mt-3 px-3.5 py-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-100 dark:border-emerald-900/40 text-[13px] text-emerald-700 dark:text-emerald-400">
                    🎉 This part is now available. Visit the store or contact our staff to purchase it — quote this request so we can serve you faster.
                  </div>
                )}
                {req.status === 'Unavailable' && (
                  <div className="mt-3 px-3.5 py-2.5 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-100 dark:border-red-900/40 text-[13px] text-red-600 dark:text-red-400">
                    We couldn't source this part. You can submit a new request later or contact staff for compatible alternatives.
                  </div>
                )}
                {req.status === 'Pending' && (
                  <div className="mt-3 px-3.5 py-2.5 rounded-xl bg-gray-50 dark:bg-zinc-800/50 border border-gray-100 dark:border-zinc-800 text-[13px] text-gray-500 dark:text-zinc-400">
                    Our team is reviewing your request. You'll be notified by email once it's resolved.
                  </div>
                )}
                <div className="flex items-center justify-end gap-2 mt-3 pt-3 border-t border-gray-100 dark:border-zinc-800">
                  {editable && (
                    <Button size="sm" variant="secondary" icon={Pencil} onClick={() => openEdit(req)}>Edit</Button>
                  )}
                  <Button size="sm" variant="ghost" icon={Trash2} onClick={() => setDeleteId(req.id)}>Delete</Button>
                </div>
              </Card>
            )
          })
        )}
      </div>

      <ConfirmDialog
        open={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDelete}
        loading={deleting}
        title="Delete this request?"
        description="This permanently removes your part request. This cannot be undone."
        confirmLabel="Delete"
      />
    </div>
  )
}
