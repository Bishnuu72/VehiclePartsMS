import { useState, useEffect, useRef } from 'react'
import { customersApi } from '../../api/customersApi'
import { formatCurrency, formatDate } from '../../utils/formatters'
import { UserPlus, Search, X } from 'lucide-react'
import { PageHeader } from '../../components/ui/PageHeader'
import { Button } from '../../components/ui/Button'
import { Card } from '../../components/ui/Card'
import { Badge } from '../../components/ui/Badge'
import { Alert } from '../../components/ui/Alert'
import { EmptyState } from '../../components/ui/EmptyState'
import { TableSkeleton } from '../../components/ui/Skeleton'
import { Modal } from '../../components/ui/Modal'
import { Field, Input, Select } from '../../components/ui/Field'

const CUSTOMER_COLORS = ['bg-emerald-600', 'bg-blue-600', 'bg-violet-600', 'bg-amber-500', 'bg-rose-600', 'bg-indigo-600', 'bg-cyan-600']
const EMPTY_CUSTOMER = { firstName: '', lastName: '', email: '', password: '', phone: '', address: '' }
const EMPTY_VEHICLE = { vehicleNumber: '', make: '', model: '', year: '' }
const SEARCH_FIELDS = [{ key: 'name', label: 'Name' }, { key: 'phone', label: 'Phone' }, { key: 'vehicleNumber', label: 'Vehicle No.' }, { key: 'id', label: 'ID' }]

function statusTone(status) {
  if (status === 'Completed' || status === 'Paid') return 'success'
  if (status === 'Confirmed') return 'info'
  if (status === 'Cancelled') return 'danger'
  return 'neutral'
}

