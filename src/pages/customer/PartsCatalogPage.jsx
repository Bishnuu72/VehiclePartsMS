import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { partsApi } from '../../api/partsApi'
import { formatCurrency } from '../../utils/formatters'
import { Package, Search, ChevronLeft, ChevronRight, Wrench } from 'lucide-react'
import { PageHeader } from '../../components/ui/PageHeader'
import { Button } from '../../components/ui/Button'
import { Badge } from '../../components/ui/Badge'
import { Alert } from '../../components/ui/Alert'
import { EmptyState } from '../../components/ui/EmptyState'
import { Input } from '../../components/ui/Field'
import { Card } from '../../components/ui/Card'

const PAGE_SIZE = 12

function stockBadge(q) {
  if (q === 0) return <Badge tone="danger">Out of stock</Badge>
  if (q < 10) return <Badge tone="warning">Low stock · {q}</Badge>
  return <Badge tone="success">In stock</Badge>
}

export default function PartsCatalogPage() {
  const [parts, setParts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [category, setCategory] = useState('')
  const [page, setPage] = useState(1)

  useEffect(() => { fetchParts() }, [page, category])

  async function fetchParts() {
    setLoading(true); setError('')
    try {
      const { data } = await partsApi.getAll(page, PAGE_SIZE, category)
      setParts(data)
    } catch {
      setError('Failed to load the parts catalog.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6 animate-fade-in-up">
      <PageHeader title="Browse Parts" description="Explore available vehicle parts. Can't find something? Request it." />

      <div className="flex flex-col sm:flex-row sm:items-center gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-zinc-500 pointer-events-none" />
          <Input
            type="text" placeholder="Filter by category…" value={category}
            onChange={(e) => { setCategory(e.target.value); setPage(1) }}
            className="pl-10 bg-white dark:bg-zinc-900"
          />
        </div>
        <Link to="/customer/part-requests" className="sm:ml-auto">
          <Button variant="secondary" icon={Wrench}>Request a Part</Button>
        </Link>
      </div>

      {error && <Alert tone="error">{error}</Alert>}

      {loading ? (
        <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="bg-white dark:bg-zinc-900 rounded-2xl border border-gray-200/80 dark:border-zinc-800 overflow-hidden">
              <div className="aspect-[4/3] bg-gray-100 dark:bg-zinc-800 animate-pulse" />
              <div className="p-4 space-y-2">
                <div className="h-4 w-2/3 bg-gray-100 dark:bg-zinc-800 rounded animate-pulse" />
                <div className="h-3 w-1/3 bg-gray-100 dark:bg-zinc-800 rounded animate-pulse" />
              </div>
            </div>
          ))}
        </div>
      ) : parts.length === 0 ? (
        <Card>
          <EmptyState
            icon={Package}
            title="No parts found"
            description={category ? 'Try a different category filter.' : 'The catalog is currently empty.'}
            action={
              <Link to="/customer/part-requests">
                <Button icon={Wrench}>Request a Part</Button>
              </Link>
            }
          />
        </Card>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {parts.map((p) => (
            <div
              key={p.id}
              className="group bg-white dark:bg-zinc-900 rounded-2xl border border-gray-200/80 dark:border-zinc-800 overflow-hidden shadow-[0_1px_2px_rgba(0,0,0,0.04)] dark:shadow-none hover:shadow-[0_8px_28px_rgba(0,0,0,0.08)] dark:hover:border-zinc-700 transition-all duration-200"
            >
              <div className="aspect-[4/3] bg-gray-50 dark:bg-zinc-800 overflow-hidden">
                {p.imageUrl ? (
                  <img
                    src={p.imageUrl} alt={p.name}
                    className="w-full h-full object-cover group-hover:scale-[1.04] transition-transform duration-300"
                    onError={(e) => { e.currentTarget.style.display = 'none' }}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Package className="w-10 h-10 text-gray-300 dark:text-zinc-700" strokeWidth={1.5} />
                  </div>
                )}
              </div>
              <div className="p-4">
                <div className="flex items-start justify-between gap-2">
                  <p className="font-semibold text-gray-900 dark:text-white text-sm leading-snug">{p.name}</p>
                </div>
                {p.category && (
                  <p className="text-[11px] text-gray-400 dark:text-zinc-500 mt-0.5 uppercase tracking-wide">{p.category}</p>
                )}
                {p.description && (
                  <p className="text-xs text-gray-500 dark:text-zinc-400 mt-1.5 line-clamp-2">{p.description}</p>
                )}
                <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100 dark:border-zinc-800">
                  <span className="font-bold text-gray-900 dark:text-white tabular-nums">{formatCurrency(p.price)}</span>
                  {stockBadge(p.stockQuantity)}
                </div>
                <Link
                  to={`/customer/part-requests?part=${encodeURIComponent(p.name)}`}
                  className="block mt-3"
                >
                  <Button
                    size="sm"
                    variant={p.stockQuantity === 0 ? 'primary' : 'secondary'}
                    icon={Wrench}
                    className="w-full"
                  >
                    Request this part
                  </Button>
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}

      {!loading && parts.length > 0 && (
        <div className="flex items-center justify-end gap-2">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}
            className="p-2 rounded-xl border border-gray-200 dark:border-zinc-700 text-gray-600 dark:text-zinc-400 hover:bg-gray-50 dark:hover:bg-zinc-800 disabled:opacity-30 disabled:pointer-events-none transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="text-sm text-gray-500 dark:text-zinc-400 px-3 font-semibold tabular-nums">Page {page}</span>
          <button
            onClick={() => setPage((p) => p + 1)} disabled={parts.length < PAGE_SIZE}
            className="p-2 rounded-xl border border-gray-200 dark:border-zinc-700 text-gray-600 dark:text-zinc-400 hover:bg-gray-50 dark:hover:bg-zinc-800 disabled:opacity-30 disabled:pointer-events-none transition-colors"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  )
}
