import { useCallback, useRef, useState } from 'react'
import { Sidebar } from '../components/navigation/Sidebar'
import { LedgersTabs, Breadcrumbs } from '../components/navigation/LedgersTabs'
import { RegisterGrid, type RegisterGridHandle } from '../components/grid/RegisterGrid'
import { RegisterSearch } from '../components/filters/RegisterSearch'
import { registerTransactions } from '../data/registerData'
import type { RegisterTransaction } from '../data/registerData'
import type { ActiveFilter } from '../lib/registerSearch'

function ChevronDownIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M6 9l6 6 6-6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function RegisterToolbarActions({
  selectedCount,
  onResetSelection,
}: {
  selectedCount: number
  onResetSelection: () => void
}) {
  const updateLabel =
    selectedCount > 0
      ? `Update ${selectedCount} Transaction${selectedCount === 1 ? '' : 's'}`
      : 'Update Transactions'

  return (
    <>
      <button
        type="button"
        className="flex h-9 items-center gap-1.5 rounded border border-primary bg-white px-3 text-xs font-medium text-primary hover:bg-primary-light"
      >
        <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
          <circle cx="12" cy="12" r="3" />
        </svg>
        Saved Views
        <ChevronDownIcon className="h-3.5 w-3.5" />
      </button>
      <button
        type="button"
        className="h-9 rounded bg-primary px-3 text-xs font-medium text-white hover:bg-primary-dark"
      >
        {updateLabel}
      </button>
      {selectedCount > 0 && (
        <button
          type="button"
          onClick={onResetSelection}
          className="text-xs font-medium text-primary hover:text-primary-dark"
        >
          Reset Selection
        </button>
      )}
      <button
        type="button"
        className="flex h-9 items-center gap-1 rounded border border-gray-300 bg-white px-2.5 text-gray-500 hover:bg-gray-50"
        aria-label="Export"
      >
        <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3" />
        </svg>
        <ChevronDownIcon className="h-3.5 w-3.5" />
      </button>
    </>
  )
}

function RegisterToolbar({
  filters,
  onFiltersChange,
  transactions,
  selectedCount,
  onResetSelection,
}: {
  filters: ActiveFilter[]
  onFiltersChange: (filters: ActiveFilter[]) => void
  transactions: RegisterTransaction[]
  selectedCount: number
  onResetSelection: () => void
}) {
  return (
    <div className="shrink-0 bg-white">
      <div className="content-gutter-x py-2.5">
        <Breadcrumbs />
      </div>

      <div className="content-gutter-x border-t border-gray-100 py-3">
        <RegisterSearch
          filters={filters}
          onFiltersChange={onFiltersChange}
          transactions={transactions}
          actions={
            <RegisterToolbarActions
              selectedCount={selectedCount}
              onResetSelection={onResetSelection}
            />
          }
        />
      </div>
    </div>
  )
}

function AppFooter() {
  return (
    <footer className="flex shrink-0 items-center justify-between border-t border-gray-200 bg-white px-6 py-2 text-[11px] text-gray-400">
      <span>© 2026 SumIt Software, Inc.</span>
      <div className="flex items-center gap-4">
        <span>v 6ab09c0</span>
        <a href="#" className="hover:text-gray-600">
          Privacy Policy
        </a>
        <a href="#" className="hover:text-gray-600">
          Terms of Service
        </a>
      </div>
    </footer>
  )
}

export function AppShell() {
  const gridRef = useRef<RegisterGridHandle>(null)
  const [filters, setFilters] = useState<ActiveFilter[]>([])
  const [transactions, setTransactions] = useState<RegisterTransaction[]>(registerTransactions)
  const [selectedCount, setSelectedCount] = useState(0)

  const handleResetSelection = useCallback(() => {
    gridRef.current?.resetSelection()
  }, [])

  return (
    <div className="flex h-full">
      <Sidebar />

      <div className="flex min-w-0 flex-1 flex-col bg-white">
        <header className="content-gutter-x flex shrink-0 items-center justify-between border-b border-gray-200 bg-white">
          <LedgersTabs />
          <button
            type="button"
            className="rounded bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary-dark"
          >
            New Journal Entry
          </button>
        </header>
        <RegisterToolbar
          filters={filters}
          onFiltersChange={setFilters}
          transactions={transactions}
          selectedCount={selectedCount}
          onResetSelection={handleResetSelection}
        />

        <main className="min-h-0 flex-1 bg-white px-3">
          <RegisterGrid
            ref={gridRef}
            filters={filters}
            transactions={transactions}
            onTransactionsChange={setTransactions}
            onSelectionCountChange={setSelectedCount}
          />
        </main>

        <AppFooter />
      </div>
    </div>
  )
}
