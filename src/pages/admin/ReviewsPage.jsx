import { useState, useEffect } from 'react'
import { reviewsApi } from '../../api/reviewsApi'
import { formatDate } from '../../utils/formatters'
import { Star, MessageSquare } from 'lucide-react'
import { PageHeader } from '../../components/ui/PageHeader'
import { Card } from '../../components/ui/Card'
import { Alert } from '../../components/ui/Alert'
import { EmptyState } from '../../components/ui/EmptyState'
import { TableSkeleton } from '../../components/ui/Skeleton'
import { StatCard } from '../../components/ui/StatCard'

const AVATAR = ['bg-violet-600', 'bg-blue-600', 'bg-emerald-600', 'bg-amber-500', 'bg-rose-600', 'bg-indigo-600']

function Stars({ value, size = 'w-4 h-4' }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((s) => (
        <Star
          key={s}
          className={`${size} ${s <= value ? 'text-amber-400' : 'text-gray-200 dark:text-zinc-700'}`}
          fill={s <= value ? 'currentColor' : 'none'}
          strokeWidth={1.5}
        />
      ))}
    </div>
  )
}

export default function AdminReviewsPage() {
  const [reviews, setReviews] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    reviewsApi.getAll()
      .then(({ data }) => setReviews(data))
      .catch(() => setError('Failed to load reviews.'))
      .finally(() => setLoading(false))
  }, [])

  const total = reviews.length
  const avg = total ? reviews.reduce((s, r) => s + r.rating, 0) / total : 0
  const fiveStar = reviews.filter((r) => r.rating === 5).length

  return (
    <div className="space-y-6 animate-fade-in-up">
      <PageHeader title="Customer Reviews" description="Feedback submitted by customers about your service." />

      {error && <Alert tone="error">{error}</Alert>}

      {!loading && total > 0 && (
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
          <StatCard
            label="Average Rating"
            value={avg.toFixed(1)}
            sub={`out of 5 · ${total} review${total !== 1 ? 's' : ''}`}
            icon={Star}
            accent="amber"
          />
          <StatCard label="Total Reviews" value={total} icon={MessageSquare} accent="indigo" sub="all time" />
          <StatCard
            label="5-Star Reviews"
            value={fiveStar}
            sub={total ? `${Math.round((fiveStar / total) * 100)}% of all` : '—'}
            icon={Star}
            accent="emerald"
          />
        </div>
      )}

      <Card className="overflow-hidden">
        {loading ? (
          <TableSkeleton rows={5} cols={3} />
        ) : total === 0 ? (
          <EmptyState
            icon={MessageSquare}
            title="No reviews yet"
            description="Customer reviews will appear here once submitted."
          />
        ) : (
          <div className="divide-y divide-gray-100 dark:divide-zinc-800/70">
            {reviews.map((r, i) => (
              <div key={r.id} className="flex items-start gap-4 px-6 py-5">
                <div className={`w-10 h-10 rounded-full ${AVATAR[i % AVATAR.length]} flex items-center justify-center flex-shrink-0`}>
                  <span className="text-[12px] font-bold text-white">
                    {r.customerName?.charAt(0)?.toUpperCase() ?? '?'}
                  </span>
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-3 flex-wrap">
                    <p className="font-semibold text-gray-900 dark:text-white text-sm">{r.customerName}</p>
                    <div className="flex items-center gap-3">
                      <Stars value={r.rating} />
                      <span className="text-xs text-gray-400 dark:text-zinc-500">{formatDate(r.reviewDate)}</span>
                    </div>
                  </div>
                  {r.comment
                    ? <p className="text-sm text-gray-600 dark:text-zinc-300 mt-2 leading-relaxed">{r.comment}</p>
                    : <p className="text-sm text-gray-300 dark:text-zinc-600 mt-2 italic">No written comment.</p>}
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  )
}