export default function CustomersPage() {
  const [customers, setCustomers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [searchField, setSearchField] = useState('name')
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState(null)
  const [searching, setSearching] = useState(false)
  const debounceRef = useRef(null)
  const [showModal, setShowModal] = useState(false)
  const [form, setForm] = useState(EMPTY_CUSTOMER)
  const [vehicles, setVehicles] = useState([])
  const [formError, setFormError] = useState('')
  const [formLoading, setFormLoading] = useState(false)
  const [detail, setDetail] = useState(null)
  const [detailLoading, setDetailLoading] = useState(false)

  useEffect(() => { fetchCustomers() }, [])

  async function fetchCustomers() {
    setLoading(true); setError('')
    try { const { data } = await customersApi.getAll(); setCustomers(data) }
    catch { setError('Failed to load customers.') }
    finally { setLoading(false) }
  }

  function handleSearchInput(val) {
    setSearchQuery(val)
    if (!val.trim()) { setSearchResults(null); return }
    clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => runSearch(val), 400)
  }

  async function runSearch(query) {
    setSearching(true)
    try {
      const params = { [searchField]: searchField === 'id' ? parseInt(query, 10) : query }
      const { data } = await customersApi.search(params)
      setSearchResults(data)
    } catch { setSearchResults([]) }
    finally { setSearching(false) }
  }

  async function openDetail(id) {
    setDetail(null); setDetailLoading(true)
    try { const { data } = await customersApi.getDetails(id); setDetail(data) }
    catch { setError('Failed to load customer details.') }
    finally { setDetailLoading(false) }
  }

  function handleChange(e) { setForm((p) => ({ ...p, [e.target.name]: e.target.value })) }
  function addVehicle() { setVehicles((p) => [...p, { ...EMPTY_VEHICLE }]) }
  function removeVehicle(i) { setVehicles((p) => p.filter((_, idx) => idx !== i)) }
  function updateVehicle(i, field, val) { setVehicles((p) => p.map((v, idx) => idx === i ? { ...v, [field]: val } : v)) }

  async function handleSubmit(e) {
    e.preventDefault(); setFormError(''); setFormLoading(true)
    try {
      await customersApi.register({ firstName: form.firstName, lastName: form.lastName, email: form.email, password: form.password, phone: form.phone || null, address: form.address || null, vehicles: vehicles.map((v) => ({ vehicleNumber: v.vehicleNumber, make: v.make || null, model: v.model || null, year: v.year ? parseInt(v.year, 10) : null })) })
      setShowModal(false); fetchCustomers()
    } catch (err) { setFormError(err.response?.data?.message || 'Failed to register customer.') }
    finally { setFormLoading(false) }
  }

  const displayed = searchResults ?? customers

  return (
    <div className="flex gap-6 min-w-0 animate-fade-in-up">
      <div className="flex-1 min-w-0 space-y-5">
        <PageHeader title="Customers" description="Register and manage customer accounts.">
          <Button
            variant="primary" icon={UserPlus}
            onClick={() => { setForm(EMPTY_CUSTOMER); setVehicles([]); setFormError(''); setShowModal(true) }}
          >
            Register
          </Button>
        </PageHeader>

        {error && <Alert tone="error">{error}</Alert>}

        {/* Search */}
        <div className="flex flex-col sm:flex-row gap-2">
          <Select
            value={searchField}
            onChange={(e) => { setSearchField(e.target.value); setSearchQuery(''); setSearchResults(null) }}
            className="sm:w-40 bg-white dark:bg-zinc-900"
          >
            {SEARCH_FIELDS.map((f) => <option key={f.key} value={f.key}>{f.label}</option>)}
          </Select>
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-zinc-500 pointer-events-none" />
            <Input
              type={searchField === 'id' ? 'number' : 'text'}
              placeholder={`Search by ${SEARCH_FIELDS.find((f) => f.key === searchField)?.label}…`}
              value={searchQuery} onChange={(e) => handleSearchInput(e.target.value)}
              className="pl-10 pr-10 bg-white dark:bg-zinc-900"
            />
            {searchQuery && (
              <button
                onClick={() => { setSearchQuery(''); setSearchResults(null) }}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-zinc-300"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
          {searching && <span className="self-center text-xs text-gray-400 dark:text-zinc-500 font-medium px-1">Searching…</span>}
          {searchResults && !searching && <span className="self-center text-xs text-gray-500 dark:text-zinc-400 font-medium px-1">{searchResults.length} result(s)</span>}
        </div>

        <Card className="overflow-hidden">
          {loading && !searchResults ? (
            <TableSkeleton rows={6} cols={5} />
          ) : displayed.length === 0 ? (
            <EmptyState
              icon={Search}
              title={searchResults ? 'No customers match your search' : 'No customers yet'}
              description={searchResults ? 'Try a different field or query.' : 'Register your first customer to get started.'}
            />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm min-w-[640px]">
                <thead>
                  <tr className="border-b border-gray-100 dark:border-zinc-800 bg-gray-50/70 dark:bg-zinc-800/50">
                    {['Name', 'Phone', 'Vehicles', 'Total Spent', 'Credit', ''].map((h, i) => (
                      <th key={i} className="px-5 py-3.5 text-left text-[11px] font-bold text-gray-400 dark:text-zinc-500 uppercase tracking-[0.1em]">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-zinc-800">
                  {displayed.map((c, idx) => (
                    <tr
                      key={c.id} onClick={() => openDetail(c.id)}
                      className={`cursor-pointer transition-colors ${detail?.id === c.id ? 'bg-emerald-50/50 dark:bg-emerald-900/10' : 'hover:bg-gray-50/60 dark:hover:bg-zinc-800/30'}`}
                    >
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className={`w-9 h-9 ${CUSTOMER_COLORS[idx % CUSTOMER_COLORS.length]} rounded-full flex items-center justify-center flex-shrink-0`}>
                            <span className="text-[11px] font-bold text-white">{c.fullName?.charAt(0)?.toUpperCase() ?? '?'}</span>
                          </div>
                          <div>
                            <p className="font-semibold text-gray-900 dark:text-white">{c.fullName}</p>
                            <p className="text-xs text-gray-400 dark:text-zinc-500 mt-0.5">{c.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-4 text-gray-500 dark:text-zinc-400">{c.phone ?? '—'}</td>
                      <td className="px-5 py-4">
                        {c.vehicles.length === 0 ? <span className="text-gray-300 dark:text-zinc-600">—</span> : (
                          <div className="flex flex-wrap gap-1">
                            {c.vehicles.map((v) => <Badge key={v.id} tone="neutral">{v.vehicleNumber}</Badge>)}
                          </div>
                        )}
                      </td>
                      <td className="px-5 py-4 font-semibold text-gray-900 dark:text-white tabular-nums">{formatCurrency(c.totalSpent)}</td>
                      <td className="px-5 py-4 tabular-nums">
                        <span className={c.creditBalance > 0 ? 'font-bold text-red-600 dark:text-red-400' : 'text-gray-300 dark:text-zinc-600'}>{formatCurrency(c.creditBalance)}</span>
                      </td>
                      <td className="px-5 py-4 text-right text-xs font-semibold text-emerald-600 dark:text-emerald-400">View →</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      </div>

      {/* Detail panel */}
      {(detail || detailLoading) && (
        <div className="hidden xl:block w-[360px] shrink-0">
          <Card className="overflow-hidden sticky top-2">
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 dark:border-zinc-800">
              <h3 className="font-semibold text-gray-900 dark:text-white text-sm">Customer Detail</h3>
              <button onClick={() => setDetail(null)} className="p-1 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-zinc-300 hover:bg-gray-100 dark:hover:bg-zinc-800 transition-colors">
                <X className="w-4 h-4" />
              </button>
            </div>
            {detailLoading ? (
              <div className="text-center py-12 text-sm text-gray-400 dark:text-zinc-500">Loading…</div>
            ) : detail && (
              <div className="overflow-y-auto max-h-[calc(100vh-200px)]">
                <div className="px-5 py-4 border-b border-gray-100 dark:border-zinc-800">
                  <div className="w-12 h-12 bg-emerald-600 rounded-2xl flex items-center justify-center mb-3">
                    <span className="text-base font-bold text-white">{detail.fullName.slice(0, 1).toUpperCase()}</span>
                  </div>
                  <p className="font-semibold text-gray-900 dark:text-white">{detail.fullName}</p>
                  <p className="text-xs text-gray-500 dark:text-zinc-400 mt-0.5">{detail.email}</p>
                  {detail.phone && <p className="text-xs text-gray-500 dark:text-zinc-400">{detail.phone}</p>}
                  <div className="flex gap-4 mt-3">
                    <div><p className="text-[10px] text-gray-400 dark:text-zinc-500 font-medium uppercase tracking-wide">Total Spent</p><p className="text-sm font-bold text-gray-900 dark:text-white tabular-nums">{formatCurrency(detail.totalSpent)}</p></div>
                    <div><p className="text-[10px] text-gray-400 dark:text-zinc-500 font-medium uppercase tracking-wide">Credit</p><p className={`text-sm font-bold tabular-nums ${detail.creditBalance > 0 ? 'text-red-600 dark:text-red-400' : 'text-gray-900 dark:text-white'}`}>{formatCurrency(detail.creditBalance)}</p></div>
                  </div>
                </div>

                <div className="px-5 py-4 border-b border-gray-100 dark:border-zinc-800">
                  <p className="text-[10px] font-bold text-gray-400 dark:text-zinc-500 uppercase tracking-[0.15em] mb-3">Vehicles ({detail.vehicles.length})</p>
                  {detail.vehicles.length === 0 ? <p className="text-xs text-gray-400 dark:text-zinc-500">None registered.</p> : (
                    <div className="space-y-2">
                      {detail.vehicles.map((v) => (
                        <div key={v.id} className="bg-gray-50 dark:bg-zinc-800 rounded-xl px-3 py-2.5 text-xs">
                          <p className="font-bold text-gray-900 dark:text-white">{v.vehicleNumber}</p>
                          <p className="text-gray-500 dark:text-zinc-400 mt-0.5">{[v.make, v.model, v.year].filter(Boolean).join(' · ') || 'No details'}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="px-5 py-4 border-b border-gray-100 dark:border-zinc-800">
                  <p className="text-[10px] font-bold text-gray-400 dark:text-zinc-500 uppercase tracking-[0.15em] mb-3">Purchase History ({detail.purchaseHistory.length})</p>
                  {detail.purchaseHistory.length === 0 ? <p className="text-xs text-gray-400 dark:text-zinc-500">No purchases yet.</p> : (
                    <div className="space-y-2">
                      {detail.purchaseHistory.map((inv) => (
                        <div key={inv.id} className="flex justify-between items-start text-xs">
                          <div><p className="font-semibold text-gray-900 dark:text-white">Invoice #{inv.id}</p><p className="text-gray-400 dark:text-zinc-500 mt-0.5">{formatDate(inv.saleDate)} · {inv.itemCount} item(s)</p></div>
                          <div className="text-right">
                            <p className="font-bold text-gray-900 dark:text-white tabular-nums">{formatCurrency(inv.totalAmount)}</p>
                            <Badge tone={statusTone(inv.paymentStatus)} className="mt-0.5">{inv.paymentStatus}</Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="px-5 py-4">
                  <p className="text-[10px] font-bold text-gray-400 dark:text-zinc-500 uppercase tracking-[0.15em] mb-3">Service History ({detail.serviceHistory.length})</p>
                  {detail.serviceHistory.length === 0 ? <p className="text-xs text-gray-400 dark:text-zinc-500">No appointments yet.</p> : (
                    <div className="space-y-2">
                      {detail.serviceHistory.map((appt) => (
                        <div key={appt.id} className="flex justify-between items-start text-xs">
                          <div><p className="font-semibold text-gray-900 dark:text-white">{formatDate(appt.appointmentDate)}</p><p className="text-gray-400 dark:text-zinc-500 mt-0.5">{appt.vehicleNumber ?? '—'}</p></div>
                          <Badge tone={statusTone(appt.status)}>{appt.status}</Badge>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </Card>
        </div>
      )}

      {/* Register modal */}
      <Modal open={showModal} onClose={() => setShowModal(false)} size="xl" title="Register New Customer">
        {formError && <Alert tone="error" className="mb-4">{formError}</Alert>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Field label="First Name" required>
              <Input type="text" name="firstName" value={form.firstName} onChange={handleChange} required />
            </Field>
            <Field label="Last Name" required>
              <Input type="text" name="lastName" value={form.lastName} onChange={handleChange} required />
            </Field>
          </div>
          <Field label="Email" required>
            <Input type="email" name="email" value={form.email} onChange={handleChange} required />
          </Field>
          <Field label="Password" required>
            <Input type="password" name="password" value={form.password} onChange={handleChange} required minLength={6} />
          </Field>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Phone">
              <Input type="tel" name="phone" value={form.phone} onChange={handleChange} />
            </Field>
            <Field label="Address">
              <Input type="text" name="address" value={form.address} onChange={handleChange} />
            </Field>
          </div>
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-bold text-gray-500 dark:text-zinc-500 uppercase tracking-[0.12em]">Vehicles</span>
              <button type="button" onClick={addVehicle} className="text-xs font-bold text-emerald-600 hover:text-emerald-700 dark:text-emerald-400 transition-colors">
                + Add vehicle
              </button>
            </div>
            {vehicles.length === 0 && <p className="text-xs text-gray-400 dark:text-zinc-500">No vehicles added.</p>}
            <div className="space-y-3">
              {vehicles.map((v, i) => (
                <div key={i} className="border border-gray-200 dark:border-zinc-700 rounded-xl p-4 relative">
                  <button type="button" onClick={() => removeVehicle(i)} className="absolute top-3 right-3 text-gray-400 hover:text-red-500 dark:hover:text-red-400 transition-colors">
                    <X className="w-4 h-4" />
                  </button>
                  <div className="grid grid-cols-2 gap-3">
                    <Field label="Vehicle Number" required className="col-span-2">
                      <Input type="text" value={v.vehicleNumber} onChange={(e) => updateVehicle(i, 'vehicleNumber', e.target.value)} required placeholder="e.g. BA 1 CHA 1234" />
                    </Field>
                    <Field label="Make">
                      <Input type="text" value={v.make} onChange={(e) => updateVehicle(i, 'make', e.target.value)} placeholder="Toyota" />
                    </Field>
                    <Field label="Model">
                      <Input type="text" value={v.model} onChange={(e) => updateVehicle(i, 'model', e.target.value)} placeholder="Hilux" />
                    </Field>
                    <Field label="Year" className="col-span-2">
                      <Input type="number" value={v.year} onChange={(e) => updateVehicle(i, 'year', e.target.value)} placeholder="2019" min={1980} max={2100} />
                    </Field>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="flex gap-3 pt-1">
            <button type="button" onClick={() => setShowModal(false)} className="flex-1 py-2.5 border border-gray-200 dark:border-zinc-700 text-gray-700 dark:text-zinc-300 text-sm font-semibold rounded-xl hover:bg-gray-50 dark:hover:bg-zinc-800 transition-colors">
              Cancel
            </button>
            <Button type="submit" loading={formLoading} className="flex-1">
              {formLoading ? 'Registering…' : 'Register Customer'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
