import { useState, useEffect } from 'react'
import { partsApi } from '../../api/partsApi'
import { vendorsApi } from '../../api/vendorsApi'
import { formatCurrency } from '../../utils/formatters'
import { Plus, ChevronLeft, ChevronRight, Search, Package, ImageIcon, LayoutGrid, List } from 'lucide-react'
import { cn } from '../../lib/cn'
import { PageHeader } from '../../components/ui/PageHeader'
import { Button } from '../../components/ui/Button'
import { Card } from '../../components/ui/Card'
import { Badge } from '../../components/ui/Badge'
import { Alert } from '../../components/ui/Alert'
import { EmptyState } from '../../components/ui/EmptyState'
import { TableSkeleton } from '../../components/ui/Skeleton'
import { Modal, ConfirmDialog } from '../../components/ui/Modal'
import { Field, Input, Textarea, Select } from '../../components/ui/Field'

const EMPTY_FORM = { name: '', description: '', category: '', price: '', stockQuantity: '', vendorId: '', imageUrl: '' }

export default function PartsPage() {
  const [parts, setParts] = useState([])
  const [vendors, setVendors] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('')
  const [view, setView] = useState('table')
  const [page, setPage] = useState(1)
  const PAGE_SIZE = 10
  const [modal, setModal] = useState(null)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState(EMPTY_FORM)
  const [formError, setFormError] = useState('')
  const [formLoading, setFormLoading] = useState(false)
  const [deleteId, setDeleteId] = useState(null)
  const [deleting, setDeleting] = useState(false)
  const [imageFile, setImageFile] = useState(null)
  const [imagePreview, setImagePreview] = useState(null)

  useEffect(() => { vendorsApi.getAll().then(({ data }) => setVendors(data)).catch(() => {}) }, [])
  useEffect(() => { fetchParts() }, [page, categoryFilter])

  async function fetchParts() {
    setLoading(true); setError('')
    try { const { data } = await partsApi.getAll(page, PAGE_SIZE, categoryFilter); setParts(data) }
    catch { setError('Failed to load parts.') }
    finally { setLoading(false) }
  }

  function openCreate() { setForm(EMPTY_FORM); setFormError(''); setImageFile(null); setImagePreview(null); setModal('create') }
  function openEdit(p) {
    setEditing(p)
    setForm({ name: p.name, description: p.description ?? '', category: p.category ?? '', price: String(p.price), stockQuantity: String(p.stockQuantity), vendorId: String(p.vendorId), imageUrl: p.imageUrl ?? '' })
    setFormError(''); setImageFile(null); setImagePreview(null); setModal('edit')
  }
  function closeModal() {
    if (imagePreview) URL.revokeObjectURL(imagePreview)
    setModal(null); setEditing(null); setForm(EMPTY_FORM); setImageFile(null); setImagePreview(null)
  }
  function handleImageChange(e) {
    const file = e.target.files?.[0]
    if (!file) return
    if (imagePreview) URL.revokeObjectURL(imagePreview)
    setImageFile(file)
    setImagePreview(URL.createObjectURL(file))
  }
  function handleChange(e) { setForm((prev) => ({ ...prev, [e.target.name]: e.target.value })) }
  function payload() { return { name: form.name, description: form.description || null, category: form.category || null, price: parseFloat(form.price), stockQuantity: parseInt(form.stockQuantity, 10), vendorId: parseInt(form.vendorId, 10), imageUrl: form.imageUrl || null } }

  async function handleSubmit(e) {
    e.preventDefault(); setFormError(''); setFormLoading(true)
    try {
      let partId
      if (modal === 'create') {
        const { data } = await partsApi.create(payload())
        partId = data.id
      } else {
        await partsApi.update(editing.id, payload())
        partId = editing.id
      }
      if (imageFile) await partsApi.uploadImage(partId, imageFile)
      closeModal(); fetchParts()
    } catch (err) { setFormError(err.response?.data?.message || 'Failed to save part.') }
    finally { setFormLoading(false) }
  }

  async function handleDelete(id) {
    setDeleting(true)
    try { await partsApi.delete(id); setDeleteId(null); fetchParts() }
    catch { setError('Failed to delete part.') }
    finally { setDeleting(false) }
  }

  const cols = ['Part', 'Category', 'Price', 'Stock', 'Vendor', '']
  const categoryOptions = [...new Set(parts.map((p) => p.category).filter(Boolean))].sort()

  return (
    <div className="space-y-6 animate-fade-in-up">
      <PageHeader title="Parts" description="Add, edit, and manage your vehicle parts inventory.">
        <Button icon={Plus} onClick={openCreate}>Add Part</Button>
      </PageHeader>

      {error && <Alert tone="error">{error}</Alert>}

      {/* Filter + view toggle */}
      <div className="flex items-center gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-zinc-500 pointer-events-none" />
          <Input
            type="text" placeholder="Filter by category…" value={categoryFilter}
            onChange={(e) => { setCategoryFilter(e.target.value); setPage(1) }}
            className="pl-10 bg-white dark:bg-zinc-900"
          />
        </div>
        <div className="ml-auto flex items-center gap-1 bg-gray-100 dark:bg-zinc-800/70 p-1 rounded-xl">
          {[['table', List], ['grid', LayoutGrid]].map(([key, Icon]) => (
            <button
              key={key}
              onClick={() => setView(key)}
              aria-label={`${key} view`}
              className={cn(
                'p-1.5 rounded-lg transition-all',
                view === key
                  ? 'bg-white dark:bg-zinc-900 text-gray-900 dark:text-white shadow-sm'
                  : 'text-gray-400 dark:text-zinc-500 hover:text-gray-600 dark:hover:text-zinc-300',
              )}
            >
              <Icon className="w-4 h-4" />
            </button>
          ))}
        </div>
      </div>

      {/* List */}
      {loading ? (
        <Card className="overflow-hidden"><TableSkeleton rows={6} cols={5} /></Card>
      ) : parts.length === 0 ? (
        <Card>
          <EmptyState
            icon={Package}
            title="No parts found"
            description={categoryFilter ? 'Try a different category filter.' : 'Add your first part to get started.'}
            action={!categoryFilter && <Button icon={Plus} onClick={openCreate}>Add Part</Button>}
          />
        </Card>
      ) : view === 'grid' ? (
        <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {parts.map((p) => (
            <div key={p.id} className="group bg-white dark:bg-zinc-900 rounded-2xl border border-gray-200/80 dark:border-zinc-800 overflow-hidden shadow-[0_1px_2px_rgba(0,0,0,0.04)] dark:shadow-none hover:shadow-[0_8px_28px_rgba(0,0,0,0.08)] dark:hover:border-zinc-700 transition-all duration-200">
              <div className="aspect-[4/3] bg-gray-50 dark:bg-zinc-800 overflow-hidden">
                {p.imageUrl ? (
                  <img src={p.imageUrl} alt={p.name} className="w-full h-full object-cover group-hover:scale-[1.04] transition-transform duration-300" onError={(e) => { e.currentTarget.style.display = 'none' }} />
                ) : (
                  <div className="w-full h-full flex items-center justify-center"><Package className="w-10 h-10 text-gray-300 dark:text-zinc-700" strokeWidth={1.5} /></div>
                )}
              </div>
              <div className="p-4">
                <div className="flex items-start justify-between gap-2">
                  <p className="font-semibold text-gray-900 dark:text-white text-sm leading-snug min-w-0">{p.name}</p>
                  {p.category && <Badge tone="neutral">{p.category}</Badge>}
                </div>
                {p.description && <p className="text-xs text-gray-500 dark:text-zinc-400 mt-1.5 line-clamp-2">{p.description}</p>}
                <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100 dark:border-zinc-800">
                  <span className="font-bold text-gray-900 dark:text-white tabular-nums">{formatCurrency(p.price)}</span>
                  <Badge tone={p.stockQuantity === 0 ? 'danger' : p.stockQuantity < 10 ? 'warning' : 'success'}>
                    {p.stockQuantity === 0 ? 'Out of stock' : `${p.stockQuantity} units`}
                  </Badge>
                </div>
                <p className="text-[11px] text-gray-400 dark:text-zinc-500 mt-2">{p.vendorName}</p>
                <div className="flex items-center gap-2 mt-3">
                  <Button size="sm" variant="secondary" className="flex-1" onClick={() => openEdit(p)}>Edit</Button>
                  <Button size="sm" variant="dangerSoft" className="flex-1" onClick={() => setDeleteId(p.id)}>Delete</Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[680px]">
              <thead>
                <tr className="border-b border-gray-100 dark:border-zinc-800 bg-gray-50/80 dark:bg-zinc-800/40">
                  {cols.map((h, i) => (
                    <th key={i} className="px-5 py-3.5 text-left text-[11px] font-bold text-gray-400 dark:text-zinc-500 uppercase tracking-[0.1em]">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-zinc-800/70">
                {parts.map((p) => (
                  <tr key={p.id} className="hover:bg-gray-50/60 dark:hover:bg-zinc-800/25 transition-colors">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        {p.imageUrl ? (
                          <img src={p.imageUrl} alt={p.name} className="w-10 h-10 object-cover rounded-lg flex-shrink-0 bg-gray-100 dark:bg-zinc-800" />
                        ) : (
                          <div className="w-10 h-10 bg-gray-100 dark:bg-zinc-800 rounded-lg flex items-center justify-center flex-shrink-0">
                            <Package className="w-4 h-4 text-gray-300 dark:text-zinc-600" />
                          </div>
                        )}
                        <div className="min-w-0">
                          <p className="font-semibold text-gray-900 dark:text-white">{p.name}</p>
                          {p.description && <p className="text-xs text-gray-400 dark:text-zinc-500 mt-0.5 truncate max-w-[180px]">{p.description}</p>}
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      {p.category
                        ? <Badge tone="neutral">{p.category}</Badge>
                        : <span className="text-gray-300 dark:text-zinc-600">—</span>}
                    </td>
                    <td className="px-5 py-4 font-bold text-gray-900 dark:text-white tabular-nums">{formatCurrency(p.price)}</td>
                    <td className="px-5 py-4">
                      <Badge tone={p.stockQuantity === 0 ? 'danger' : p.stockQuantity < 10 ? 'warning' : 'success'}>
                        {p.stockQuantity === 0 ? 'Out of stock' : `${p.stockQuantity} units`}
                      </Badge>
                    </td>
                    <td className="px-5 py-4 text-gray-500 dark:text-zinc-400">{p.vendorName}</td>
                    <td className="px-5 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <Button size="sm" variant="secondary" onClick={() => openEdit(p)}>Edit</Button>
                        <Button size="sm" variant="dangerSoft" onClick={() => setDeleteId(p.id)}>Delete</Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Pagination */}
      {!loading && parts.length > 0 && (
        <div className="flex items-center justify-end gap-2">
          <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}
            className="p-2 rounded-xl border border-gray-200 dark:border-zinc-700 text-gray-600 dark:text-zinc-400 hover:bg-gray-50 dark:hover:bg-zinc-800 disabled:opacity-30 disabled:pointer-events-none transition-colors">
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="text-sm text-gray-500 dark:text-zinc-400 px-3 font-semibold tabular-nums">Page {page}</span>
          <button onClick={() => setPage((p) => p + 1)} disabled={parts.length < PAGE_SIZE}
            className="p-2 rounded-xl border border-gray-200 dark:border-zinc-700 text-gray-600 dark:text-zinc-400 hover:bg-gray-50 dark:hover:bg-zinc-800 disabled:opacity-30 disabled:pointer-events-none transition-colors">
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Create / Edit modal */}
      <Modal
        open={!!modal}
        onClose={closeModal}
        size="md"
        title={modal === 'create' ? 'Add New Part' : 'Edit Part'}
        description={modal === 'create' ? 'Fill in the details to add a new part.' : 'Update the part information below.'}
      >
        {formError && <Alert tone="error" className="mb-5">{formError}</Alert>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <Field label="Part Name" required>
            <Input type="text" name="name" value={form.name} onChange={handleChange} required placeholder="e.g. Brake Pad" />
          </Field>
          <Field label="Description">
            <Textarea name="description" value={form.description} onChange={handleChange} rows={2} placeholder="Optional description…" />
          </Field>
          <Field label="Category" hint="Pick an existing category or type a new one.">
            <Input
              type="text" name="category" value={form.category} onChange={handleChange}
              placeholder="e.g. Brakes, Engine" list="category-options" autoComplete="off"
            />
            <datalist id="category-options">
              {categoryOptions.map((c) => <option key={c} value={c} />)}
            </datalist>
          </Field>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Price (NPR)" required>
              <Input type="number" name="price" value={form.price} onChange={handleChange} required min={0} step="0.01" placeholder="0.00" />
            </Field>
            <Field label="Stock Qty" required>
              <Input type="number" name="stockQuantity" value={form.stockQuantity} onChange={handleChange} required min={0} placeholder="0" />
            </Field>
          </div>
          <Field label="Vendor" required>
            <Select name="vendorId" value={form.vendorId} onChange={handleChange} required>
              <option value="">Select a vendor</option>
              {vendors.map((v) => <option key={v.id} value={v.id}>{v.name}</option>)}
            </Select>
          </Field>

          <Field label="Part Image">
            {(() => {
              const src = imagePreview ?? (imageFile ? null : (form.imageUrl || (modal === 'edit' ? editing?.imageUrl : null)))
              return src ? (
                <img src={src} alt="preview" className="w-full h-40 object-cover rounded-xl bg-gray-100 dark:bg-zinc-800 mb-3" onError={(e) => { e.currentTarget.style.display = 'none' }} />
              ) : null
            })()}
            <label className="flex items-center justify-center gap-2 w-full py-2.5 border-2 border-dashed border-gray-200 dark:border-zinc-700 rounded-xl cursor-pointer hover:border-gray-300 dark:hover:border-zinc-600 transition-colors text-sm text-gray-400 dark:text-zinc-500">
              <ImageIcon className="w-4 h-4 flex-shrink-0" />
              <span className="truncate max-w-[240px]">{imageFile ? imageFile.name : 'Upload file (JPEG / PNG / WebP)'}</span>
              <input type="file" className="hidden" accept="image/jpeg,image/png,image/webp" onChange={handleImageChange} />
            </label>
          </Field>

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={closeModal}
              className="flex-1 py-2.5 border border-gray-200 dark:border-zinc-700 text-gray-700 dark:text-zinc-300 text-sm font-semibold rounded-xl hover:bg-gray-50 dark:hover:bg-zinc-800 transition-colors">
              Cancel
            </button>
            <Button type="submit" loading={formLoading} className="flex-1">
              {formLoading ? 'Saving…' : modal === 'create' ? 'Add Part' : 'Save Changes'}
            </Button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        open={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={() => handleDelete(deleteId)}
        loading={deleting}
        title="Delete Part?"
        description="This will permanently remove the part from inventory. This action cannot be undone."
        confirmLabel="Delete"
      />
    </div>
  )
}
