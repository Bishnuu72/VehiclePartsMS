import { useState, useEffect } from 'react'
import { useAuth } from '../../hooks/useAuth'
import { useNavigate } from 'react-router-dom'
import { customersApi } from '../../api/customersApi'
import { appointmentsApi } from '../../api/appointmentsApi'
import { partRequestsApi } from '../../api/partRequestsApi'
import { formatCurrency } from '../../utils/formatters'
import { Users, ShoppingCart, BarChart2, ArrowRight, Receipt, PieChart, Wrench } from 'lucide-react'
import { PageHeader } from '../../components/ui/PageHeader'
import { StatCard } from '../../components/ui/StatCard'
import { Card, CardHeader } from '../../components/ui/Card'
import { Donut, BarChart } from '../../components/ui/Charts'

function getGreeting() {
  const h = new Date().getHours()
  return h < 12 ? 'Good morning' : h < 17 ? 'Good afternoon' : 'Good evening'
}
function getDate() {
  return new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })
}

const SHORTCUTS = [
  { label: 'Customers', desc: 'Register customers, search profiles, manage vehicles', icon: Users, to: '/staff/customers', accent: 'emerald' },
  { label: 'Sales & Invoices', desc: 'Create invoices, apply discounts, send receipts', icon: ShoppingCart, to: '/staff/sales', accent: 'blue' },
  { label: 'Customer Reports', desc: 'Top spenders, regulars, overdue credit balances', icon: BarChart2, to: '/staff/customer-reports', accent: 'violet' },
]

const ICON_BG = {
  emerald: 'bg-emerald-600',
  blue: 'bg-blue-600',
  violet: 'bg-violet-600',
}

export default function StaffDashboard() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const name = user?.email?.split('@')[0] ?? 'there'

  const [stats, setStats] = useState({ customers: 0, creditOwed: 0 })
  const [appts, setAppts] = useState([])
  const [requests, setRequests] = useState([])

  useEffect(() => {
    Promise.all([customersApi.getAll(), customersApi.getPendingCredits()])
      .then(([cRes, crRes]) => {
        const credit = (crRes.data ?? []).reduce((s, c) => s + (c.creditBalance ?? 0), 0)
        setStats({ customers: cRes.data?.length ?? 0, creditOwed: credit })
      })
      .catch(() => {})
    appointmentsApi.getAll().then(({ data }) => setAppts(data ?? [])).catch(() => {})
    partRequestsApi.getAll().then(({ data }) => setRequests(data ?? [])).catch(() => {})
  }, [])

  const apptBy = (s) => appts.filter((a) => a.status === s).length
  const reqBy = (s) => requests.filter((r) => r.status === s).length

  return (
    <div className="space-y-6 animate-fade-in-up">
      <PageHeader
        title={<span className="capitalize">{getGreeting()}, {name}</span>}
        description={`${getDate()} · Staff portal`}
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <StatCard label="Total Customers" value={stats.customers} icon={Users} accent="emerald" sub="registered" />
        <StatCard
          label="Credit Outstanding"
          value={formatCurrency(stats.creditOwed)}
          icon={Receipt}
          accent="red"
          valueClassName="text-red-600 dark:text-red-400"
          sub="across all customers"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card className="overflow-hidden">
          <CardHeader icon={PieChart} title="Appointments" description="By status" />
          <div className="p-6">
            <Donut
              centerLabel="total"
              data={[
                { label: 'Pending', value: apptBy('Pending'), color: '#f59e0b' },
                { label: 'Confirmed', value: apptBy('Confirmed'), color: '#3b82f6' },
                { label: 'Completed', value: apptBy('Completed'), color: '#10b981' },
                { label: 'Cancelled', value: apptBy('Cancelled'), color: '#ef4444' },
              ]}
            />
          </div>
        </Card>
        <Card className="overflow-hidden">
          <CardHeader icon={Wrench} title="Part Requests" description="By status" />
          <div className="p-6">
            <BarChart
              data={[
                { label: 'Pending', value: reqBy('Pending'), color: '#f59e0b' },
                { label: 'Available', value: reqBy('Available'), color: '#10b981' },
                { label: 'Unavailable', value: reqBy('Unavailable'), color: '#ef4444' },
              ]}
            />
          </div>
        </Card>
      </div>

      <div>
        <p className="text-[11px] font-bold text-gray-400 dark:text-zinc-600 uppercase tracking-[0.18em] mb-4">
          Quick Access
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {SHORTCUTS.map(({ label, desc, icon: Icon, to, accent }) => (
            <button
              key={to}
              onClick={() => navigate(to)}
              className="group text-left bg-white dark:bg-zinc-900 rounded-2xl border border-gray-200/80 dark:border-zinc-800 p-6 shadow-[0_1px_2px_rgba(0,0,0,0.04)] dark:shadow-none hover:shadow-[0_6px_24px_rgba(0,0,0,0.07)] dark:hover:border-zinc-700 transition-all duration-200"
            >
              <div className={`w-11 h-11 ${ICON_BG[accent]} rounded-xl flex items-center justify-center mb-5`}>
                <Icon className="w-5 h-5 text-white" strokeWidth={2} />
              </div>
              <p className="font-semibold text-gray-900 dark:text-white text-[15px]">{label}</p>
              <p className="text-xs text-gray-400 dark:text-zinc-500 mt-2 leading-relaxed">{desc}</p>
              <div className="mt-5 flex items-center gap-1.5 text-xs font-semibold text-gray-400 dark:text-zinc-600 group-hover:text-gray-900 dark:group-hover:text-zinc-200 transition-colors">
                Open <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
