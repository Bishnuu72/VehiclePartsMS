import { useState } from 'react'
import { customersApi } from '../../api/customersApi'
import { formatCurrency } from '../../utils/formatters'
import { BarChart2 } from 'lucide-react'
import { PageHeader } from '../../components/ui/PageHeader'
import { Button } from '../../components/ui/Button'
import { Card } from '../../components/ui/Card'
import { Badge } from '../../components/ui/Badge'
import { Alert } from '../../components/ui/Alert'
import { EmptyState } from '../../components/ui/EmptyState'
import { Select } from '../../components/ui/Field'
import { cn } from '../../lib/cn'

const REPORT_COLORS = ['bg-violet-600', 'bg-blue-600', 'bg-emerald-600', 'bg-amber-500', 'bg-rose-600', 'bg-indigo-600']
const RANK_BADGES = ['bg-amber-400 text-amber-900', 'bg-gray-300 text-gray-700', 'bg-amber-700 text-amber-100']
const TABS = [
  { key: 'top-spenders', label: 'Top Spenders' },
  { key: 'regulars', label: 'Regular Customers' },
  { key: 'pending-credits', label: 'Pending Credits' },
]

export default function CustomerReportsPage() {
  const [tab, setTab] = useState('top-spenders')
  const [top, setTop] = useState(10)
  const [results, setResults] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function fetchReport() {
    setError(''); setLoading(true)
    try {
      let res
      if (tab === 'top-spenders') res = await customersApi.getTopSpenders(top)
      else if (tab === 'regulars') res = await customersApi.getRegulars(top)
      else res = await customersApi.getPendingCredits()
      setResults(res.data)
    } catch { setError('Failed to load report.'); setResults(null) }
    finally { setLoading(false) }
  }

  function handleTabChange(key) { setTab(key); setResults(null); setError('') }

  return (
    <div className="space-y-6 animate-fade-in-up">
      <PageHeader title="Customer Reports" description="Identify top spenders, regulars, and overdue credit balances." />

      <div className="flex gap-1 bg-gray-100 dark:bg-zinc-800/70 p-1 rounded-xl w-fit">
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => handleTabChange(t.key)}
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

      <div className="flex items-end gap-3">
        {tab !== 'pending-credits' && (
          <div>
            <label className="block text-[11px] font-bold text-gray-500 dark:text-zinc-500 mb-1.5 uppercase tracking-[0.12em]">Show top</label>
            <Select value={top} onChange={(e) => setTop(Number(e.target.value))} className="w-28 bg-white dark:bg-zinc-900">
              {[5, 10, 20, 50].map((n) => <option key={n} value={n}>{n}</option>)}
            </Select>
          </div>
        )}
        <Button onClick={fetchReport} loading={loading}>
          {loading ? 'Loading…' : 'Generate Report'}
        </Button>
      </div>

      {error && <Alert tone="error">{error}</Alert>}

      {results && (
        <Card className="overflow-hidden">
          {results.length === 0 ? (
            <EmptyState icon={BarChart2} title="No results found" description="This report returned no matching customers." />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm min-w-[680px]">
                <thead>
                  <tr className="border-b border-gray-100 dark:border-zinc-800 bg-gray-50/70 dark:bg-zinc-800/50">
                    {['#', 'Name', 'Email', 'Phone', 'Purchases', 'Total Spent', ...(tab === 'pending-credits' ? ['Credit Due'] : [])].map((h, i) => (
                      <th key={i} className="px-5 py-3.5 text-left text-[11px] font-bold text-gray-400 dark:text-zinc-500 uppercase tracking-[0.1em]">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-zinc-800">
                  {results.map((c, i) => (
                    <tr key={c.id} className="hover:bg-gray-50/60 dark:hover:bg-zinc-800/30 transition-colors">
                      <td className="px-5 py-4">
                        <span className={cn('inline-flex items-center justify-center w-7 h-7 rounded-full text-xs font-bold', i < 3 ? RANK_BADGES[i] : 'bg-gray-100 dark:bg-zinc-800 text-gray-500 dark:text-zinc-400')}>
                          {i + 1}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className={`w-9 h-9 ${REPORT_COLORS[i % REPORT_COLORS.length]} rounded-full flex items-center justify-center flex-shrink-0`}>
                            <span className="text-[11px] font-bold text-white">{c.fullName?.charAt(0)?.toUpperCase() ?? '?'}</span>
                          </div>
                          <span className="font-semibold text-gray-900 dark:text-white">{c.fullName}</span>
                        </div>
                      </td>
                      <td className="px-5 py-4 text-gray-500 dark:text-zinc-400">{c.email}</td>
                      <td className="px-5 py-4 text-gray-500 dark:text-zinc-400">{c.phone ?? '—'}</td>
                      <td className="px-5 py-4">
                        <Badge tone="info">{c.purchaseCount} order{c.purchaseCount !== 1 ? 's' : ''}</Badge>
                      </td>
                      <td className="px-5 py-4 font-bold text-gray-900 dark:text-white tabular-nums">{formatCurrency(c.totalSpent)}</td>
                      {tab === 'pending-credits' && (
                        <td className="px-5 py-4 font-bold text-red-600 dark:text-red-400 tabular-nums">{formatCurrency(c.creditBalance)}</td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      )}

      {!results && !loading && !error && (
        <Card>
          <EmptyState icon={BarChart2} title="No report generated yet" description="Select a report type and click Generate Report." />
        </Card>
      )}
    </div>
  )
}
