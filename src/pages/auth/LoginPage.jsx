import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { authApi } from '../../api/authApi'
import { useAuth } from '../../hooks/useAuth'
import { useTheme } from '../../context/ThemeContext'
import { Package, Sun, Moon, Eye, EyeOff, ArrowRight, ShieldCheck } from 'lucide-react'
import { Field, Input, Label } from '../../components/ui/Field'
import { Button } from '../../components/ui/Button'
import { Alert } from '../../components/ui/Alert'
import { AuthBrandPanel } from './AuthBrandPanel'

export default function LoginPage() {
  const { login } = useAuth()
  const { theme, toggle } = useTheme()
  const navigate = useNavigate()
  const [form, setForm] = useState({ email: '', password: '' })
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  function handleChange(e) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const { data } = await authApi.login(form)
      login({ email: data.email, role: data.role, expiry: data.expiry }, data.token)
      if (data.role === 'Admin') navigate('/admin/dashboard')
      else if (data.role === 'Staff') navigate('/staff/dashboard')
      else navigate('/customer/dashboard')
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid email or password.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex bg-white dark:bg-[#080808]">
      <AuthBrandPanel
        eyebrow="Vehicle Parts Management"
        title={<>Manage inventory<br />with confidence.</>}
        subtitle="Inventory, invoicing and customer management — in one fast, reliable system."
        highlights={[
          'Real-time stock & low-inventory alerts',
          'Sales, purchase & credit tracking',
          'Role-based access for staff & customers',
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
          <div className="w-full max-w-[400px]">
            <div className="mb-8">
              <h1 className="text-[2rem] font-bold text-gray-900 dark:text-white tracking-tight">
                Welcome back
              </h1>
              <p className="text-gray-500 dark:text-zinc-500 text-sm mt-2">
                Sign in to access your portal.
              </p>
            </div>

            {error && <Alert tone="error" className="mb-6">{error}</Alert>}

            <form onSubmit={handleSubmit} className="space-y-5">
              <Field label="Email address" htmlFor="email" required>
                <Input
                  id="email" type="email" name="email" value={form.email}
                  onChange={handleChange} required autoComplete="email"
                  placeholder="you@example.com"
                />
              </Field>

              <div>
                <Label htmlFor="password" required>Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    name="password" value={form.password}
                    onChange={handleChange} required autoComplete="current-password"
                    placeholder="Enter your password"
                    className="pr-11"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700 dark:text-zinc-500 dark:hover:text-zinc-300 transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <Button type="submit" loading={loading} size="lg" className="w-full">
                {!loading && <>Sign In <ArrowRight className="w-4 h-4" /></>}
                {loading && 'Signing in…'}
              </Button>
            </form>

            <p className="mt-7 text-center text-sm text-gray-500 dark:text-zinc-500">
              New customer?{' '}
              <Link
                to="/register"
                className="font-semibold text-gray-900 dark:text-white hover:underline underline-offset-2"
              >
                Create an account
              </Link>
            </p>

            <div className="mt-8 flex items-center justify-center gap-2 text-[11px] text-gray-400 dark:text-zinc-600">
              <ShieldCheck className="w-3.5 h-3.5" strokeWidth={2} />
              Secured with role-based access control
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
