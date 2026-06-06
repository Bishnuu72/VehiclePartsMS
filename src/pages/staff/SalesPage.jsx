import { useState, useEffect, Fragment } from 'react'
import { salesInvoicesApi } from '../../api/salesInvoicesApi'
import { customersApi } from '../../api/customersApi'
import { partsApi } from '../../api/partsApi'
import { useAuth } from '../../hooks/useAuth'
import { formatCurrency, formatDate } from '../../utils/formatters'
import { Plus, ChevronDown, ChevronUp, Mail, Receipt, CheckCircle2 } from 'lucide-react'
import { PageHeader } from '../../components/ui/PageHeader'
import { Button } from '../../components/ui/Button'
import { Card } from '../../components/ui/Card'
import { Badge } from '../../components/ui/Badge'
import { Alert } from '../../components/ui/Alert'
import { EmptyState } from '../../components/ui/EmptyState'
import { TableSkeleton } from '../../components/ui/Skeleton'
import { Modal, ConfirmDialog } from '../../components/ui/Modal'
import { Field, Select, Input } from '../../components/ui/Field'
import { cn } from '../../lib/cn'

export default function SalesPage() {
  const { user } = useAuth()
  const [invoices, setInvoices] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [expanded, setExpanded] = useState(null)
  const [showModal, setShowModal] = useState(false)
  const [customers, setCustomers] = useState([])
  const [parts, setParts] = useState([])
  const [customerId, setCustomerId] = useState('')
  const [paymentStatus, setPaymentStatus] = useState('Paid')
  const [items, setItems] = useState([{ partId: '', quantity: '' }])
  const [formError, setFormError] = useState('')
  const [formLoading, setFormLoading] = useState(false)
  const [sendingId, setSendingId] = useState(null)
  const [markPaidId, setMarkPaidId] = useState(null)
  const [marking, setMarking] = useState(false)

  useEffect(() => { fetchInvoices() }, [])

  async function handleMarkPaid(id) {
    setMarking(true)
    try {
      await salesInvoicesApi.updatePaymentStatus(id, 0) // 0 = Paid
      setMarkPaidId(null)
      fetchInvoices()
    } catch {
      setError('Failed to update payment status.')
      setMarkPaidId(null)
    } finally {
      setMarking(false)
    }
  }

  async function fetchInvoices() {
    setLoading(true); setError('')
    try { const { data } = await salesInvoicesApi.getAll(); setInvoices(data) }
    catch { setError('Failed to load invoices.') }
    finally { setLoading(false) }
  }

  async function openModal() {
    setFormError(''); setCustomerId(''); setPaymentStatus('Paid'); setItems([{ partId: '', quantity: '' }])
    const [cRes, pRes] = await Promise.all([customersApi.getAll(), partsApi.getAll(1, 100)])
    setCustomers(cRes.data); setParts(pRes.data); setShowModal(true)
  }

  function addItem() { setItems((p) => [...p, { partId: '', quantity: '' }]) }
  function removeItem(i) { setItems((p) => p.filter((_, idx) => idx !== i)) }
  function updateItem(i, field, val) { setItems((p) => p.map((item, idx) => idx === i ? { ...item, [field]: val } : item)) }
  function getPartPrice(partId) { return parts.find((p) => String(p.id) === String(partId))?.price ?? 0 }
  function calcSubTotal() { return items.reduce((sum, item) => sum + (parseInt(item.quantity) || 0) * getPartPrice(item.partId), 0) }

  const subTotal = calcSubTotal()
  const qualifies = subTotal > 5000
  const discount = qualifies ? subTotal * 0.1 : 0
  const total = subTotal - discount

  async function handleCreate(e) {
    e.preventDefault(); setFormError('')
    if (!customerId) { setFormError('Please select a customer.'); return }
    if (items.some((i) => !i.partId || !i.quantity)) { setFormError('Fill in all item fields.'); return }
    setFormLoading(true)
    try {
      await salesInvoicesApi.create({ customerProfileId: parseInt(customerId, 10), staffId: parseInt(user.id, 10), paymentStatus: paymentStatus === 'Paid' ? 0 : 1, items: items.map((i) => ({ partId: parseInt(i.partId, 10), quantity: parseInt(i.quantity, 10) })) })
      setShowModal(false); fetchInvoices()
    } catch (err) { setFormError(err.response?.data?.message || 'Failed to create invoice.') }
    finally { setFormLoading(false) }
  }

  async function handleSendEmail(id) {
    setSendingId(id)
    try { await salesInvoicesApi.sendEmail(id) }
    catch { setError('Failed to send email.') }
    finally { setSendingId(null) }
  }

  return (
    <div className="space-y-6 animate-fade-in-up">
      <PageHeader title="Sales" description="Create sales invoices and manage part sales.">
        <Button variant="primary" icon={Plus} onClick={openModal}>New Sale</Button>
      </PageHeader>

      {error && <Alert tone="error">{error}</Alert>}

      <Card className="overflow-hidden">
        {loading ? (
          <TableSkeleton rows={6} cols={6} />
        ) : invoices.length === 0 ? (
          <EmptyState
            icon={Receipt}
            title="No sales invoices yet"
            description="Create your first sale to see it here."
            action={<Button icon={Plus} onClick={openModal}>New Sale</Button>}
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[760px]">
              <thead>
                <tr className="border-b border-gray-100 dark:border-zinc-800 bg-gray-50/70 dark:bg-zinc-800/50">
                  {['Invoice #', 'Customer', 'Date', 'Total', 'Discount', 'Status', ''].map((h, i) => (
                    <th key={i} className="px-5 py-3.5 text-left text-[11px] font-bold text-gray-400 dark:text-zinc-500 uppercase tracking-[0.1em]">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-zinc-800">
                {invoices.map((inv) => (
                  <Fragment key={inv.id}>
                    <tr className="hover:bg-gray-50/60 dark:hover:bg-zinc-800/30 transition-colors">
                      <td className="px-5 py-4 font-semibold text-gray-900 dark:text-white">#{inv.id}</td>
                      <td className="px-5 py-4 text-gray-600 dark:text-zinc-300">{inv.customerName}</td>
                      <td className="px-5 py-4 text-gray-500 dark:text-zinc-400">{formatDate(inv.saleDate)}</td>
                      <td className="px-5 py-4 font-bold text-gray-900 dark:text-white tabular-nums">{formatCurrency(inv.totalAmount)}</td>
                      <td className="px-5 py-4">
                        {inv.discountPercent > 0
                          ? <Badge tone="success">{inv.discountPercent}% off</Badge>
                          : <span className="text-gray-300 dark:text-zinc-600">—</span>}
                      </td>
                      <td className="px-5 py-4">
                        <Badge tone={inv.paymentStatus === 'Paid' ? 'success' : 'warning'}>{inv.paymentStatus}</Badge>
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex items-center justify-end gap-2">
                          {inv.paymentStatus === 'Credit' && (
                            <Button size="sm" variant="primary" icon={CheckCircle2} onClick={() => setMarkPaidId(inv.id)}>
                              Mark Paid
                            </Button>
                          )}
                          <Button size="sm" variant="secondary" icon={Mail} loading={sendingId === inv.id} onClick={() => handleSendEmail(inv.id)}>
                            {sendingId === inv.id ? 'Sending…' : 'Email'}
                          </Button>
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
                        <td colSpan={7} className="px-5 py-4 bg-gray-50/70 dark:bg-zinc-800/30 border-b border-gray-100 dark:border-zinc-800">
                          <p className="text-[11px] font-bold text-gray-400 dark:text-zinc-500 uppercase tracking-[0.1em] mb-3">Line Items</p>
                          <table className="w-full text-xs">
                            <thead>
                              <tr className="text-gray-400 dark:text-zinc-500">
                                <th className="text-left pb-2 font-semibold">Part</th>
                                <th className="text-left pb-2 font-semibold">Qty</th>
                                <th className="text-left pb-2 font-semibold">Unit Price</th>
                                <th className="text-left pb-2 font-semibold">Line Total</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 dark:divide-zinc-800">
                              {inv.items.map((item) => (
                                <tr key={item.id}>
                                  <td className="py-1.5 text-gray-700 dark:text-zinc-300">{item.partName}</td>
                                  <td className="py-1.5 text-gray-600 dark:text-zinc-400 tabular-nums">{item.quantity}</td>
                                  <td className="py-1.5 text-gray-600 dark:text-zinc-400 tabular-nums">{formatCurrency(item.unitPrice)}</td>
                                  <td className="py-1.5 font-semibold text-gray-900 dark:text-white tabular-nums">{formatCurrency(item.lineTotal)}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                          <div className="mt-2 text-xs text-right text-gray-500 dark:text-zinc-400">
                            Subtotal: {formatCurrency(inv.subTotal)}
                            {inv.discountPercent > 0 && <span className="ml-3 text-emerald-700 dark:text-emerald-400">− {inv.discountPercent}% loyalty discount</span>}
                          </div>
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

      <Modal open={showModal} onClose={() => setShowModal(false)} size="xl" title="New Sales Invoice">
        {formError && <Alert tone="error" className="mb-4">{formError}</Alert>}
        <form onSubmit={handleCreate} className="space-y-4">
          <Field label="Customer" required>
            <Select value={customerId} onChange={(e) => setCustomerId(e.target.value)} required>
              <option value="">Select a customer</option>
              {customers.map((c) => <option key={c.id} value={c.id}>{c.fullName} — {c.email}</option>)}
            </Select>
          </Field>

          <div>
            <label className="block text-[11px] font-bold text-gray-500 dark:text-zinc-500 mb-1.5 uppercase tracking-[0.12em]">Payment Status</label>
            <div className="flex gap-2">
              {['Paid', 'Credit'].map((s) => (
                <button
                  key={s} type="button" onClick={() => setPaymentStatus(s)}
                  className={cn(
                    'flex-1 py-2.5 rounded-xl text-sm font-bold border-2 transition-all',
                    paymentStatus === s
                      ? s === 'Paid'
                        ? 'bg-emerald-600 border-emerald-600 text-white'
                        : 'bg-amber-500 border-amber-500 text-white'
                      : 'border-gray-200 dark:border-zinc-700 text-gray-600 dark:text-zinc-400 hover:border-gray-300 dark:hover:border-zinc-600',
                  )}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-bold text-gray-500 dark:text-zinc-500 uppercase tracking-[0.12em]">Parts</span>
              <button type="button" onClick={addItem} className="text-xs font-bold text-emerald-600 hover:text-emerald-700 dark:text-emerald-400 transition-colors">+ Add part</button>
            </div>
            <div className="space-y-2">
              {items.map((item, i) => (
                <div key={i} className="grid grid-cols-[1fr_84px_36px] gap-2">
                  <Select value={item.partId} onChange={(e) => updateItem(i, 'partId', e.target.value)} required>
                    <option value="">Select part</option>
                    {parts.map((p) => <option key={p.id} value={p.id}>{p.name} — {formatCurrency(p.price)} ({p.stockQuantity} in stock)</option>)}
                  </Select>
                  <Input type="number" placeholder="Qty" value={item.quantity} onChange={(e) => updateItem(i, 'quantity', e.target.value)} required min={1} />
                  <button type="button" onClick={() => removeItem(i)} disabled={items.length === 1} className="text-gray-400 hover:text-red-600 disabled:opacity-30 text-lg leading-none transition-colors">×</button>
                </div>
              ))}
            </div>
            <div className="mt-4 p-4 bg-gray-50 dark:bg-zinc-800/50 rounded-xl text-sm space-y-1.5">
              <div className="flex justify-between text-gray-600 dark:text-zinc-400"><span>Subtotal</span><span className="tabular-nums">{formatCurrency(subTotal)}</span></div>
              {qualifies && <div className="flex justify-between text-emerald-700 dark:text-emerald-400 font-medium"><span>Loyalty discount (10%)</span><span className="tabular-nums">− {formatCurrency(discount)}</span></div>}
              <div className="flex justify-between font-bold text-gray-900 dark:text-white border-t border-gray-200 dark:border-zinc-700 pt-2"><span>Total</span><span className="tabular-nums">{formatCurrency(total)}</span></div>
              {qualifies && <p className="text-xs text-emerald-600 dark:text-emerald-400">10% loyalty discount applied — purchase over NPR 5,000</p>}
            </div>
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

      <ConfirmDialog
        open={!!markPaidId}
        onClose={() => setMarkPaidId(null)}
        onConfirm={() => handleMarkPaid(markPaidId)}
        loading={marking}
        title="Mark invoice as paid?"
        description="This clears the outstanding credit for this invoice and updates the customer's credit balance everywhere."
        confirmLabel="Mark Paid"
        tone="primary"
      />
    </div>
  )
}
