import { NavLink } from 'react-router-dom'
import { Package, LogOut, Sun, Moon, KeyRound } from 'lucide-react'
import { cn } from '../../lib/cn'

export function SidebarContent({ cfg, user, theme, onToggleTheme, onLogout, onNavigate, onChangePassword, avatarUrl }) {
  const name = user?.email?.split('@')[0] ?? cfg.roleTag
  const initials = name.slice(0, 2).toUpperCase()

  return (
    <div className={cn('flex flex-col h-full', cfg.sidebarBg)}>
      {/* Brand */}
      <div className="px-5 pt-7 pb-5">
        <div className="flex items-center gap-3">
          <div className={cn('w-9 h-9 rounded-[10px] flex items-center justify-center flex-shrink-0', cfg.brandTile)}>
            <Package className="w-[17px] h-[17px]" strokeWidth={2.5} />
          </div>
          <div className="min-w-0">
            <p className={cn('text-[13px] font-bold tracking-tight leading-none truncate', cfg.brandText)}>VehiclePartsMS</p>
            <p className={cn('text-[10px] font-semibold uppercase tracking-[0.18em] mt-1', cfg.brandSub)}>{cfg.roleTag}</p>
          </div>
        </div>
      </div>

      <div className={cn('mx-5 h-px mb-3', cfg.divider)} />

      {/* Nav */}
      <nav className="flex-1 px-3 space-y-[2px] overflow-y-auto pb-3">
        {cfg.nav.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            onClick={onNavigate}
            className={({ isActive }) =>
              cn(
                'relative flex items-center gap-3 px-3 py-[10px] rounded-xl text-[13px] font-medium transition-all duration-150 group overflow-hidden',
                isActive ? cfg.navActive : cfg.navIdle,
              )
            }
          >
            {({ isActive }) => (
              <>
                {isActive && (
                  <span className={cn('absolute inset-y-0 left-0 w-[3px] rounded-r-full', cfg.indicator)} />
                )}
                <Icon
                  className={cn('w-[15px] h-[15px] flex-shrink-0 transition-colors', isActive ? cfg.navIconActive : cfg.navIconIdle)}
                  strokeWidth={isActive ? 2.5 : 2}
                />
                <span className="flex-1 pl-0.5">{label}</span>
              </>
            )}
          </NavLink>
        ))}
      </nav>

      <div className={cn('mx-5 h-px', cfg.divider)} />

      {/* Bottom */}
      <div className="px-3 py-4 space-y-1">
        <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl mb-1">
          <div className={cn('w-8 h-8 rounded-full overflow-hidden flex items-center justify-center flex-shrink-0 ring-[1.5px]', cfg.avatar)}>
            {avatarUrl ? (
              <img
                src={avatarUrl} alt={name}
                className="w-full h-full object-cover"
                onError={(e) => { e.currentTarget.style.display = 'none' }}
              />
            ) : (
              <span className="text-[11px] font-bold">{initials}</span>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <p className={cn('text-[12px] font-semibold capitalize truncate', cfg.userName)}>{name}</p>
            <p className={cn('text-[10px] truncate', cfg.userMail)}>{user?.email}</p>
          </div>
        </div>

        <button
          onClick={onToggleTheme}
          className={cn('w-full flex items-center gap-3 px-3 py-[10px] rounded-xl text-[13px] font-medium transition-all', cfg.bottomText)}
        >
          {theme === 'dark'
            ? <Sun className="w-[15px] h-[15px]" strokeWidth={2} />
            : <Moon className="w-[15px] h-[15px]" strokeWidth={2} />}
          <span>{theme === 'dark' ? 'Light Mode' : 'Dark Mode'}</span>
        </button>

        <button
          onClick={onChangePassword}
          className={cn('w-full flex items-center gap-3 px-3 py-[10px] rounded-xl text-[13px] font-medium transition-all', cfg.bottomText)}
        >
          <KeyRound className="w-[15px] h-[15px]" strokeWidth={2} />
          <span>Change Password</span>
        </button>

        <button
          onClick={onLogout}
          className={cn('w-full flex items-center gap-3 px-3 py-[10px] rounded-xl text-[13px] font-medium transition-all', cfg.signOut)}
        >
          <LogOut className="w-[15px] h-[15px]" strokeWidth={2} />
          <span>Sign Out</span>
        </button>
      </div>
    </div>
  )
}
