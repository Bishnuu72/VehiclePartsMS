import { useState, useEffect } from 'react'
import { customersApi } from '../../api/customersApi'
import { useCustomerProfile } from '../../hooks/useCustomerProfile'
import { formatCurrency, formatDate } from '../../utils/formatters'
import { ChevronDown, ChevronUp, Clock } from 'lucide-react'
import { PageHeader } from '../../components/ui/PageHeader'
import { Card } from '../../components/ui/Card'
import { Badge } from '../../components/ui/Badge'
import { Alert } from '../../components/ui/Alert'
import { EmptyState } from '../../components/ui/EmptyState'
import { PageLoader } from '../../components/ui/Spinner'
import { cn } from '../../lib/cn'

const STATUS_TONE = {
  Pending: 'warning',
  Confirmed: 'info',
  Completed: 'success',
  Cancelled: 'danger',
  Paid: 'success',
  Credit: 'warning',
}

export default function HistoryPage() {
  const { profile, loading: profileLoading, error: profileError } = useCustomerProfile()

  const [detail, setDetail] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [tab, setTab] = useState('purchases')
  const [expanded, setExpanded] = useState(null)

  useEffect(() => {
    if (!profile) return
    async function load() {
      setLoading(true)
      try {
        const { data } = await customersApi.getDetails(profile.id)
        setDetail(data)
      } catch {
        setError('Failed to load history.')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [profile])

  if (profileLoading || loading) return <PageLoader label="Loading history…" />
  if (profileError) return <Alert tone="error">{profileError}</Alert>
  if (error) return <Alert tone="error">{error}</Alert>

  const purchases = detail?.purchaseHistory ?? []
  const services = detail?.serviceHistory ?? []

  return (
    <div className="max-w-2xl space-y-6 animate-fade-in-up">
      <PageHeader title="History" description="Your complete purchase and service history." />

      <div className="flex gap-1 bg-gray-100 dark:bg-zinc-800/70 p-1 rounded-xl w-fit">
        {[
          { key: 'purchases', label: `Purchases (${purchases.length})` },
          { key: 'services', label: `Services (${services.length})` },
        ].map((t) => (
          <button
            key={t.key}
            onClick={() => { setTab(t.key); setExpanded(null) }}
            className={cn(
              'px-4 py-2 rounded-lg text-sm font-semibold transition-all',
              tab === t.key
                ? 'bg-white dark:bg-zinc-900 text-gray-900 dark:text-white shadow-sm'
                : 'text-gray-500 dark:text-zinc-400 hover:text-gray-700 dark:hover:text-zinc-200',
            )}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'purchases' && (
        <div className="space-y-3">
          {purchases.length === 0 ? (
            <Card>
              <EmptyState icon={Clock} title="No purchases yet" description="Your purchase invoices will appear here." />
            </Card>
          ) : (
            purchases.map((inv) => (
              <Card key={inv.id} className="overflow-hidden">
                <div
                  className="flex items-center justify-between gap-4 p-4 cursor-pointer hover:bg-gray-50/60 dark:hover:bg-zinc-800/30 transition-colors"
                  onClick={() => setExpanded(expanded === inv.id ? null : inv.id)}
                >
                  <div>
                    <p className="font-semibold text-gray-900 dark:text-white text-sm">Invoice #{inv.id}</p>
                    <p className="text-xs text-gray-500 dark:text-zinc-400 mt-0.5">{formatDate(inv.saleDate)} · {inv.itemCount} item(s)</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <p className="font-bold text-gray-900 dark:text-white text-sm tabular-nums">{formatCurrency(inv.totalAmount)}</p>
                      {inv.discountPercent > 0 && (
                        <p className="text-xs text-emerald-600 dark:text-emerald-400">{inv.discountPercent}% loyalty discount</p>
                      )}
                    </div>
                    <Badge tone={STATUS_TONE[inv.paymentStatus] ?? 'neutral'}>{inv.paymentStatus}</Badge>
                    <span className="text-gray-400 dark:text-zinc-500">
                      {expanded === inv.id ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </span>
                  </div>
                </div>
                {expanded === inv.id && (
                  <div className="border-t border-gray-100 dark:border-zinc-800 px-4 py-3 bg-gray-50/70 dark:bg-zinc-800/30">
                    <p className="text-xs text-gray-500 dark:text-zinc-400">
                      Subtotal: <span className="font-semibold text-gray-900 dark:text-white tabular-nums">{formatCurrency(inv.subTotal)}</span>
                    </p>
                  </div>
                )}
              </Card>
            ))
          )}
        </div>
      )}

      {tab === 'services' && (
        <div className="space-y-3">
          {services.length === 0 ? (
            <Card>
              <EmptyState icon={Clock} title="No service appointments yet" description="Your service history will appear here." />
            </Card>
          ) : (
            services.map((appt) => (
              <Card key={appt.id} className="p-4 flex items-start justify-between gap-4">
                <div>
                  <p className="font-semibold text-gray-900 dark:text-white text-sm">{formatDate(appt.appointmentDate)}</p>
                  <p className="text-xs text-gray-500 dark:text-zinc-400 mt-0.5">{appt.vehicleNumber ?? 'No vehicle specified'}</p>
                  {appt.notes && <p className="text-xs text-gray-400 dark:text-zinc-500 mt-1 italic">"{appt.notes}"</p>}
                </div>
                <Badge tone={STATUS_TONE[appt.status] ?? 'neutral'} className="flex-shrink-0">{appt.status}</Badge>
              </Card>
            ))
          )}
        </div>
      )}
    </div>
  )
}
