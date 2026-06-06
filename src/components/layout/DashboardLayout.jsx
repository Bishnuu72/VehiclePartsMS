import { useState, useEffect } from 'react'
import { Outlet, useNavigate } from 'react-router-dom'
import { Menu, X } from 'lucide-react'
import { useAuth } from '../../hooks/useAuth'
import { useTheme } from '../../context/ThemeContext'
import { cn } from '../../lib/cn'
import { SidebarContent } from './Sidebar'
import ChatWidget from '../ChatWidget'
import { ChangePasswordModal } from '../ChangePasswordModal'
import { usersApi } from '../../api/usersApi'

export default function DashboardLayout({ cfg }) {
  const { user, logout } = useAuth()
  const { theme, toggle } = useTheme()
  const navigate = useNavigate()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [pwOpen, setPwOpen] = useState(false)
  const [avatarUrl, setAvatarUrl] = useState(null)

  useEffect(() => {
    let active = true
    usersApi.getMe()
      .then(({ data }) => { if (active) setAvatarUrl(data.profilePictureUrl) })
      .catch(() => {})
    return () => { active = false }
  }, [])

  function handleLogout() {
    logout()
    navigate('/login')
  }

  const sidebarProps = {
    cfg,
    user,
    theme,
    avatarUrl,
    onToggleTheme: toggle,
    onLogout: handleLogout,
    onChangePassword: () => {
      setMobileOpen(false)
      setPwOpen(true)
    },
  }

  return (
    <div className="flex h-screen bg-[#f2f2f7] dark:bg-[#080808] overflow-hidden">
      {/* Desktop sidebar */}
      <aside className={cn('hidden lg:flex w-[260px] flex-shrink-0 flex-col h-full border-r', cfg.asideBorder)}>
        <SidebarContent {...sidebarProps} />
      </aside>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setMobileOpen(false)}
          />
          <aside className="relative w-[260px] h-full flex flex-col animate-[modalIn_160ms_ease-out]">
            <SidebarContent {...sidebarProps} onNavigate={() => setMobileOpen(false)} />
          </aside>
        </div>
      )}

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <header className="h-14 flex-shrink-0 flex items-center justify-between px-4 sm:px-8 border-b border-black/[0.06] dark:border-white/[0.06] bg-[#f2f2f7]/80 dark:bg-[#080808]/80 backdrop-blur-xl">
          <button
            onClick={() => setMobileOpen((v) => !v)}
            aria-label="Toggle menu"
            className="lg:hidden p-2 -ml-2 rounded-lg text-gray-500 dark:text-zinc-400 hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
          <div className="flex items-center gap-2.5 ml-auto">
            <span className={cn('w-1.5 h-1.5 rounded-full ring-2', cfg.statusDot)} />
            <span className="text-[11px] font-bold text-gray-400 dark:text-zinc-600 uppercase tracking-[0.14em]">
              {cfg.label}
            </span>
          </div>
        </header>
        <main className="flex-1 overflow-auto">
          <div className={cn('p-5 sm:p-8 w-full mx-auto', cfg.contentMax)}>
            <Outlet />
          </div>
        </main>
      </div>

      <ChatWidget />
      <ChangePasswordModal open={pwOpen} onClose={() => setPwOpen(false)} />
    </div>
  )
}
