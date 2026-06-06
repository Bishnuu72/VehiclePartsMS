import { Link } from 'react-router-dom'
import { Package, Check } from 'lucide-react'

// Shared left panel for Login & Register — kept deliberately minimal and
// professional (no heavy gradients), consistent across both auth pages.
export function AuthBrandPanel({ eyebrow, title, subtitle, highlights = [], footer }) {
  return (
    <div className="hidden lg:flex w-[42%] flex-col justify-between p-12 xl:p-14 relative overflow-hidden bg-[#0b0b0c]">
      {/* Subtle grid texture */}
      <div
        className="absolute inset-0 opacity-[0.025] pointer-events-none"
        style={{
          backgroundImage:
            'linear-gradient(rgba(255,255,255,0.9) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.9) 1px, transparent 1px)',
          backgroundSize: '44px 44px',
        }}
      />

      {/* Brand */}
      <Link to="/login" className="relative flex items-center gap-3 w-fit">
        <div className="w-9 h-9 bg-white rounded-[10px] flex items-center justify-center">
          <Package className="w-[18px] h-[18px] text-black" strokeWidth={2.5} />
        </div>
        <span className="text-white font-bold text-[15px] tracking-tight">VehiclePartsMS</span>
      </Link>

      {/* Message */}
      <div className="relative">
        {eyebrow && (
          <p className="text-zinc-500 text-[11px] font-bold uppercase tracking-[0.2em] mb-5">
            {eyebrow}
          </p>
        )}
        <h2 className="text-[2.5rem] font-bold text-white leading-[1.12] tracking-tight">
          {title}
        </h2>
        {subtitle && (
          <p className="mt-5 text-zinc-500 text-[14.5px] leading-relaxed max-w-[340px]">
            {subtitle}
          </p>
        )}

        {highlights.length > 0 && (
          <ul className="mt-9 space-y-3.5">
            {highlights.map((h) => (
              <li key={h} className="flex items-center gap-3">
                <span className="w-5 h-5 rounded-full bg-white/[0.08] border border-white/10 flex items-center justify-center flex-shrink-0">
                  <Check className="w-3 h-3 text-zinc-300" strokeWidth={3} />
                </span>
                <span className="text-zinc-400 text-[13.5px]">{h}</span>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Footer */}
      <p className="relative text-zinc-600 text-xs">
        {footer ?? '© ' + new Date().getFullYear() + ' VehiclePartsMS · Inventory Management System'}
      </p>
    </div>
  )
}
