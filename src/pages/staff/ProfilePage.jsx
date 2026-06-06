import { useState, useEffect } from 'react'
import { usersApi } from '../../api/usersApi'
import { formatDate } from '../../utils/formatters'
import { Camera, Pencil } from 'lucide-react'
import { PageHeader } from '../../components/ui/PageHeader'
import { Button } from '../../components/ui/Button'
import { Card } from '../../components/ui/Card'
import { Badge } from '../../components/ui/Badge'
import { Alert } from '../../components/ui/Alert'
import { PageLoader } from '../../components/ui/Spinner'
import { Field, Input } from '../../components/ui/Field'

function initials(p) {
  return `${p?.firstName?.[0] ?? ''}${p?.lastName?.[0] ?? ''}`.toUpperCase() || '?'
}

export default function StaffProfilePage() {
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [editing, setEditing] = useState(false)
  const [form, setForm] = useState({ firstName: '', lastName: '', phone: '' })
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)

  useEffect(() => { load() }, [])

  async function load() {
    setLoading(true)
    try {
      const { data } = await usersApi.getMe()
      setProfile(data)
      setForm({ firstName: data.firstName, lastName: data.lastName, phone: data.phone ?? '' })
    } catch {
      setError('Failed to load your profile.')
    } finally {
      setLoading(false)
    }
  }

  async function handleSave(e) {
    e.preventDefault()
    setSaving(true)
    setError('')
    try {
      const { data } = await usersApi.updateMe({
        firstName: form.firstName,
        lastName: form.lastName,
        phone: form.phone || null,
      })
      setProfile(data)
      setEditing(false)
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update profile.')
    } finally {
      setSaving(false)
    }
  }

  async function handlePicture(file) {
    if (!file) return
    setUploading(true)
    setError('')
    try {
      const { data } = await usersApi.uploadProfilePicture(file)
      setProfile((p) => ({ ...p, profilePictureUrl: data.imageUrl }))
    } catch {
      setError('Failed to upload profile picture.')
    } finally {
      setUploading(false)
    }
  }

  if (loading) return <PageLoader label="Loading your profile…" />
  if (!profile) return <Alert tone="error">{error || 'Profile unavailable.'}</Alert>

  return (
    <div className="max-w-2xl space-y-6 animate-fade-in-up">
      <PageHeader title="My Profile" description="Manage your account details and profile photo." />

      {error && <Alert tone="error">{error}</Alert>}

      <Card padded>
        <div className="flex items-center gap-5">
          <div className="relative w-20 h-20 rounded-2xl overflow-hidden flex-shrink-0 bg-emerald-600 flex items-center justify-center">
            {profile.profilePictureUrl ? (
              <img
                src={profile.profilePictureUrl} alt="Profile"
                className="w-full h-full object-cover"
                onError={(e) => { e.currentTarget.style.display = 'none' }}
              />
            ) : (
              <span className="text-2xl font-bold text-white">{initials(profile)}</span>
            )}
            {uploading && (
              <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                <span className="w-5 h-5 rounded-full border-2 border-white/40 border-t-white animate-spin" />
              </div>
            )}
            <label
              className="absolute bottom-0 inset-x-0 h-7 bg-black/55 flex items-center justify-center cursor-pointer text-white"
              title="Change photo"
            >
              <Camera className="w-3.5 h-3.5" />
              <input
                type="file" className="hidden" accept="image/jpeg,image/png,image/webp"
                onChange={(e) => handlePicture(e.target.files?.[0])}
              />
            </label>
          </div>
          <div className="min-w-0">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white tracking-tight">
              {profile.firstName} {profile.lastName}
            </h2>
            <p className="text-sm text-gray-500 dark:text-zinc-400 mt-0.5 truncate">{profile.email}</p>
            <div className="flex items-center gap-2 mt-2">
              <Badge tone="info">{profile.role}</Badge>
              <Badge tone={profile.isActive ? 'success' : 'neutral'}>
                {profile.isActive ? 'Active' : 'Inactive'}
              </Badge>
            </div>
          </div>
        </div>
      </Card>

      <Card padded>
        <div className="flex items-center justify-between mb-5">
          <h3 className="font-semibold text-gray-900 dark:text-white text-[15px]">Account Details</h3>
          {!editing && (
            <Button size="sm" variant="secondary" icon={Pencil} onClick={() => setEditing(true)}>
              Edit
            </Button>
          )}
        </div>

        {editing ? (
          <form onSubmit={handleSave} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <Field label="First Name" required>
                <Input
                  value={form.firstName}
                  onChange={(e) => setForm((f) => ({ ...f, firstName: e.target.value }))}
                  required
                />
              </Field>
              <Field label="Last Name" required>
                <Input
                  value={form.lastName}
                  onChange={(e) => setForm((f) => ({ ...f, lastName: e.target.value }))}
                  required
                />
              </Field>
            </div>
            <Field label="Email">
              <Input value={profile.email} disabled />
            </Field>
            <Field label="Phone">
              <Input
                type="tel" value={form.phone}
                onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
                placeholder="+977 98XXXXXXXX"
              />
            </Field>
            <div className="flex gap-3 pt-1">
              <button
                type="button"
                onClick={() => {
                  setEditing(false)
                  setForm({ firstName: profile.firstName, lastName: profile.lastName, phone: profile.phone ?? '' })
                }}
                className="flex-1 py-2.5 border border-gray-200 dark:border-zinc-700 text-gray-700 dark:text-zinc-300 text-sm font-semibold rounded-xl hover:bg-gray-50 dark:hover:bg-zinc-800 transition-colors"
              >
                Cancel
              </button>
              <Button type="submit" loading={saving} className="flex-1">
                {saving ? 'Saving…' : 'Save Changes'}
              </Button>
            </div>
          </form>
        ) : (
          <dl className="divide-y divide-gray-100 dark:divide-zinc-800/70">
            {[
              ['Name', `${profile.firstName} ${profile.lastName}`],
              ['Email', profile.email],
              ['Phone', profile.phone ?? '—'],
              ['Role', profile.role],
              ['Member since', formatDate(profile.createdAt)],
            ].map(([label, val]) => (
              <div key={label} className="flex justify-between items-center gap-4 py-3.5">
                <dt className="text-[11px] font-bold text-gray-400 dark:text-zinc-500 uppercase tracking-[0.1em]">
                  {label}
                </dt>
                <dd className="text-sm font-semibold text-gray-900 dark:text-white text-right">{val}</dd>
              </div>
            ))}
          </dl>
        )}
      </Card>
    </div>
  )
}
