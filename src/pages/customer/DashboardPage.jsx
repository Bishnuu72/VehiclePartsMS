import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { customersApi } from '../../api/customersApi'
import { usersApi } from '../../api/usersApi'
import { appointmentsApi } from '../../api/appointmentsApi'
import { partRequestsApi } from '../../api/partRequestsApi'
import { useCustomerProfile } from '../../hooks/useCustomerProfile'
import { useAuth } from '../../hooks/useAuth'
import { formatCurrency } from '../../utils/formatters'
import { Car, Plus, Trash2, Pencil, DollarSign, CreditCard, Camera, Package, Calendar, Wrench, Star, Activity } from 'lucide-react'
import { Card, CardHeader } from '../../components/ui/Card'
import { Donut, BarChart } from '../../components/ui/Charts'
import { StatCard } from '../../components/ui/StatCard'
import { Button } from '../../components/ui/Button'
import { Field, Input } from '../../components/ui/Field'
import { Alert } from '../../components/ui/Alert'
import { EmptyState } from '../../components/ui/EmptyState'
import { PageLoader } from '../../components/ui/Spinner'

const EMPTY_VEHICLE = { vehicleNumber: '', make: '', model: '', year: '' }
const CAR_COLORS = ['bg-indigo-600', 'bg-violet-600', 'bg-blue-600', 'bg-emerald-600', 'bg-rose-600']

function getGreeting() {
  const h = new Date().getHours()
  return h < 12 ? 'Good morning' : h < 17 ? 'Good afternoon' : 'Good evening'
}


