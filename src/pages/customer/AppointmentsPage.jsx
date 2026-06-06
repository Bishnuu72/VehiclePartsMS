import { useState, useEffect } from 'react'
import { appointmentsApi } from '../../api/appointmentsApi'
import { useCustomerProfile } from '../../hooks/useCustomerProfile'
import { formatDate } from '../../utils/formatters'
import { Calendar, Plus, Pencil, X, Trash2 } from 'lucide-react'
import { PageHeader } from '../../components/ui/PageHeader'
import { Button } from '../../components/ui/Button'
import { Card } from '../../components/ui/Card'
import { Badge } from '../../components/ui/Badge'
import { Alert } from '../../components/ui/Alert'
import { EmptyState } from '../../components/ui/EmptyState'
import { PageLoader } from '../../components/ui/Spinner'
import { ConfirmDialog } from '../../components/ui/Modal'
import { Field, Select, Textarea, Input } from '../../components/ui/Field'

const STATUS_TONE = {
  Pending: 'warning',
  Confirmed: 'info',
  Completed: 'success',
  Cancelled: 'danger',
}
// AppointmentStatus enum: Pending=0, Confirmed=1, Completed=2, Cancelled=3
const STATUS_NUM = { Pending: 0, Confirmed: 1, Completed: 2, Cancelled: 3 }
const EMPTY_FORM = { vehicleId: '', appointmentDate: '', notes: '' }

function toLocalInput(iso) {
  const d = new Date(iso)
  const off = d.getTimezoneOffset()
  return new Date(d.getTime() - off * 60000).toISOString().slice(0, 16)
}

