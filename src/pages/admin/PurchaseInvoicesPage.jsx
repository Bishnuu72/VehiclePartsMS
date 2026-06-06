import { useState, useEffect, Fragment } from 'react'
import { purchaseInvoicesApi } from '../../api/purchaseInvoicesApi'
import { vendorsApi } from '../../api/vendorsApi'
import { partsApi } from '../../api/partsApi'
import { useAuth } from '../../hooks/useAuth'
import { formatCurrency, formatDate } from '../../utils/formatters'
import { Plus, ChevronDown, ChevronUp, ShoppingBag } from 'lucide-react'
import { PageHeader } from '../../components/ui/PageHeader'
import { Button } from '../../components/ui/Button'
import { Card } from '../../components/ui/Card'
import { Alert } from '../../components/ui/Alert'
import { EmptyState } from '../../components/ui/EmptyState'
import { TableSkeleton } from '../../components/ui/Skeleton'
import { Modal } from '../../components/ui/Modal'
import { Field, Select, Input } from '../../components/ui/Field'

export default function PurchaseInvoicesPage() {
  const { user } = useAuth()
  const [invoices, setInvoices] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [vendors, setVendors] = useState([])
  const [parts, setParts] = useState([])
  const [vendorId, setVendorId] = useState('')
  const [items, setItems] = useState([{ partId: '', quantity: '', unitCost: '' }])
  const [formError, setFormError] = useState('')
  const [formLoading, setFormLoading] = useState(false)
  const [expanded, setExpanded] = useState(null)

  useEffect(() => { fetchInvoices() }, [])

  async function fetchInvoices() {
    setLoading(true); setError('')
    try { const { data } = await purchaseInvoicesApi.getAll(); setInvoices(data) }
    catch { setError('Failed to load invoices.') }
    finally { setLoading(false) }
  }

  async function openModal() {
    setFormError(''); setVendorId(''); setItems([{ partId: '', quantity: '', unitCost: '' }])
    const [vRes, pRes] = await Promise.all([vendorsApi.getAll(), partsApi.getAll(1, 100)])
    setVendors(vRes.data); setParts(pRes.data); setShowModal(true)
  }

  function updateItem(i, field, val) { setItems((prev) => prev.map((item, idx) => idx === i ? { ...item, [field]: val } : item)) }
  function addItem() { setItems((prev) => [...prev, { partId: '', quantity: '', unitCost: '' }]) }
  function removeItem(i) { setItems((prev) => prev.filter((_, idx) => idx !== i)) }
  function calcTotal() { return items.reduce((sum, item) => sum + (parseFloat(item.quantity) || 0) * (parseFloat(item.unitCost) || 0), 0) }

  async function handleCreate(e) {
    e.preventDefault(); setFormError('')
    if (!vendorId) { setFormError('Please select a vendor.'); return }
    if (items.some((i) => !i.partId || !i.quantity || !i.unitCost)) { setFormError('Fill in all item fields.'); return }
    setFormLoading(true)
    try {
      await purchaseInvoicesApi.create({ vendorId: parseInt(vendorId, 10), adminId: parseInt(user.id, 10), items: items.map((i) => ({ partId: parseInt(i.partId, 10), quantity: parseInt(i.quantity, 10), unitCost: parseFloat(i.unitCost) })) })
      setShowModal(false); fetchInvoices()
    } catch (err) { setFormError(err.response?.data?.message || 'Failed to create invoice.') }
    finally { setFormLoading(false) }
  }

  return (
    <div className="space-y-6 animate-fade-in-up">
      <PageHeader title="Purchase Invoices" description="Record stock purchases from vendors.">
        <Button icon={Plus} onClick={openModal}>New Invoice</Button>
      </PageHeader>

      {error && <Alert tone="error">{error}</Alert>}

      <Card className="overflow-hidden">
        {loading ? (
          <TableSkeleton rows={6} cols={5} />
        ) : invoices.length === 0 ? (
          <EmptyState
            icon={ShoppingBag}
            title="No purchase invoices yet"
            description="Record your first stock purchase to see it here."
            action={<Button icon={Plus} onClick={openModal}>New Invoice</Button>}
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[640px]">
              <thead>
                <tr className="border-b border-gray-100 dark:border-zinc-800 bg-gray-50/70 dark:bg-zinc-800/50">
                  {['Invoice #', 'Vendor', 'Date', 'Total', 'Items', ''].map((h, i) => (
                    <th key={i} className="px-5 py-3.5 text-left text-[11px] font-bold text-gray-400 dark:text-zinc-500 uppercase tracking-[0.1em]">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-zinc-800">
                {invoices.map((inv) => (
                  <Fragment key={inv.id}>
                    <tr className="hover:bg-gray-50/60 dark:hover:bg-zinc-800/30 transition-colors">
                      <td className="px-5 py-4 font-semibold text-gray-900 dark:text-white">#{inv.id}</td>
                      <td className="px-5 py-4 text-gray-600 dark:text-zinc-300">{inv.vendorName}</td>
                      <td className="px-5 py-4 text-gray-500 dark:text-zinc-400">{formatDate(inv.purchaseDate)}</td>
                      <td className="px-5 py-4 font-bold text-gray-900 dark:text-white tabular-nums">{formatCurrency(inv.totalAmount)}</td>
                      <td className="px-5 py-4 text-gray-500 dark:text-zinc-400">{inv.items.length} item(s)</td>
                      <td className="px-5 py-4">
                        <div className="flex justify-end">
                          <Button
                            size="sm" variant="secondary"
                            icon={expanded === inv.id ? ChevronUp : ChevronDown}
                            onClick={() => setExpanded(expanded === inv.id ? null : inv.id)}
                          >
                            {expanded === inv.id ? 'Hide' : 'Details'}
                          </Button>
                        </div>
                      </td>
                    </tr>
                    {expanded === inv.id && (
                      <tr>
                        <td colSpan={6} className="px-5 py-4 bg-gray-50/70 dark:bg-zinc-800/30 border-b border-gray-100 dark:border-zinc-800">
                          <p className="text-[11px] font-bold text-gray-400 dark:text-zinc-500 uppercase tracking-[0.1em] mb-3">Line Items</p>
                          <table className="w-full text-xs">
                            <thead>
                              <tr className="text-gray-400 dark:text-zinc-500">
                                <th className="text-left pb-2 font-semibold">Part</th>
                                <th className="text-left pb-2 font-semibold">Qty</th>
                                <th className="text-left pb-2 font-semibold">Unit Cost</th>
                                <th className="text-left pb-2 font-semibold">Line Total</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 dark:divide-zinc-800">
                              {inv.items.map((item) => (
                                <tr key={item.id}>
                                  <td className="py-1.5 text-gray-700 dark:text-zinc-300">{item.partName}</td>
                                  <td className="py-1.5 text-gray-600 dark:text-zinc-400 tabular-nums">{item.quantity}</td>
                                  <td className="py-1.5 text-gray-600 dark:text-zinc-400 tabular-nums">{formatCurrency(item.unitCost)}</td>
                                  <td className="py-1.5 font-semibold text-gray-900 dark:text-white tabular-nums">{formatCurrency(item.lineTotal)}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </td>
                      </tr>
                    )}
                  </Fragment>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      <Modal open={showModal} onClose={() => setShowModal(false)} size="xl" title="New Purchase Invoice">
        {formError && <Alert tone="error" className="mb-4">{formError}</Alert>}
        <form onSubmit={handleCreate} className="space-y-5">
          <Field label="Vendor" required>
            <Select value={vendorId} onChange={(e) => setVendorId(e.target.value)} required>
              <option value="">Select a vendor</option>
              {vendors.map((v) => <option key={v.id} value={v.id}>{v.name}</option>)}
            </Select>
          </Field>
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-bold text-gray-500 dark:text-zinc-500 uppercase tracking-[0.12em]">Items</span>
              <button type="button" onClick={addItem} className="text-xs font-bold text-gray-600 dark:text-zinc-400 hover:text-gray-900 dark:hover:text-white transition-colors">+ Add item</button>
            </div>
            <div className="space-y-2">
              {items.map((item, index) => (
                <div key={index} className="grid grid-cols-[1fr_80px_120px_36px] gap-2 items-center">
                  <Select value={item.partId} onChange={(e) => updateItem(index, 'partId', e.target.value)} required>
                    <option value="">Select part</option>
                    {parts.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
                  </Select>
                  <Input type="number" placeholder="Qty" value={item.quantity} onChange={(e) => updateItem(index, 'quantity', e.target.value)} required min={1} />
                  <Input type="number" placeholder="Unit cost" value={item.unitCost} onChange={(e) => updateItem(index, 'unitCost', e.target.value)} required min={0} step="0.01" />
                  <button type="button" onClick={() => removeItem(index)} disabled={items.length === 1} className="text-gray-400 hover:text-red-600 disabled:opacity-30 text-lg leading-none transition-colors">×</button>
                </div>
              ))}
            </div>
            <div className="mt-3 text-right text-sm font-bold text-gray-900 dark:text-white tabular-nums">Total: {formatCurrency(calcTotal())}</div>
          </div>
          <div className="flex gap-3 pt-1">
            <button type="button" onClick={() => setShowModal(false)} className="flex-1 py-2.5 border border-gray-200 dark:border-zinc-700 text-gray-700 dark:text-zinc-300 text-sm font-semibold rounded-xl hover:bg-gray-50 dark:hover:bg-zinc-800 transition-colors">
              Cancel
            </button>
            <Button type="submit" loading={formLoading} className="flex-1">
              {formLoading ? 'Creating…' : 'Create Invoice'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
