import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { authApi } from '../../api/authApi'
import { useTheme } from '../../context/ThemeContext'
import { Package, Sun, Moon, ArrowRight, CheckCircle2 } from 'lucide-react'
import { Field, Input } from '../../components/ui/Field'
import { Button } from '../../components/ui/Button'
import { Alert } from '../../components/ui/Alert'
import { AuthBrandPanel } from './AuthBrandPanel'

export default function RegisterPage() {
  const { theme, toggle } = useTheme()
  const navigate = useNavigate()
  const [form, setForm] = useState({ firstName: '', lastName: '', email: '', password: '', confirmPassword: '' })
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [loading, setLoading] = useState(false)

  function handleChange(e) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    if (form.password !== form.confirmPassword) {
      setError('Passwords do not match.')
      return
    }
    setLoading(true)
    try {
      await authApi.register({
        firstName: form.firstName,
        lastName: form.lastName,
        email: form.email,
        password: form.password,
        role: 'Customer',
      })
      setSuccess(true)
      setTimeout(() => navigate('/login'), 2000)
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex bg-white dark:bg-[#080808]">
      <AuthBrandPanel
        eyebrow="Customer Portal"
        title={<>Join thousands of<br />satisfied customers.</>}
        subtitle="Create a free account to manage your service history and parts requests."
        highlights={[
          'Track purchase & service history',
          'Book service appointments online',
          'Request parts that are out of stock',
          'Earn loyalty discounts over time',
        ]}
      />

      {/* Form side */}
      <div className="flex-1 flex flex-col">
        <div className="flex items-center justify-between px-6 sm:px-10 py-6">
          <div className="lg:hidden flex items-center gap-2.5">
            <div className="w-8 h-8 bg-gray-900 dark:bg-white rounded-[9px] flex items-center justify-center">
              <Package className="w-4 h-4 text-white dark:text-gray-900" strokeWidth={2.5} />
            </div>
            <span className="font-bold text-gray-900 dark:text-white text-sm">VehiclePartsMS</span>
          </div>
          <button
            onClick={toggle}
            aria-label="Toggle theme"
            className="ml-auto w-9 h-9 flex items-center justify-center rounded-xl text-gray-400 dark:text-zinc-500 hover:bg-gray-100 dark:hover:bg-zinc-800 transition-colors"
          >
            {theme === 'dark' ? <Sun className="w-[15px] h-[15px]" /> : <Moon className="w-[15px] h-[15px]" />}
          </button>
        </div>

        <div className="flex-1 flex items-center justify-center px-6 sm:px-10 pb-12">
          <div className="w-full max-w-[420px]">
            {success ? (
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-5">
                  <CheckCircle2 className="w-8 h-8 text-white" strokeWidth={2} />
                </div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight">
                  Account created
                </h1>
                <p className="text-gray-500 dark:text-zinc-500 text-sm mt-2">
                  Redirecting you to sign in…
                </p>
              </div>
            ) : (
              <>
                <div className="mb-8">
                  <h1 className="text-[2rem] font-bold text-gray-900 dark:text-white tracking-tight">
                    Create account
                  </h1>
                  <p className="text-gray-500 dark:text-zinc-500 text-sm mt-2">
                    Join as a customer to access self-service features.
                  </p>
                </div>

                {error && <Alert tone="error" className="mb-6">{error}</Alert>}

                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="grid grid-cols-2 gap-4">
                    <Field label="First name" htmlFor="firstName" required>
                      <Input
                        id="firstName" type="text" name="firstName" value={form.firstName}
                        onChange={handleChange} required placeholder="John"
                      />
                    </Field>
                    <Field label="Last name" htmlFor="lastName" required>
                      <Input
                        id="lastName" type="text" name="lastName" value={form.lastName}
                        onChange={handleChange} required placeholder="Doe"
                      />
                    </Field>
                  </div>

                  <Field label="Email" htmlFor="email" required>
                    <Input
                      id="email" type="email" name="email" value={form.email}
                      onChange={handleChange} required autoComplete="email"
                      placeholder="you@example.com"
                    />
                  </Field>

                  <Field label="Password" htmlFor="password" required hint="Minimum 6 characters">
                    <Input
                      id="password" type="password" name="password" value={form.password}
                      onChange={handleChange} required minLength={6}
                      placeholder="Create a password"
                    />
                  </Field>

                  <Field label="Confirm password" htmlFor="confirmPassword" required>
                    <Input
                      id="confirmPassword" type="password" name="confirmPassword"
                      value={form.confirmPassword} onChange={handleChange} required
                      placeholder="Re-enter password"
                    />
                  </Field>

                  <Button type="submit" loading={loading} size="lg" className="w-full">
                    {!loading && <>Create Account <ArrowRight className="w-4 h-4" /></>}
                    {loading && 'Creating account…'}
                  </Button>
                </form>

                <p className="mt-7 text-center text-sm text-gray-500 dark:text-zinc-500">
                  Already have an account?{' '}
                  <Link
                    to="/login"
                    className="font-semibold text-gray-900 dark:text-white hover:underline underline-offset-2"
                  >
                    Sign in
                  </Link>
                </p>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
