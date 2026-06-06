import { useState, useEffect } from 'react'
import { partsApi } from '../../api/partsApi'
import { customersApi } from '../../api/customersApi'
import { usersApi } from '../../api/usersApi'
import { vendorsApi } from '../../api/vendorsApi'
import { formatCurrency } from '../../utils/formatters'
import { Package, Users, Truck, UserCheck, AlertTriangle, CreditCard } from 'lucide-react'
import { PageHeader } from '../../components/ui/PageHeader'
import { StatCard } from '../../components/ui/StatCard'
import { Card, CardHeader } from '../../components/ui/Card'
import { Badge } from '../../components/ui/Badge'
import { Alert } from '../../components/ui/Alert'
import { EmptyState } from '../../components/ui/EmptyState'
import { CardGridSkeleton, Skeleton } from '../../components/ui/Skeleton'
import { Donut, BarChart } from '../../components/ui/Charts'
import { PieChart, BarChart3 } from 'lucide-react'

function getGreeting() {
  const h = new Date().getHours()
  return h < 12 ? 'Good morning' : h < 17 ? 'Good afternoon' : 'Good evening'
}
function getDate() {
  return new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })
}

export default function AdminDashboard() {
  const [stats, setStats] = useState({ parts: 0, staff: 0, vendors: 0, customers: 0 })
  const [lowStock, setLowStock] = useState([])
  const [inventory, setInventory] = useState({ inStock: 0, low: 0, out: 0 })
  const [pendingCredits, setPendingCredits] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    async function load() {
      try {
        const [partsRes, staffRes, vendorsRes, customersRes, creditsRes] = await Promise.all([
          partsApi.getAll(1, 200),
          usersApi.getStaff(),
          vendorsApi.getAll(),
          customersApi.getAll(),
          customersApi.getPendingCredits(),
        ])
        const allParts = partsRes.data?.items ?? partsRes.data ?? []
        setStats({
          parts: allParts.length,
          staff: staffRes.data?.length ?? 0,
          vendors: vendorsRes.data?.length ?? 0,
          customers: customersRes.data?.length ?? 0,
        })
        setLowStock(allParts.filter((p) => p.stockQuantity < 10))
        setInventory({
          inStock: allParts.filter((p) => p.stockQuantity >= 10).length,
          low: allParts.filter((p) => p.stockQuantity > 0 && p.stockQuantity < 10).length,
          out: allParts.filter((p) => p.stockQuantity === 0).length,
        })
        setPendingCredits(creditsRes.data ?? [])
      } catch {
        setError('Failed to load dashboard data.')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const STATS = [
    { label: 'Parts', value: stats.parts, icon: Package, accent: 'violet', sub: 'in inventory' },
    { label: 'Staff', value: stats.staff, icon: Users, accent: 'blue', sub: 'active accounts' },
    { label: 'Vendors', value: stats.vendors, icon: Truck, accent: 'amber', sub: 'suppliers' },
    { label: 'Customers', value: stats.customers, icon: UserCheck, accent: 'emerald', sub: 'registered' },
  ]
  const totalCredit = pendingCredits.reduce((s, c) => s + (c.creditBalance ?? 0), 0)

  return (
    <div className="space-y-6 animate-fade-in-up">
      <PageHeader title="Dashboard" description={`${getGreeting()} · ${getDate()}`} />

      {error && <Alert tone="error">{error}</Alert>}

      {loading ? (
        <>
          <CardGridSkeleton count={4} />
          <Skeleton className="h-64 w-full rounded-2xl" />
        </>
      ) : (
        <>
          {/* Stat cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {STATS.map((s) => (
              <StatCard key={s.label} {...s} />
            ))}
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card className="overflow-hidden">
              <CardHeader icon={PieChart} title="Inventory Health" description="Stock status across all parts" />
              <div className="p-6">
                <Donut
                  centerLabel="parts"
                  data={[
                    { label: 'In stock', value: inventory.inStock, color: '#10b981' },
                    { label: 'Low stock', value: inventory.low, color: '#f59e0b' },
                    { label: 'Out of stock', value: inventory.out, color: '#ef4444' },
                  ]}
                />
              </div>
            </Card>
            <Card className="overflow-hidden">
              <CardHeader icon={BarChart3} title="Overview" description="Key entities at a glance" />
              <div className="p-6">
                <BarChart
                  data={[
                    { label: 'Parts', value: stats.parts, color: '#7c3aed' },
                    { label: 'Customers', value: stats.customers, color: '#10b981' },
                    { label: 'Vendors', value: stats.vendors, color: '#f59e0b' },
                    { label: 'Staff', value: stats.staff, color: '#3b82f6' },
                  ]}
                />
              </div>
            </Card>
          </div>

          {/* Low stock */}
          <Card className="overflow-hidden">
            <CardHeader
              icon={AlertTriangle}
              title="Low Stock Alerts"
              description="Parts with fewer than 10 units remaining"
              action={
                lowStock.length > 0 && (
                  <Badge tone="danger">
                    {lowStock.length} alert{lowStock.length !== 1 ? 's' : ''}
                  </Badge>
                )
              }
            />
            {lowStock.length === 0 ? (
              <EmptyState icon={Package} title="All parts are well stocked" description="No items are below the low-stock threshold." />
            ) : (
              <div className="divide-y divide-gray-100 dark:divide-zinc-800/60">
                {lowStock.map((part) => {
                  const pct = Math.min(100, Math.round((part.stockQuantity / 9) * 100))
                  return (
                    <div key={part.id} className="flex items-center justify-between px-6 py-4 hover:bg-gray-50/70 dark:hover:bg-zinc-800/30 transition-colors">
                      <div className="flex items-center gap-4 flex-1 min-w-0">
                        <div className="w-9 h-9 bg-gray-100 dark:bg-zinc-800 rounded-xl flex items-center justify-center flex-shrink-0">
                          <Package className="w-4 h-4 text-gray-400 dark:text-zinc-500" strokeWidth={2} />
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">{part.name}</p>
                          <p className="text-xs text-gray-400 dark:text-zinc-500 mt-0.5">{part.category ?? 'Uncategorized'}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4 flex-shrink-0 ml-4">
                        <div className="hidden lg:flex flex-col items-end gap-1.5">
                          <div className="w-20 h-1.5 bg-gray-100 dark:bg-zinc-700 rounded-full overflow-hidden">
                            <div className={`h-full rounded-full ${part.stockQuantity === 0 ? 'bg-red-500' : 'bg-amber-400'}`} style={{ width: `${pct}%` }} />
                          </div>
                          <span className="text-[10px] text-gray-400 dark:text-zinc-500 font-medium">{pct}% of threshold</span>
                        </div>
                        <Badge tone={part.stockQuantity === 0 ? 'danger' : 'warning'}>
                          {part.stockQuantity === 0 ? 'Out of stock' : `${part.stockQuantity} left`}
                        </Badge>
                        <span className="text-sm font-bold text-gray-600 dark:text-zinc-300 tabular-nums whitespace-nowrap">{formatCurrency(part.price)}</span>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </Card>

          {/* Pending credits */}
          <Card className="overflow-hidden">
            <CardHeader
              icon={CreditCard}
              title="Overdue Credit"
              description="Customers with outstanding balances"
              action={
                pendingCredits.length > 0 && (
                  <div className="text-right">
                    <p className="text-base font-bold text-red-600 dark:text-red-400 tabular-nums">{formatCurrency(totalCredit)}</p>
                    <p className="text-[10px] text-gray-400 dark:text-zinc-500 font-medium mt-0.5">{pendingCredits.length} customers</p>
                  </div>
                )
              }
            />
            {pendingCredits.length === 0 ? (
              <EmptyState icon={CreditCard} title="No outstanding credit" description="All customer balances are settled." />
            ) : (
              <div className="divide-y divide-gray-100 dark:divide-zinc-800/60">
                {pendingCredits.map((c, i) => {
                  const colors = ['bg-violet-600', 'bg-blue-600', 'bg-emerald-600', 'bg-amber-500', 'bg-rose-600', 'bg-indigo-600']
                  const bg = colors[i % colors.length]
                  return (
                    <div key={c.id} className="flex items-center justify-between px-6 py-4 hover:bg-gray-50/70 dark:hover:bg-zinc-800/30 transition-colors">
                      <div className="flex items-center gap-3">
                        <div className={`w-9 h-9 ${bg} rounded-full flex items-center justify-center flex-shrink-0`}>
                          <span className="text-[11px] font-bold text-white">{c.fullName?.charAt(0)?.toUpperCase() ?? '?'}</span>
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-gray-900 dark:text-white">{c.fullName}</p>
                          <p className="text-xs text-gray-400 dark:text-zinc-500 mt-0.5">{c.email}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-base font-bold text-red-600 dark:text-red-400 tabular-nums">{formatCurrency(c.creditBalance)}</p>
                        <p className="text-[10px] text-gray-400 dark:text-zinc-500 mt-0.5">{c.purchaseCount ?? 0} purchase{c.purchaseCount !== 1 ? 's' : ''}</p>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </Card>
        </>
      )}
    </div>
  )
}
