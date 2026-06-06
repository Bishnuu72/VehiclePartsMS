import { useState, useEffect } from 'react'
import { reviewsApi } from '../../api/reviewsApi'
import { useCustomerProfile } from '../../hooks/useCustomerProfile'
import { formatDate } from '../../utils/formatters'
import { Star, Plus } from 'lucide-react'
import { PageHeader } from '../../components/ui/PageHeader'
import { Button } from '../../components/ui/Button'
import { Card } from '../../components/ui/Card'
import { Alert } from '../../components/ui/Alert'
import { EmptyState } from '../../components/ui/EmptyState'
import { PageLoader } from '../../components/ui/Spinner'
import { Field, Textarea } from '../../components/ui/Field'

function StarRating({ value, onChange }) {
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star} type="button" onClick={() => onChange(star)}
          className={`transition-colors ${star <= value ? 'text-amber-400' : 'text-gray-300 dark:text-zinc-600'} hover:text-amber-400`}
        >
          <Star className="w-6 h-6" fill={star <= value ? 'currentColor' : 'none'} strokeWidth={1.5} />
        </button>
      ))}
    </div>
  )
}

function StarDisplay({ value }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={`w-4 h-4 ${star <= value ? 'text-amber-400' : 'text-gray-200 dark:text-zinc-700'}`}
          fill={star <= value ? 'currentColor' : 'none'} strokeWidth={1.5}
        />
      ))}
    </div>
  )
}

export default function ReviewsPage() {
  const { profile, loading: profileLoading, error: profileError } = useCustomerProfile()

  const [reviews, setReviews] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [rating, setRating] = useState(5)
  const [comment, setComment] = useState('')
  const [formLoading, setFormLoading] = useState(false)
  const [formError, setFormError] = useState('')

  useEffect(() => { fetchReviews() }, [])

  async function fetchReviews() {
    setLoading(true)
    try {
      const { data } = await reviewsApi.getAll()
      setReviews(data)
    } catch {
      setError('Failed to load reviews.')
    } finally {
      setLoading(false)
    }
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (!profile) return
    setFormError('')
    setFormLoading(true)
    try {
      await reviewsApi.create({
        customerProfileId: profile.id,
        rating,
        comment: comment || null,
      })
      setShowForm(false)
      setRating(5)
      setComment('')
      fetchReviews()
    } catch (err) {
      setFormError(err.response?.data?.message || 'Failed to submit review.')
    } finally {
      setFormLoading(false)
    }
  }

  const myReviews = profile
    ? reviews.filter((r) => r.customerProfileId === profile.id)
    : []

  if (profileLoading) return <PageLoader />
  if (profileError) return <Alert tone="error">{profileError}</Alert>

  return (
    <div className="max-w-2xl space-y-6 animate-fade-in-up">
      <PageHeader title="Reviews" description="Share your experience with our service.">
        <Button
          variant="primary" icon={Plus}
          onClick={() => { setShowForm((v) => !v); setFormError('') }}
        >
          {showForm ? 'Cancel' : 'Write Review'}
        </Button>
      </PageHeader>

      {error && <Alert tone="error">{error}</Alert>}

      {showForm && (
        <Card padded>
          <h3 className="text-[15px] font-semibold text-gray-900 dark:text-white mb-5">Write a Review</h3>
          {formError && <Alert tone="error" className="mb-4">{formError}</Alert>}
          <form onSubmit={handleSubmit} className="space-y-4">
            <Field label="Rating" required>
              <StarRating value={rating} onChange={setRating} />
            </Field>
            <Field label="Comment">
              <Textarea
                value={comment} onChange={(e) => setComment(e.target.value)}
                rows={4} placeholder="Tell us about your experience…"
              />
            </Field>
            <div className="flex gap-3 pt-1">
              <button type="button" onClick={() => setShowForm(false)} className="flex-1 py-2.5 border border-gray-200 dark:border-zinc-700 text-gray-700 dark:text-zinc-300 text-sm font-semibold rounded-xl hover:bg-gray-50 dark:hover:bg-zinc-800 transition-colors">
                Cancel
              </button>
              <Button type="submit" loading={formLoading} className="flex-1">
                {formLoading ? 'Submitting…' : 'Submit Review'}
              </Button>
            </div>
          </form>
        </Card>
      )}

      <div className="space-y-3">
        {loading ? (
          <PageLoader label="Loading reviews…" />
        ) : myReviews.length === 0 ? (
          <Card>
            <EmptyState icon={Star} title="No reviews submitted yet" description="Share your feedback about our service." />
          </Card>
        ) : (
          myReviews.map((rev) => (
            <Card key={rev.id} className="p-5">
              <div className="flex items-center justify-between mb-2">
                <StarDisplay value={rev.rating} />
                <span className="text-xs text-gray-400 dark:text-zinc-500">{formatDate(rev.reviewDate)}</span>
              </div>
              {rev.comment && <p className="text-sm text-gray-700 dark:text-zinc-300 mt-2 leading-relaxed">{rev.comment}</p>}
            </Card>
          ))
        )}
      </div>
    </div>
  )
}
