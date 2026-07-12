import clsx from 'clsx'
import { LEDGERS_TABS } from '../../data/registerData'

export function LedgersTabs() {
  return (
    <div className="flex items-center">
      {LEDGERS_TABS.map((tab, index) => (
        <button
          key={tab}
          type="button"
          className={clsx(
            'relative py-3 text-[13px] font-medium transition-colors',
            index === 0 ? 'pr-4' : 'px-4',
            tab === 'Register'
              ? 'text-primary after:absolute after:bottom-0 after:left-0 after:h-[2px] after:w-full after:bg-primary'
              : 'text-gray-500 hover:text-gray-700',
          )}
        >
          {tab}
        </button>
      ))}
    </div>
  )
}

export function Breadcrumbs() {
  return (
    <div className="flex items-center gap-1.5 text-xs text-gray-500">
      <span>Ledgers</span>
      <svg className="h-3 w-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M9 18l6-6-6-6" />
      </svg>
      <span className="font-medium text-gray-700">Register</span>
    </div>
  )
}
