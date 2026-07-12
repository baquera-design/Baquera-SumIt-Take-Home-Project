import clsx from 'clsx'
import { SIDEBAR_NAV } from '../../data/registerData'

function NavIcon({ name }: { name: string }) {
  const cls = 'h-[18px] w-[18px] shrink-0 opacity-90'

  switch (name) {
    case 'search':
      return (
        <svg className={cls} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="11" cy="11" r="7" />
          <path d="M20 20l-3-3" />
        </svg>
      )
    case 'entities':
      return (
        <svg className={cls} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <rect x="3" y="3" width="7" height="7" rx="1" />
          <rect x="14" y="3" width="7" height="7" rx="1" />
          <rect x="3" y="14" width="7" height="7" rx="1" />
          <rect x="14" y="14" width="7" height="7" rx="1" />
        </svg>
      )
    case 'ledgers':
      return (
        <svg className={cls} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M4 19.5A2.5 2.5 0 016.5 17H20" />
          <path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z" />
        </svg>
      )
    case 'reconciliation':
      return (
        <svg className={cls} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M16 3h5v5M4 20L21 3M21 16v5h-5M15 15l6 6M4 4l5 5" />
        </svg>
      )
    case 'budgets':
      return (
        <svg className={cls} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M12 2v20M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6" />
        </svg>
      )
    case 'reports':
      return (
        <svg className={cls} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M18 20V10M12 20V4M6 20v-6" />
        </svg>
      )
    case 'settings':
      return (
        <svg className={cls} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="12" r="3" />
          <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
        </svg>
      )
    case 'help':
      return (
        <svg className={cls} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="12" r="10" />
          <path d="M9.09 9a3 3 0 015.83 1c0 2-3 3-3 3M12 17h.01" />
        </svg>
      )
    default:
      return null
  }
}

function SumItLogo() {
  return (
    <div className="flex items-center gap-2 px-4 py-5">
      <svg width="28" height="28" viewBox="0 0 32 32" fill="none">
        <rect width="32" height="32" rx="6" fill="#ffffff" fillOpacity="0.12" />
        <path
          d="M6 20c3-6 8-10 14-10 2.5 0 4.5.5 6 1.5"
          stroke="#5ec4c4"
          strokeWidth="2.5"
          strokeLinecap="round"
        />
        <path
          d="M6 24c4-4 9-7 15-7 2 0 3.8.4 5.2 1.2"
          stroke="#ffffff"
          strokeWidth="2"
          strokeLinecap="round"
          opacity="0.7"
        />
      </svg>
      <span className="text-xl font-semibold tracking-tight text-white">SumIt</span>
    </div>
  )
}

export function Sidebar() {
  return (
    <aside className="flex w-[220px] shrink-0 flex-col bg-sidebar text-white">
      <SumItLogo />

      <div className="mx-4 mb-3">
        <span className="inline-block rounded bg-dev-badge px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white">
          Development Environment
        </span>
      </div>

      <div className="mx-4 mb-4">
        <div className="relative">
          <svg
            className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-white/40"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <circle cx="11" cy="11" r="7" />
            <path d="M20 20l-3-3" />
          </svg>
          <input
            type="search"
            placeholder="Search..."
            className="h-8 w-full rounded border border-white/10 bg-white/10 pl-8 pr-3 text-xs text-white placeholder:text-white/40 outline-none focus:border-white/25 focus:bg-white/15"
          />
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto px-2">
        {SIDEBAR_NAV.filter((item) => item.id !== 'search').map((item) => (
          <div key={item.id}>
            <button
              type="button"
              className={clsx(
                'flex w-full items-center gap-2.5 rounded px-3 py-2 text-[13px] font-medium transition-colors',
                item.id === 'ledgers'
                  ? 'bg-sidebar-active text-white'
                  : 'text-white/80 hover:bg-sidebar-hover hover:text-white',
              )}
            >
              {'icon' in item && <NavIcon name={item.icon} />}
              <span className="flex-1 text-left">{item.label}</span>
              {'children' in item && (
                <svg className="h-3.5 w-3.5 opacity-70" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M6 9l6 6 6-6" />
                </svg>
              )}
            </button>

            {'children' in item && (
              <div className="ml-2 mt-0.5 space-y-0.5 border-l border-white/10 pl-2">
                {item.children.map((child) => (
                  <button
                    key={child.id}
                    type="button"
                    className={clsx(
                      'relative flex w-full items-center rounded px-3 py-1.5 text-left text-[13px] transition-colors',
                      'active' in child && child.active
                        ? 'bg-sidebar-active font-medium text-white'
                        : 'text-white/70 hover:bg-sidebar-hover hover:text-white',
                    )}
                  >
                    {'active' in child && child.active && (
                      <span className="absolute -left-[9px] top-1/2 h-5 w-[3px] -translate-y-1/2 rounded-full bg-white" />
                    )}
                    {child.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        ))}
      </nav>

      <div className="border-t border-white/10 p-4">
        <button
          type="button"
          className="flex w-full items-center justify-between text-left"
        >
          <div>
            <div className="text-sm font-medium text-white">Admin User</div>
            <div className="text-xs text-white/60">New Demo Org</div>
          </div>
          <svg className="h-4 w-4 text-white/60" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M6 9l6 6 6-6" />
          </svg>
        </button>
      </div>
    </aside>
  )
}
