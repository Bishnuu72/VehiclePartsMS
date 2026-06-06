import { useState, useEffect } from 'react'
import { appointmentsApi } from '../../api/appointmentsApi'
import { formatDate } from '../../utils/formatters'
import { Calendar, Check, CheckCheck, X, RotateCcw } from 'lucide-react'
import { PageHeader } from '../../components/ui/PageHeader'
import { Button } from '../../components/ui/Button'
import { Card } from '../../components/ui/Card'
import { Badge } from '../../components/ui/Badge'
import { Alert } from '../../components/ui/Alert'
import { EmptyState } from '../../components/ui/EmptyState'
import { TableSkeleton } from '../../components/ui/Skeleton'
import { cn } from '../../lib/cn'

const STATUS_TONE = {
  Pending: 'warning',
  Confirmed: 'info',
  Completed: 'success',
  Cancelled: 'danger',
}
// AppointmentStatus enum: Pending=0, Confirmed=1, Completed=2, Cancelled=3
const STATUS_NUM = { Pending: 0, Confirmed: 1, Completed: 2, Cancelled: 3 }
const FILTERS = ['All', 'Pending', 'Confirmed', 'Completed', 'Cancelled']

export default function StaffAppointmentsPage() {
  const [appointments, setAppointments] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [filter, setFilter] = useState('All')
  const [busyId, setBusyId] = useState(null)

  useEffect(() => { fetchAppointments() }, [])

  async function fetchAppointments() {
    setLoading(true)
    setError('')
    try {
      const { data } = await appointmentsApi.getAll()
      setAppointments(data)
    } catch {
      setError('Failed to load appointments.')
    } finally {
      setLoading(false)
    }
  }

  async function setStatus(appt, statusName) {
    setBusyId(appt.id)
    setError('')
    try {
      const { data } = await appointmentsApi.update(appt.id, {
        vehicleId: appt.vehicleId ?? null,
        appointmentDate: new Date(appt.appointmentDate).toISOString(),
        notes: appt.notes || null,
        status: STATUS_NUM[statusName],
      })
      setAppointments((list) => list.map((a) => (a.id === appt.id ? { ...a, status: data.status } : a)))
    } catch {
      setError('Failed to update appointment status.')
    } finally {
      setBusyId(null)
    }
  }

  const shown = filter === 'All' ? appointments : appointments.filter((a) => a.status === filter)
  const pendingCount = appointments.filter((a) => a.status === 'Pending').length

  return (
    <div className="space-y-6 animate-fade-in-up">
      <PageHeader
        title="Appointments"
        description="All customer service appointments — confirm, complete or cancel them."
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
        {pendingCount > 0 && <Badge tone="warning">{pendingCount} pending</Badge>}
      </div>

      <Card className="overflow-hidden">
        {loading ? (
          <TableSkeleton rows={6} cols={5} />
        ) : shown.length === 0 ? (
          <EmptyState
            icon={Calendar}
            title={filter === 'All' ? 'No appointments yet' : `No ${filter.toLowerCase()} appointments`}
            description="Customer service appointments will appear here."
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[760px]">
              <thead>
                <tr className="border-b border-gray-100 dark:border-zinc-800 bg-gray-50/70 dark:bg-zinc-800/50">
                  {['Customer', 'Vehicle', 'Date & Time', 'Status', 'Actions'].map((h, i) => (
                    <th key={i} className="px-5 py-3.5 text-left text-[11px] font-bold text-gray-400 dark:text-zinc-500 uppercase tracking-[0.1em]">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-zinc-800">
                {shown.map((a) => (
                  <tr key={a.id} className="hover:bg-gray-50/60 dark:hover:bg-zinc-800/30 transition-colors">
                    <td className="px-5 py-4">
                      <p className="font-semibold text-gray-900 dark:text-white">{a.customerName}</p>
                      {a.notes && <p className="text-xs text-gray-400 dark:text-zinc-500 mt-0.5 max-w-xs truncate italic">"{a.notes}"</p>}
                    </td>
                    <td className="px-5 py-4 text-gray-500 dark:text-zinc-400">{a.vehicleNumber ?? '—'}</td>
                    <td className="px-5 py-4 text-gray-600 dark:text-zinc-300">{formatDate(a.appointmentDate)}</td>
                    <td className="px-5 py-4">
                      <Badge tone={STATUS_TONE[a.status] ?? 'neutral'}>{a.status}</Badge>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center justify-end gap-2">
                        {a.status === 'Pending' && (
                          <Button size="sm" variant="secondary" icon={Check} loading={busyId === a.id} onClick={() => setStatus(a, 'Confirmed')}>Confirm</Button>
                        )}
                        {(a.status === 'Pending' || a.status === 'Confirmed') && (
                          <Button size="sm" variant="secondary" icon={CheckCheck} loading={busyId === a.id} onClick={() => setStatus(a, 'Completed')}>Complete</Button>
                        )}
                        {a.status !== 'Cancelled' && a.status !== 'Completed' && (
                          <Button size="sm" variant="dangerSoft" icon={X} loading={busyId === a.id} onClick={() => setStatus(a, 'Cancelled')}>Cancel</Button>
                        )}
                        {(a.status === 'Completed' || a.status === 'Cancelled') && (
                          <Button size="sm" variant="ghost" icon={RotateCcw} loading={busyId === a.id} onClick={() => setStatus(a, 'Pending')}>Reset</Button>
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
