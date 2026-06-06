// Dependency-free SVG charts — no chart library, fully themeable.

// Donut with center total + legend. data: [{ label, value, color }]
export function Donut({ data, size = 160, thickness = 18, centerLabel }) {
  const total = data.reduce((s, d) => s + (d.value || 0), 0)
  const r = (size - thickness) / 2
  const c = 2 * Math.PI * r
  let offset = 0

  return (
    <div className="flex items-center gap-6">
      <div className="relative flex-shrink-0" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="-rotate-90">
          <circle
            cx={size / 2} cy={size / 2} r={r} fill="none"
            strokeWidth={thickness}
            className="stroke-gray-100 dark:stroke-zinc-800"
          />
          {total > 0 && data.map((d) => {
            const len = (d.value / total) * c
            const seg = (
              <circle
                key={d.label}
                cx={size / 2} cy={size / 2} r={r} fill="none"
                stroke={d.color} strokeWidth={thickness}
                strokeDasharray={`${len} ${c - len}`}
                strokeDashoffset={-offset}
                strokeLinecap="butt"
              />
            )
            offset += len
            return seg
          })}
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-2xl font-bold text-gray-900 dark:text-white tabular-nums leading-none">{total}</span>
          {centerLabel && (
            <span className="text-[10px] font-medium text-gray-400 dark:text-zinc-500 uppercase tracking-wide mt-1">
              {centerLabel}
            </span>
          )}
        </div>
      </div>
      <div className="space-y-2.5 min-w-0">
        {data.map((d) => (
          <div key={d.label} className="flex items-center gap-2.5">
            <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: d.color }} />
            <span className="text-sm text-gray-600 dark:text-zinc-300 flex-1 min-w-0 truncate">{d.label}</span>
            <span className="text-sm font-bold text-gray-900 dark:text-white tabular-nums">{d.value}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

// Horizontal bars. data: [{ label, value, color }]
export function BarChart({ data, valueFormatter = (v) => v }) {
  const max = Math.max(1, ...data.map((d) => d.value || 0))
  return (
    <div className="space-y-4">
      {data.map((d) => (
        <div key={d.label}>
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-sm text-gray-600 dark:text-zinc-300">{d.label}</span>
            <span className="text-sm font-bold text-gray-900 dark:text-white tabular-nums">
              {valueFormatter(d.value)}
            </span>
          </div>
          <div className="h-2.5 rounded-full bg-gray-100 dark:bg-zinc-800 overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{ width: `${Math.round(((d.value || 0) / max) * 100)}%`, background: d.color }}
            />
          </div>
        </div>
      ))}
    </div>
  )
}
