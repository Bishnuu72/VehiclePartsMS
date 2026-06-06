import { useState, useEffect } from 'react'
import { vendorsApi } from '../../api/vendorsApi'
import { Plus, Truck } from 'lucide-react'
import { PageHeader } from '../../components/ui/PageHeader'
import { Button } from '../../components/ui/Button'
import { Card } from '../../components/ui/Card'
import { Alert } from '../../components/ui/Alert'
import { EmptyState } from '../../components/ui/EmptyState'
import { TableSkeleton } from '../../components/ui/Skeleton'
import { Modal, ConfirmDialog } from '../../components/ui/Modal'
import { Field, Input, Textarea } from '../../components/ui/Field'

const VENDOR_COLORS = ['bg-violet-600', 'bg-blue-600', 'bg-emerald-600', 'bg-amber-500', 'bg-rose-600', 'bg-indigo-600', 'bg-cyan-600']
const EMPTY_FORM = { name: '', phone: '', email: '', address: '' }

export default function VendorsPage() {
  const [vendors, setVendors] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [modal, setModal] = useState(null)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState(EMPTY_FORM)
  const [formError, setFormError] = useState('')
  const [formLoading, setFormLoading] = useState(false)
  const [deleteId, setDeleteId] = useState(null)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => { fetchVendors() }, [])

  async function fetchVendors() {
    setLoading(true); setError('')
    try { const { data } = await vendorsApi.getAll(); setVendors(data) }
    catch { setError('Failed to load vendors.') }
    finally { setLoading(false) }
  }

  function openCreate() { setForm(EMPTY_FORM); setFormError(''); setModal('create') }
  function openEdit(v) { setEditing(v); setForm({ name: v.name, phone: v.phone ?? '', email: v.email ?? '', address: v.address ?? '' }); setFormError(''); setModal('edit') }
  function closeModal() { setModal(null); setEditing(null); setForm(EMPTY_FORM) }
  function handleChange(e) { setForm((p) => ({ ...p, [e.target.name]: e.target.value })) }
  function payload() { return { name: form.name, phone: form.phone || null, email: form.email || null, address: form.address || null } }

  async function handleSubmit(e) {
    e.preventDefault(); setFormError(''); setFormLoading(true)
    try {
      if (modal === 'create') await vendorsApi.create(payload())
      else await vendorsApi.update(editing.id, payload())
      closeModal(); fetchVendors()
    } catch (err) { setFormError(err.response?.data?.message || 'Failed to save vendor.') }
    finally { setFormLoading(false) }
  }

  async function handleDelete(id) {
    setDeleting(true)
    try { await vendorsApi.delete(id); setDeleteId(null); fetchVendors() }
    catch { setError('Failed to delete vendor. It may have parts linked to it.') }
    finally { setDeleting(false) }
  }

  return (
    <div className="space-y-6 animate-fade-in-up">
      <PageHeader title="Vendors" description="Manage supplier and vendor details.">
        <Button icon={Plus} onClick={openCreate}>Add Vendor</Button>
      </PageHeader>

      {error && <Alert tone="error">{error}</Alert>}

      <Card className="overflow-hidden">
        {loading ? (
          <TableSkeleton rows={5} cols={4} />
        ) : vendors.length === 0 ? (
          <EmptyState
            icon={Truck}
            title="No vendors found"
            description="Add your first vendor to start linking parts."
            action={<Button icon={Plus} onClick={openCreate}>Add Vendor</Button>}
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[600px]">
              <thead>
                <tr className="border-b border-gray-100 dark:border-zinc-800 bg-gray-50/70 dark:bg-zinc-800/50">
                  {['Name', 'Phone', 'Email', 'Address', ''].map((h, i) => (
                    <th key={i} className="px-5 py-3.5 text-left text-[11px] font-bold text-gray-400 dark:text-zinc-500 uppercase tracking-[0.1em]">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-zinc-800">
                {vendors.map((v, idx) => (
                  <tr key={v.id} className="hover:bg-gray-50/60 dark:hover:bg-zinc-800/30 transition-colors">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className={`w-9 h-9 ${VENDOR_COLORS[idx % VENDOR_COLORS.length]} rounded-xl flex items-center justify-center flex-shrink-0`}>
                          <span className="text-[11px] font-bold text-white">{v.name.charAt(0).toUpperCase()}</span>
                        </div>
                        <span className="font-semibold text-gray-900 dark:text-white">{v.name}</span>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-gray-500 dark:text-zinc-400">{v.phone ?? '—'}</td>
                    <td className="px-5 py-4 text-gray-500 dark:text-zinc-400">{v.email ?? '—'}</td>
                    <td className="px-5 py-4 text-gray-400 dark:text-zinc-500 max-w-xs truncate">{v.address ?? '—'}</td>
                    <td className="px-5 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <Button size="sm" variant="secondary" onClick={() => openEdit(v)}>Edit</Button>
                        <Button size="sm" variant="dangerSoft" onClick={() => setDeleteId(v.id)}>Delete</Button>
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
        open={!!modal}
        onClose={closeModal}
        size="md"
        title={modal === 'create' ? 'Add New Vendor' : 'Edit Vendor'}
      >
        {formError && <Alert tone="error" className="mb-4">{formError}</Alert>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <Field label="Name" required>
            <Input type="text" name="name" value={form.name} onChange={handleChange} required />
          </Field>
          <Field label="Phone">
            <Input type="tel" name="phone" value={form.phone} onChange={handleChange} />
          </Field>
          <Field label="Email">
            <Input type="email" name="email" value={form.email} onChange={handleChange} />
          </Field>
          <Field label="Address">
            <Textarea name="address" value={form.address} onChange={handleChange} rows={2} />
          </Field>
          <div className="flex gap-3 pt-1">
            <button type="button" onClick={closeModal} className="flex-1 py-2.5 border border-gray-200 dark:border-zinc-700 text-gray-700 dark:text-zinc-300 text-sm font-semibold rounded-xl hover:bg-gray-50 dark:hover:bg-zinc-800 transition-colors">
              Cancel
            </button>
            <Button type="submit" loading={formLoading} className="flex-1">
              {formLoading ? 'Saving…' : modal === 'create' ? 'Add Vendor' : 'Save Changes'}
            </Button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        open={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={() => handleDelete(deleteId)}
        loading={deleting}
        title="Delete Vendor?"
        description="Vendors with linked parts cannot be deleted. This action cannot be undone."
        confirmLabel="Delete"
      />
    </div>
  )
}