export default function CustomerDashboard() {
  const { user } = useAuth()
  const { profile: fetched, loading, error: profileError } = useCustomerProfile()

  const [profile, setProfile] = useState(null)
  const [error, setError] = useState('')
  const [editingProfile, setEditingProfile] = useState(false)
  const [profileForm, setProfileForm] = useState({ phone: '', address: '' })
  const [profileLoading, setProfileLoading] = useState(false)
  const [showVehicleForm, setShowVehicleForm] = useState(false)
  const [vehicleForm, setVehicleForm] = useState(EMPTY_VEHICLE)
  const [vehicleLoading, setVehicleLoading] = useState(false)
  const [vehicleError, setVehicleError] = useState('')
  const [myAppts, setMyAppts] = useState([])
  const [myRequests, setMyRequests] = useState([])

  useEffect(() => {
    if (fetched) {
      setProfile(fetched)
      setProfileForm({ phone: fetched.phone ?? '', address: fetched.address ?? '' })
    }
  }, [fetched])

  useEffect(() => {
    const id = fetched?.id
    if (!id) return
    appointmentsApi.getAll()
      .then(({ data }) => setMyAppts((data ?? []).filter((a) => a.customerProfileId === id)))
      .catch(() => {})
    partRequestsApi.getAll()
      .then(({ data }) => setMyRequests((data ?? []).filter((r) => r.customerProfileId === id)))
      .catch(() => {})
  }, [fetched])

  const apptBy = (s) => myAppts.filter((a) => a.status === s).length
  const reqBy = (s) => myRequests.filter((r) => r.status === s).length

  async function handleProfileSave(e) {
    e.preventDefault()
    setProfileLoading(true)
    try {
      await customersApi.update(profile.id, { phone: profileForm.phone || null, address: profileForm.address || null })
      setProfile((p) => ({ ...p, phone: profileForm.phone, address: profileForm.address }))
      setEditingProfile(false)
    } catch {
      setError('Failed to update profile.')
    } finally {
      setProfileLoading(false)
    }
  }

  async function handleAddVehicle(e) {
    e.preventDefault()
    setVehicleError('')
    setVehicleLoading(true)
    try {
      const { data } = await customersApi.addVehicle(profile.id, {
        vehicleNumber: vehicleForm.vehicleNumber,
        make: vehicleForm.make || null,
        model: vehicleForm.model || null,
        year: vehicleForm.year ? parseInt(vehicleForm.year, 10) : null,
      })
      setProfile((p) => ({ ...p, vehicles: [...p.vehicles, data] }))
      setVehicleForm(EMPTY_VEHICLE)
      setShowVehicleForm(false)
    } catch (err) {
      setVehicleError(err.response?.data?.message || 'Failed to add vehicle.')
    } finally {
      setVehicleLoading(false)
    }
  }

  async function handleDeleteVehicle(vehicleId) {
    try {
      await customersApi.deleteVehicle(profile.id, vehicleId)
      setProfile((p) => ({ ...p, vehicles: p.vehicles.filter((v) => v.id !== vehicleId) }))
    } catch {
      setError('Failed to remove vehicle.')
    }
  }

  const [uploadingVehicleId, setUploadingVehicleId] = useState(null)
  const [avatarUrl, setAvatarUrl] = useState(null)
  const [uploadingAvatar, setUploadingAvatar] = useState(false)

  useEffect(() => {
    usersApi.getMe()
      .then(({ data }) => setAvatarUrl(data.profilePictureUrl))
      .catch(() => {})
  }, [])

  async function handleAvatar(file) {
    if (!file) return
    setUploadingAvatar(true)
    setError('')
    try {
      const { data } = await usersApi.uploadProfilePicture(file)
      setAvatarUrl(data.imageUrl)
    } catch {
      setError('Failed to upload profile picture.')
    } finally {
      setUploadingAvatar(false)
    }
  }

  async function handleVehicleImage(vehicleId, file) {
    if (!file) return
    setUploadingVehicleId(vehicleId)
    setError('')
    try {
      const { data } = await customersApi.uploadVehicleImage(profile.id, vehicleId, file)
      setProfile((p) => ({
        ...p,
        vehicles: p.vehicles.map((v) =>
          v.id === vehicleId ? { ...v, imageUrl: data.imageUrl } : v,
        ),
      }))
    } catch {
      setError('Failed to upload vehicle image.')
    } finally {
      setUploadingVehicleId(null)
    }
  }

  if (loading) return <PageLoader label="Loading your profile…" />
  if (profileError) return <Alert tone="error">{profileError}</Alert>
  if (!profile) return null

  const firstName = profile.fullName?.split(' ')[0] ?? user?.email?.split('@')[0] ?? 'there'
  const initials =
    profile.fullName?.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase() ?? '?'

  return (
    <div className="space-y-6 animate-fade-in-up">
      {/* Profile header */}
      <Card padded>
        <div className="flex items-center gap-5">
          <div className="relative w-16 h-16 rounded-2xl overflow-hidden bg-indigo-600 flex items-center justify-center text-white font-bold text-xl flex-shrink-0">
            {avatarUrl ? (
              <img
                src={avatarUrl} alt="Profile"
                className="w-full h-full object-cover"
                onError={(e) => { e.currentTarget.style.display = 'none' }}
              />
            ) : (
              initials
            )}
            {uploadingAvatar && (
              <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                <span className="w-5 h-5 rounded-full border-2 border-white/40 border-t-white animate-spin" />
              </div>
            )}
            <label
              className="absolute bottom-0 inset-x-0 h-6 bg-black/55 flex items-center justify-center cursor-pointer"
              title="Change photo"
            >
              <Camera className="w-3.5 h-3.5 text-white" />
              <input
                type="file" className="hidden" accept="image/jpeg,image/png,image/webp"
                onChange={(e) => handleAvatar(e.target.files?.[0])}
              />
            </label>
          </div>
          <div className="min-w-0">
            <p className="text-indigo-600 dark:text-indigo-400 text-sm font-medium">{getGreeting()},</p>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight capitalize leading-tight">
              {firstName}
            </h1>
            <p className="text-gray-400 dark:text-zinc-500 text-xs mt-1 truncate">{profile.email}</p>
          </div>
        </div>
      </Card>

      {error && <Alert tone="error">{error}</Alert>}

      {/* Stats — full-size cards, full width so currency never clips */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard label="Total Spent" value={formatCurrency(profile.totalSpent)} icon={DollarSign} accent="indigo" sub="lifetime" />
        <StatCard
          label="Credit Balance"
          value={formatCurrency(profile.creditBalance)}
          icon={CreditCard}
          accent={profile.creditBalance > 0 ? 'red' : 'emerald'}
          valueClassName={profile.creditBalance > 0 ? 'text-red-600 dark:text-red-400' : undefined}
          sub={profile.creditBalance > 0 ? 'outstanding' : 'all settled'}
        />
        <StatCard label="Vehicles" value={profile.vehicles.length} icon={Car} accent="violet" sub="registered" />
      </div>

      {/* Activity overview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="overflow-hidden">
          <CardHeader icon={Calendar} title="My Appointments" description="Service bookings by status" />
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
          <CardHeader icon={Activity} title="My Part Requests" description="Requests by status" />
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

      {/* Personal details */}
      <Card padded>
        <div className="flex items-center justify-between mb-5">
          <h3 className="font-semibold text-gray-900 dark:text-white text-[15px]">Personal Details</h3>
          {!editingProfile && (
            <Button size="sm" variant="secondary" icon={Pencil} onClick={() => setEditingProfile(true)}>
              Edit
            </Button>
          )}
        </div>

        {editingProfile ? (
          <form onSubmit={handleProfileSave} className="space-y-4">
            <Field label="Full Name">
              <Input value={profile.fullName} disabled />
            </Field>
            <Field label="Email">
              <Input value={profile.email} disabled />
            </Field>
            <Field label="Phone">
              <Input
                type="tel" value={profileForm.phone}
                onChange={(e) => setProfileForm((p) => ({ ...p, phone: e.target.value }))}
                placeholder="+977 98XXXXXXXX"
              />
            </Field>
            <Field label="Address">
              <Input
                type="text" value={profileForm.address}
                onChange={(e) => setProfileForm((p) => ({ ...p, address: e.target.value }))}
                placeholder="Kathmandu, Nepal"
              />
            </Field>
            <div className="flex gap-3 pt-1">
              <button
                type="button"
                onClick={() => setEditingProfile(false)}
                className="flex-1 py-2.5 border border-gray-200 dark:border-zinc-700 text-gray-700 dark:text-zinc-300 text-sm font-semibold rounded-xl hover:bg-gray-50 dark:hover:bg-zinc-800 transition-colors"
              >
                Cancel
              </button>
              <Button type="submit" loading={profileLoading} className="flex-1">
                {profileLoading ? 'Saving…' : 'Save Changes'}
              </Button>
            </div>
          </form>
        ) : (
          <dl className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-5">
            {[
              ['Name', profile.fullName],
              ['Email', profile.email],
              ['Phone', profile.phone ?? '—'],
              ['Address', profile.address ?? '—'],
            ].map(([label, val]) => (
              <div key={label} className="min-w-0">
                <dt className="text-[10.5px] font-bold text-gray-400 dark:text-zinc-500 uppercase tracking-[0.12em]">
                  {label}
                </dt>
                <dd className="text-sm font-semibold text-gray-900 dark:text-white mt-1.5 break-words">{val}</dd>
              </div>
            ))}
          </dl>
        )}
      </Card>

      {/* Vehicles */}
      <Card padded>
        <div className="flex items-center justify-between mb-5">
          <h3 className="font-semibold text-gray-900 dark:text-white text-[15px]">My Vehicles</h3>
          <Button
            size="sm"
            variant="secondary"
            icon={Plus}
            onClick={() => {
              setShowVehicleForm((v) => !v)
              setVehicleError('')
            }}
          >
            {showVehicleForm ? 'Cancel' : 'Add Vehicle'}
          </Button>
        </div>

        {showVehicleForm && (
          <form
            onSubmit={handleAddVehicle}
            className="mb-5 p-4 bg-gray-50 dark:bg-zinc-800/40 rounded-2xl border border-gray-200/80 dark:border-zinc-800 space-y-3"
          >
            {vehicleError && <Alert tone="error">{vehicleError}</Alert>}
            <Field label="Vehicle Number" required>
              <Input
                type="text" value={vehicleForm.vehicleNumber}
                onChange={(e) => setVehicleForm((v) => ({ ...v, vehicleNumber: e.target.value }))}
                required placeholder="BA 1 CHA 1234"
              />
            </Field>
            <div className="grid grid-cols-3 gap-3">
              {[['make', 'Make', 'Toyota'], ['model', 'Model', 'Hilux']].map(([field, label, ph]) => (
                <Field key={field} label={label}>
                  <Input
                    type="text" value={vehicleForm[field]}
                    onChange={(e) => setVehicleForm((v) => ({ ...v, [field]: e.target.value }))}
                    placeholder={ph}
                  />
                </Field>
              ))}
              <Field label="Year">
                <Input
                  type="number" value={vehicleForm.year}
                  onChange={(e) => setVehicleForm((v) => ({ ...v, year: e.target.value }))}
                  placeholder="2019" min={1980} max={2100}
                />
              </Field>
            </div>
            <Button type="submit" loading={vehicleLoading} className="w-full">
              {vehicleLoading ? 'Adding…' : 'Add Vehicle'}
            </Button>
          </form>
        )}

        {profile.vehicles.length === 0 ? (
          <EmptyState icon={Car} title="No vehicles registered yet" description="Add a vehicle to speed up service bookings." />
        ) : (
          <div className="space-y-2.5">
            {profile.vehicles.map((v, i) => (
              <div
                key={v.id}
                className="flex items-center justify-between p-4 bg-gray-50 dark:bg-zinc-800/50 rounded-2xl hover:bg-gray-100/70 dark:hover:bg-zinc-800 transition-colors"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className={`relative w-12 h-12 rounded-xl overflow-hidden flex-shrink-0 ${v.imageUrl ? 'bg-gray-200 dark:bg-zinc-700' : CAR_COLORS[i % CAR_COLORS.length]} flex items-center justify-center`}>
                    {v.imageUrl ? (
                      <img
                        src={v.imageUrl} alt={v.vehicleNumber}
                        className="w-full h-full object-cover"
                        onError={(e) => { e.currentTarget.style.display = 'none' }}
                      />
                    ) : (
                      <Car className="w-5 h-5 text-white" strokeWidth={2} />
                    )}
                    {uploadingVehicleId === v.id && (
                      <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                        <span className="w-4 h-4 rounded-full border-2 border-white/40 border-t-white animate-spin" />
                      </div>
                    )}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-bold text-gray-900 dark:text-white">{v.vehicleNumber}</p>
                    <p className="text-xs text-gray-400 dark:text-zinc-500 mt-0.5">
                      {[v.make, v.model, v.year].filter(Boolean).join(' · ') || 'No details'}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-1 flex-shrink-0">
                  <label
                    className="p-2 text-gray-400 dark:text-zinc-500 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded-lg transition-colors cursor-pointer"
                    aria-label="Upload vehicle photo"
                    title="Upload photo"
                  >
                    <Camera className="w-4 h-4" />
                    <input
                      type="file" className="hidden" accept="image/jpeg,image/png,image/webp"
                      onChange={(e) => handleVehicleImage(v.id, e.target.files?.[0])}
                    />
                  </label>
                  <button
                    onClick={() => handleDeleteVehicle(v.id)}
                    aria-label="Remove vehicle"
                    className="p-2 text-gray-400 dark:text-zinc-600 hover:text-red-500 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Quick actions — full-width action bar */}
      <Card padded>
        <h3 className="font-semibold text-gray-900 dark:text-white text-[15px] mb-4">Quick Actions</h3>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {[
            { to: '/customer/catalog', label: 'Browse Parts', desc: 'Explore the parts catalog', icon: Package },
            { to: '/customer/appointments', label: 'Book Appointment', desc: 'Schedule a service visit', icon: Calendar },
            { to: '/customer/part-requests', label: 'Request a Part', desc: 'Ask for an out-of-stock part', icon: Wrench },
            { to: '/customer/reviews', label: 'Leave a Review', desc: 'Share your experience', icon: Star },
          ].map(({ to, label, desc, icon: Icon }) => (
            <Link
              key={to}
              to={to}
              className="group flex flex-col gap-3 p-4 rounded-2xl bg-gray-50 dark:bg-zinc-800/50 ring-1 ring-transparent hover:bg-gray-100 dark:hover:bg-zinc-800 hover:ring-indigo-200 dark:hover:ring-indigo-500/30 transition-all"
            >
              <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center">
                <Icon className="w-5 h-5 text-white" strokeWidth={2} />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-gray-900 dark:text-white">{label}</p>
                <p className="text-xs text-gray-400 dark:text-zinc-500 mt-0.5">{desc}</p>
              </div>
            </Link>
          ))}
        </div>
      </Card>
    </div>
  )
}
