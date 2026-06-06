import { useState } from 'react'
import { reportsApi } from '../../api/reportsApi'
import { formatCurrency, formatDate } from '../../utils/formatters'
import { TrendingUp, BarChart3, Receipt, Tag } from 'lucide-react'
import { PageHeader } from '../../components/ui/PageHeader'
import { Button } from '../../components/ui/Button'
import { Card } from '../../components/ui/Card'
import { StatCard } from '../../components/ui/StatCard'
import { Alert } from '../../components/ui/Alert'
import { EmptyState } from '../../components/ui/EmptyState'
import { Field, Input, Select } from '../../components/ui/Field'
import { cn } from '../../lib/cn'

const TABS = ['Daily', 'Monthly', 'Yearly']
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']

export default function ReportsPage() {
  const today = new Date()
  const [tab, setTab] = useState('Daily')
  const [date, setDate] = useState(today.toISOString().slice(0, 10))
  const [year, setYear] = useState(today.getFullYear())
  const [month, setMonth] = useState(today.getMonth() + 1)
  const [report, setReport] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function fetchReport() {
    setError(''); setLoading(true)
    try {
      let res
      if (tab === 'Daily') res = await reportsApi.getDaily(date)
      else if (tab === 'Monthly') res = await reportsApi.getMonthly(year, month)
      else res = await reportsApi.getYearly(year)
      setReport(res.data)
    } catch { setError('Failed to load report. Please try again.'); setReport(null) }
    finally { setLoading(false) }
  }

  return (
    <div className="space-y-6 animate-fade-in-up">
      <PageHeader title="Financial Reports" description="View daily, monthly, and yearly financial summaries." />

      <div className="flex gap-1 bg-gray-100 dark:bg-zinc-800/70 p-1 rounded-xl w-fit">
        {TABS.map((t) => (
          <button
            key={t}
            onClick={() => { setTab(t); setReport(null); setError('') }}
            className={cn(
              'px-5 py-2 rounded-lg text-sm font-semibold transition-all',
              tab === t
                ? 'bg-white dark:bg-zinc-900 text-gray-900 dark:text-white shadow-sm'
                : 'text-gray-500 dark:text-zinc-400 hover:text-gray-700 dark:hover:text-zinc-200',
            )}
          >
            {t}
          </button>
        ))}
      </div>

      <div className="flex flex-wrap items-end gap-3">
        {tab === 'Daily' && (
          <Field label="Date">
            <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="w-44" />
          </Field>
        )}
        {tab === 'Monthly' && (
          <>
            <Field label="Year">
              <Input type="number" value={year} min={2020} max={2099} onChange={(e) => setYear(Number(e.target.value))} className="w-28" />
            </Field>
            <Field label="Month">
              <Select value={month} onChange={(e) => setMonth(Number(e.target.value))} className="w-40">
                {MONTHS.map((m, i) => <option key={m} value={i + 1}>{m}</option>)}
              </Select>
            </Field>
          </>
        )}
        {tab === 'Yearly' && (
          <Field label="Year">
            <Input type="number" value={year} min={2020} max={2099} onChange={(e) => setYear(Number(e.target.value))} className="w-28" />
          </Field>
        )}
        <Button onClick={fetchReport} loading={loading}>
          {loading ? 'Generating…' : 'Generate Report'}
        </Button>
      </div>

      {error && <Alert tone="error">{error}</Alert>}

      {report && (
        <div className="space-y-5">
          <p className="text-xs text-gray-400 dark:text-zinc-500 font-medium">
            {formatDate(report.startDate)} — {formatDate(report.endDate)} &nbsp;·&nbsp; {report.reportType} Report
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <StatCard label="Total Revenue" value={formatCurrency(report.totalRevenue)} icon={TrendingUp} accent="emerald" />
            <StatCard label="Total Invoices" value={report.totalInvoices} icon={Receipt} accent="blue" />
            <StatCard label="Total Discounts Given" value={formatCurrency(report.totalDiscountGiven)} icon={Tag} accent="violet" />
          </div>
        </div>
      )}

      {!report && !loading && !error && (
        <Card>
          <EmptyState icon={BarChart3} title="No report generated yet" description="Select a period and click Generate Report." />
        </Card>
      )}
    </div>
  )
}