export default function AppointmentsPage() {
  const { profile, loading: profileLoading, error: profileError } = useCustomerProfile()

  const [appointments, setAppointments] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [form, setForm] = useState(EMPTY_FORM)
  const [formLoading, setFormLoading] = useState(false)
  const [formError, setFormError] = useState('')
  const [cancelAppt, setCancelAppt] = useState(null)
  const [deleteId, setDeleteId] = useState(null)
  const [acting, setActing] = useState(false)

  useEffect(() => { fetchAppointments() }, [])

  async function fetchAppointments() {
    setLoading(true)
    try {
      const { data } = await appointmentsApi.getAll()
      setAppointments(data)
    } catch {
      setError('Failed to load appointments.')
    } finally {
      setLoading(false)
    }
  }

  function openCreate() {
    setEditingId(null)
    setForm(EMPTY_FORM)
    setFormError('')
    setShowForm((v) => !v)
  }

  function openEdit(appt) {
    setEditingId(appt.id)
    setForm({
      vehicleId: appt.vehicleId ? String(appt.vehicleId) : '',
      appointmentDate: toLocalInput(appt.appointmentDate),
      notes: appt.notes ?? '',
    })
    setFormError('')
    setShowForm(true)
  }

  function closeForm() {
    setShowForm(false)
    setEditingId(null)
    setForm(EMPTY_FORM)
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (!profile) return
    setFormError('')
    setFormLoading(true)
    try {
      if (editingId) {
        const current = appointments.find((a) => a.id === editingId)
        await appointmentsApi.update(editingId, {
          vehicleId: form.vehicleId ? parseInt(form.vehicleId, 10) : null,
          appointmentDate: new Date(form.appointmentDate).toISOString(),
          notes: form.notes || null,
          status: STATUS_NUM[current?.status] ?? 0,
        })
      } else {
        await appointmentsApi.create({
          customerProfileId: profile.id,
          vehicleId: form.vehicleId ? parseInt(form.vehicleId, 10) : null,
          appointmentDate: new Date(form.appointmentDate).toISOString(),
          notes: form.notes || null,
        })
      }
      closeForm()
      fetchAppointments()
    } catch (err) {
      setFormError(err.response?.data?.message || 'Failed to save appointment.')
    } finally {
      setFormLoading(false)
    }
  }

  async function handleCancel() {
    if (!cancelAppt) return
    setActing(true)
    try {
      await appointmentsApi.update(cancelAppt.id, {
        vehicleId: cancelAppt.vehicleId ?? null,
        appointmentDate: new Date(cancelAppt.appointmentDate).toISOString(),
        notes: cancelAppt.notes || null,
        status: STATUS_NUM.Cancelled,
      })
      setCancelAppt(null)
      fetchAppointments()
    } catch {
      setError('Failed to cancel appointment.')
      setCancelAppt(null)
    } finally {
      setActing(false)
    }
  }

  async function handleDelete() {
    if (!deleteId) return
    setActing(true)
    try {
      await appointmentsApi.delete(deleteId)
      setDeleteId(null)
      fetchAppointments()
    } catch {
      setError('Failed to delete appointment.')
      setDeleteId(null)
    } finally {
      setActing(false)
    }
  }

  const myAppointments = profile
    ? appointments.filter((a) => a.customerProfileId === profile.id)
    : []

  if (profileLoading) return <PageLoader />
  if (profileError) return <Alert tone="error">{profileError}</Alert>

  return (
    <div className="max-w-2xl space-y-6 animate-fade-in-up">
      <PageHeader title="Appointments" description="Book and track your service appointments.">
        <Button variant="primary" icon={Plus} onClick={openCreate}>
          {showForm && !editingId ? 'Close' : 'Book Appointment'}
        </Button>
      </PageHeader>

      {error && <Alert tone="error">{error}</Alert>}

      {showForm && (
        <Card padded>
          <h3 className="text-[15px] font-semibold text-gray-900 dark:text-white mb-5">
            {editingId ? 'Edit Appointment' : 'New Appointment'}
          </h3>
          {formError && <Alert tone="error" className="mb-4">{formError}</Alert>}
          <form onSubmit={handleSubmit} className="space-y-4">
            <Field label="Vehicle">
              <Select value={form.vehicleId} onChange={(e) => setForm((f) => ({ ...f, vehicleId: e.target.value }))}>
                <option value="">No specific vehicle</option>
                {profile?.vehicles.map((v) => (
                  <option key={v.id} value={v.id}>
                    {v.vehicleNumber}{v.make ? ` — ${v.make} ${v.model ?? ''}` : ''}
                  </option>
                ))}
              </Select>
            </Field>
            <Field label="Date & Time" required>
              <Input
                type="datetime-local" value={form.appointmentDate}
                onChange={(e) => setForm((f) => ({ ...f, appointmentDate: e.target.value }))}
                required min={new Date().toISOString().slice(0, 16)}
              />
            </Field>
            <Field label="Notes">
              <Textarea
                value={form.notes} onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
                rows={3} placeholder="Describe the issue or service needed…"
              />
            </Field>
            <div className="flex gap-3 pt-1">
              <button type="button" onClick={closeForm} className="flex-1 py-2.5 border border-gray-200 dark:border-zinc-700 text-gray-700 dark:text-zinc-300 text-sm font-semibold rounded-xl hover:bg-gray-50 dark:hover:bg-zinc-800 transition-colors">
                Cancel
              </button>
              <Button type="submit" loading={formLoading} className="flex-1">
                {formLoading ? 'Saving…' : editingId ? 'Save Changes' : 'Confirm Booking'}
              </Button>
            </div>
          </form>
        </Card>
      )}

      <div className="space-y-3">
        {loading ? (
          <PageLoader label="Loading appointments…" />
        ) : myAppointments.length === 0 ? (
          <Card>
            <EmptyState icon={Calendar} title="No appointments booked yet" description="Book your first service appointment above." />
          </Card>
        ) : (
          myAppointments.map((appt) => {
            const editable = appt.status === 'Pending' || appt.status === 'Confirmed'
            return (
              <Card key={appt.id} className="p-4">
                <div className="flex justify-between items-start gap-4">
                  <div className="flex items-start gap-3 min-w-0">
                    <div className="w-9 h-9 rounded-xl bg-indigo-600 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Calendar className="w-4 h-4 text-white" strokeWidth={2} />
                    </div>
                    <div className="min-w-0">
                      <p className="font-semibold text-gray-900 dark:text-white text-sm">{formatDate(appt.appointmentDate)}</p>
                      <p className="text-xs text-gray-500 dark:text-zinc-400 mt-0.5">{appt.vehicleNumber ?? 'No vehicle specified'}</p>
                      {appt.notes && <p className="text-xs text-gray-400 dark:text-zinc-500 mt-1 italic">"{appt.notes}"</p>}
                    </div>
                  </div>
                  <Badge tone={STATUS_TONE[appt.status] ?? 'neutral'} className="flex-shrink-0">{appt.status}</Badge>
                </div>
                <div className="flex items-center justify-end gap-2 mt-3 pt-3 border-t border-gray-100 dark:border-zinc-800">
                  {editable && (
                    <>
                      <Button size="sm" variant="secondary" icon={Pencil} onClick={() => openEdit(appt)}>Edit</Button>
                      <Button size="sm" variant="dangerSoft" icon={X} onClick={() => setCancelAppt(appt)}>Cancel</Button>
                    </>
                  )}
                  <Button size="sm" variant="ghost" icon={Trash2} onClick={() => setDeleteId(appt.id)}>Delete</Button>
                </div>
              </Card>
            )
          })
        )}
      </div>

      <ConfirmDialog
        open={!!cancelAppt}
        onClose={() => setCancelAppt(null)}
        onConfirm={handleCancel}
        loading={acting}
        title="Cancel this appointment?"
        description="The appointment will be marked as cancelled. You can still book a new one."
        confirmLabel="Cancel Appointment"
      />
      <ConfirmDialog
        open={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDelete}
        loading={acting}
        title="Delete this appointment?"
        description="This permanently removes the appointment from your history. This cannot be undone."
        confirmLabel="Delete"
      />
    </div>
  )
}
