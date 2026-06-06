import { useState, useEffect } from 'react'
import { partRequestsApi } from '../../api/partRequestsApi'
import { formatDate } from '../../utils/formatters'
import { Wrench, Check, X, RotateCcw } from 'lucide-react'
import { PageHeader } from '../../components/ui/PageHeader'
import { Button } from '../../components/ui/Button'
import { Card } from '../../components/ui/Card'
import { Badge } from '../../components/ui/Badge'
import { Alert } from '../../components/ui/Alert'
import { EmptyState } from '../../components/ui/EmptyState'
import { TableSkeleton } from '../../components/ui/Skeleton'
import { cn } from '../../lib/cn'

const STATUS_TONE = { Pending: 'warning', Available: 'success', Unavailable: 'danger' }
// PartRequestStatus enum: Pending = 0, Available = 1, Unavailable = 2
const STATUS_NUM = { Pending: 0, Available: 1, Unavailable: 2 }
const FILTERS = ['All', 'Pending', 'Available', 'Unavailable']

export default function StaffPartRequestsPage() {
  const [requests, setRequests] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [filter, setFilter] = useState('All')
  const [busyId, setBusyId] = useState(null)

  useEffect(() => { fetchRequests() }, [])

  async function fetchRequests() {
    setLoading(true)
    setError('')
    try {
      const { data } = await partRequestsApi.getAll()
      setRequests(data)
    } catch {
      setError('Failed to load part requests.')
    } finally {
      setLoading(false)
    }
  }

  async function setStatus(id, statusName) {
    setBusyId(id)
    setError('')
    try {
      const { data } = await partRequestsApi.updateStatus(id, STATUS_NUM[statusName])
      setRequests((rs) => rs.map((r) => (r.id === id ? { ...r, status: data.status } : r)))
    } catch {
      setError('Failed to update request status.')
    } finally {
      setBusyId(null)
    }
  }

  const shown = filter === 'All' ? requests : requests.filter((r) => r.status === filter)
  const pendingCount = requests.filter((r) => r.status === 'Pending').length

  return (
    <div className="space-y-6 animate-fade-in-up">
      <PageHeader
        title="Part Requests"
        description="Customer requests for parts not in stock — mark them available or unavailable."
      />

      {error && <Alert tone="error">{error}</Alert>}

      <div className="flex flex-wrap items-center gap-2">
        <div className="flex gap-1 bg-gray-100 dark:bg-zinc-800/70 p-1 rounded-xl">
          {FILTERS.map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={cn(
                'px-3.5 py-1.5 rounded-lg text-sm font-semibold transition-all',
                filter === f
                  ? 'bg-white dark:bg-zinc-900 text-gray-900 dark:text-white shadow-sm'
                  : 'text-gray-500 dark:text-zinc-400 hover:text-gray-700 dark:hover:text-zinc-200',
              )}
            >
              {f}
            </button>
          ))}
        </div>
        {pendingCount > 0 && (
          <Badge tone="warning">{pendingCount} pending</Badge>
        )}
      </div>

      <Card className="overflow-hidden">
        {loading ? (
          <TableSkeleton rows={6} cols={5} />
        ) : shown.length === 0 ? (
          <EmptyState
            icon={Wrench}
            title={filter === 'All' ? 'No part requests yet' : `No ${filter.toLowerCase()} requests`}
            description="Customer part requests will appear here for you to action."
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[720px]">
              <thead>
                <tr className="border-b border-gray-100 dark:border-zinc-800 bg-gray-50/70 dark:bg-zinc-800/50">
                  {['Customer', 'Part', 'Requested', 'Status', 'Actions'].map((h, i) => (
                    <th key={i} className="px-5 py-3.5 text-left text-[11px] font-bold text-gray-400 dark:text-zinc-500 uppercase tracking-[0.1em]">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-zinc-800">
                {shown.map((r) => (
                  <tr key={r.id} className="hover:bg-gray-50/60 dark:hover:bg-zinc-800/30 transition-colors">
                    <td className="px-5 py-4 font-semibold text-gray-900 dark:text-white">{r.customerName}</td>
                    <td className="px-5 py-4">
                      <p className="font-medium text-gray-900 dark:text-white">{r.partName}</p>
                      {r.description && <p className="text-xs text-gray-400 dark:text-zinc-500 mt-0.5 max-w-xs truncate">{r.description}</p>}
                    </td>
                    <td className="px-5 py-4 text-gray-500 dark:text-zinc-400">{formatDate(r.requestDate)}</td>
                    <td className="px-5 py-4">
                      <Badge tone={STATUS_TONE[r.status] ?? 'neutral'}>{r.status}</Badge>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center justify-end gap-2">
                        {r.status !== 'Available' && (
                          <Button size="sm" variant="secondary" icon={Check}
                            loading={busyId === r.id}
                            onClick={() => setStatus(r.id, 'Available')}>
                            Available
                          </Button>
                        )}
                        {r.status !== 'Unavailable' && (
                          <Button size="sm" variant="dangerSoft" icon={X}
                            loading={busyId === r.id}
                            onClick={() => setStatus(r.id, 'Unavailable')}>
                            Unavailable
                          </Button>
                        )}
                        {r.status !== 'Pending' && (
                          <Button size="sm" variant="ghost" icon={RotateCcw}
                            loading={busyId === r.id}
                            onClick={() => setStatus(r.id, 'Pending')}>
                            Reset
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  )
}
