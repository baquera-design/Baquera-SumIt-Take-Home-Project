import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent,
  type ReactNode,
} from 'react'
import clsx from 'clsx'
import type { RegisterTransaction } from '../../data/registerData'
import { FilterChip } from './FilterChip'
import {
  buildSearchIndex,
  formatFilterLabel,
  formatComposeSuggestionLabel,
  formatSuggestionCount,
  getTypeSuggestions,
  getValueSuggestionsWithCounts,
  getTransactionsForFieldCompose,
  FIELD_LABELS,
  DATE_CUSTOM_OPTION,
  type ActiveFilter,
  type ComposeField,
} from '../../lib/registerSearch'

interface RegisterSearchProps {
  filters: ActiveFilter[]
  onFiltersChange: (filters: ActiveFilter[]) => void
  transactions: RegisterTransaction[]
  actions?: ReactNode
}

let filterIdCounter = 0

function nextFilterId() {
  filterIdCounter += 1
  return `filter-${filterIdCounter}`
}

function FilterIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <path d="M22 3H2l8 9.46V19l4 2v-8.54L22 3z" />
    </svg>
  )
}

type DropdownItem =
  | { kind: 'type'; field: ComposeField; label: string; hint: string }
  | {
      kind: 'value'
      field: ComposeField
      value: string
      label: string
      hint?: string
    }

export function RegisterSearch({
  filters,
  onFiltersChange,
  transactions,
  actions,
}: RegisterSearchProps) {
  const [query, setQuery] = useState('')
  const [open, setOpen] = useState(false)
  const [showStartHint, setShowStartHint] = useState(true)
  const [hintReady, setHintReady] = useState(false)
  const [highlightIndex, setHighlightIndex] = useState(0)
  const [composeField, setComposeField] = useState<ComposeField | null>(null)
  const [composeValue, setComposeValue] = useState('')
  const [datePickerMode, setDatePickerMode] = useState(false)
  const searchInputRef = useRef<HTMLInputElement>(null)
  const composeInputRef = useRef<HTMLInputElement>(null)
  const datePickerRef = useRef<HTMLInputElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  const index = useMemo(() => buildSearchIndex(transactions), [transactions])
  const isComposing = composeField != null

  const contextTransactions = useMemo(() => {
    if (!isComposing || !composeField) return undefined
    return getTransactionsForFieldCompose(transactions, filters, composeField)
  }, [isComposing, composeField, filters, transactions])

  const dropdownItems = useMemo((): DropdownItem[] => {
    if (isComposing && composeField && contextTransactions) {
      return getValueSuggestionsWithCounts(
        composeField,
        composeValue,
        index,
        filters,
        contextTransactions,
      ).map((suggestion) => ({
        kind: 'value' as const,
        field: composeField,
        value: suggestion.value,
        label: formatComposeSuggestionLabel(composeField, suggestion.value),
        hint:
          suggestion.value === DATE_CUSTOM_OPTION
            ? undefined
            : formatSuggestionCount(suggestion.count),
      }))
    }
    return getTypeSuggestions(query).map((opt) => ({
      kind: 'type' as const,
      field: opt.field as ComposeField,
      label: opt.label,
      hint: opt.hint,
    }))
  }, [isComposing, composeField, composeValue, query, index, filters, contextTransactions])

  const startCompose = useCallback((field: ComposeField) => {
    setComposeField(field)
    setComposeValue('')
    setDatePickerMode(false)
    setQuery('')
    setHighlightIndex(0)
    setOpen(true)
    requestAnimationFrame(() => composeInputRef.current?.focus())
  }, [])

  const cancelCompose = useCallback(() => {
    setComposeField(null)
    setComposeValue('')
    setDatePickerMode(false)
    setHighlightIndex(0)
    requestAnimationFrame(() => searchInputRef.current?.focus())
  }, [])

  const openDatePicker = useCallback(() => {
    setDatePickerMode(true)
    setComposeValue(DATE_CUSTOM_OPTION)
    setOpen(true)
    requestAnimationFrame(() => datePickerRef.current?.showPicker?.())
  }, [])

  const commitValue = useCallback(
    (field: ComposeField, value: string) => {
      const trimmed = value.trim()
      if (!trimmed) return

      const duplicate = filters.some(
        (f) => f.field === field && f.value.toLowerCase() === trimmed.toLowerCase(),
      )
      if (!duplicate) {
        onFiltersChange([
          ...filters,
          {
            id: nextFilterId(),
            field,
            label: formatFilterLabel(field, trimmed),
            value: trimmed,
          },
        ])
      }

      setComposeField(null)
      setComposeValue('')
      setDatePickerMode(false)
      setQuery('')
      setOpen(false)
      setHighlightIndex(0)
      requestAnimationFrame(() => searchInputRef.current?.focus())
    },
    [filters, onFiltersChange],
  )

  const selectDropdownItem = useCallback(
    (item: DropdownItem) => {
      if (item.kind === 'type') {
        startCompose(item.field)
      } else if (item.field === 'date' && item.value === DATE_CUSTOM_OPTION) {
        openDatePicker()
      } else {
        commitValue(item.field, item.value)
      }
    },
    [startCompose, openDatePicker, commitValue],
  )

  const removeFilter = useCallback(
    (id: string) => onFiltersChange(filters.filter((f) => f.id !== id)),
    [filters, onFiltersChange],
  )

  const resetAll = useCallback(() => {
    onFiltersChange([])
    setQuery('')
    cancelCompose()
  }, [onFiltersChange, cancelCompose])

  const dismissStartHint = useCallback(() => {
    setShowStartHint(false)
    setHintReady(false)
  }, [])

  useEffect(() => {
    if (!showStartHint) return

    const timer = window.setTimeout(() => setHintReady(true), 300)
    return () => window.clearTimeout(timer)
  }, [showStartHint])

  useEffect(() => {
    setHighlightIndex(0)
  }, [dropdownItems, composeField, composeValue, query])

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false)
        if (datePickerMode) {
          setDatePickerMode(false)
          setComposeValue('')
        }
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [datePickerMode])

  const handleSearchKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (!open && e.key === 'ArrowDown') {
      setOpen(true)
      return
    }

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault()
        setHighlightIndex((i) => Math.min(i + 1, dropdownItems.length - 1))
        break
      case 'ArrowUp':
        e.preventDefault()
        setHighlightIndex((i) => Math.max(i - 1, 0))
        break
      case 'Enter':
        e.preventDefault()
        if (dropdownItems[highlightIndex]) {
          selectDropdownItem(dropdownItems[highlightIndex])
        }
        break
      case 'Escape':
        setOpen(false)
        break
      case 'Backspace':
        if (!query && filters.length > 0) {
          removeFilter(filters[filters.length - 1]!.id)
        }
        break
    }
  }

  const handleComposeKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault()
        setHighlightIndex((i) => Math.min(i + 1, dropdownItems.length - 1))
        break
      case 'ArrowUp':
        e.preventDefault()
        setHighlightIndex((i) => Math.max(i - 1, 0))
        break
      case 'Enter':
        e.preventDefault()
        if (dropdownItems[highlightIndex]?.kind === 'value') {
          const item = dropdownItems[highlightIndex]
          commitValue(item.field, item.value)
        } else if (composeValue.trim()) {
          commitValue(composeField!, composeValue.trim())
        }
        break
      case 'Escape':
        cancelCompose()
        setOpen(false)
        break
      case 'Backspace':
        if (datePickerMode) {
          e.preventDefault()
          setDatePickerMode(false)
          setComposeValue('')
        } else if (!composeValue) {
          e.preventDefault()
          cancelCompose()
        }
        break
    }
  }

  const showDropdown = open && dropdownItems.length > 0 && !datePickerMode
  const showDatePicker = open && datePickerMode && composeField === 'date'
  const chipLabel = composeField ? FIELD_LABELS[composeField] : ''

  return (
    <div ref={containerRef}>
      <div className="flex items-center gap-3">
        <div className="relative min-w-0 flex-1">
          {showStartHint && hintReady && (
            <div className="search-hint-tooltip-enter absolute bottom-full left-0 z-[60] mb-2.5">
              <div className="relative rounded-lg border border-primary/20 bg-primary px-4 py-3 text-white shadow-lg">
                <span
                  aria-hidden
                  className="absolute -bottom-1.5 left-7 h-3 w-3 rotate-45 border-r border-b border-primary/20 bg-primary"
                />
                <div className="flex items-center gap-3">
                  <span className="rounded bg-white/20 px-2 py-0.5 text-[11px] font-bold uppercase tracking-wider">
                    Demo
                  </span>
                  <span className="text-base font-semibold">Start here</span>
                  <button
                    type="button"
                    onClick={dismissStartHint}
                    className="ml-0.5 rounded p-1 text-white/80 hover:bg-white/15 hover:text-white"
                    aria-label="Dismiss hint"
                  >
                    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M18 6L6 18M6 6l12 12" strokeLinecap="round" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          )}

          <div
            className={clsx(
              'flex min-h-9 items-center gap-1.5 rounded-md border bg-white px-2.5 py-1 transition-shadow',
              'focus-within:border-primary focus-within:ring-1 focus-within:ring-primary',
              open ? 'border-primary ring-1 ring-primary' : 'border-gray-300',
              showStartHint && 'search-hint-bar-pulse',
            )}
            onClick={() => {
              dismissStartHint()
              if (datePickerMode) datePickerRef.current?.focus()
              else if (isComposing) composeInputRef.current?.focus()
              else searchInputRef.current?.focus()
            }}
          >
            <FilterIcon className="h-4 w-4 shrink-0 text-gray-400" />

            {isComposing ? (
              datePickerMode ? (
                <span className="inline-flex w-fit items-center rounded border border-primary/30 bg-primary-light px-2 py-0.5 text-xs font-medium text-primary">
                  <span className="shrink-0">{chipLabel}:&nbsp;</span>
                  <span>Custom</span>
                </span>
              ) : (
                <span className="inline-flex w-fit max-w-[calc(100%-1.5rem)] items-center rounded border border-primary/30 bg-primary-light px-2 py-0.5 text-xs font-medium text-primary">
                  <span className="shrink-0">{chipLabel}:&nbsp;</span>
                  <input
                    ref={composeInputRef}
                    type="text"
                    value={composeValue}
                    onChange={(e) => {
                      setComposeValue(e.target.value)
                      setOpen(true)
                    }}
                    onFocus={() => {
                      dismissStartHint()
                      setOpen(true)
                    }}
                    onKeyDown={handleComposeKeyDown}
                    className="min-w-[2ch] border-0 bg-transparent p-0 text-xs font-medium text-primary outline-none [field-sizing:content]"
                    aria-label={`${chipLabel} value`}
                  />
                </span>
              )
            ) : (
              <input
                ref={searchInputRef}
                type="text"
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value)
                  setOpen(true)
                }}
                onFocus={() => {
                  dismissStartHint()
                  setOpen(true)
                }}
                onKeyDown={handleSearchKeyDown}
                placeholder="Filter by entity, account, date…"
                className="min-w-[120px] flex-1 border-0 bg-transparent py-1 text-sm text-gray-800 outline-none placeholder:text-gray-400"
                role="combobox"
                aria-expanded={open}
                aria-controls="register-search-listbox"
              />
            )}
          </div>

          {showDatePicker && (
            <div className="absolute left-0 z-50 mt-1 w-full max-w-[400px] rounded-md border border-gray-200 bg-white p-3 shadow-[0_4px_10px_rgba(0,0,0,0.08),0_16px_40px_rgba(0,0,0,0.14)]">
              <label className="mb-2 block text-xs font-medium text-gray-500">Pick a date</label>
              <input
                ref={datePickerRef}
                type="date"
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-800 outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                onChange={(e) => {
                  if (e.target.value) commitValue('date', e.target.value)
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Escape') {
                    cancelCompose()
                    setOpen(false)
                  } else if (e.key === 'Backspace') {
                    e.preventDefault()
                    setDatePickerMode(false)
                    setComposeValue('')
                    requestAnimationFrame(() => composeInputRef.current?.focus())
                  }
                }}
              />
            </div>
          )}

          {showDropdown && (
            <ul
              id="register-search-listbox"
              role="listbox"
              className="absolute left-0 z-50 mt-1 max-h-64 w-full max-w-[400px] overflow-y-auto rounded-md border border-gray-200 bg-white py-1 shadow-[0_4px_10px_rgba(0,0,0,0.08),0_16px_40px_rgba(0,0,0,0.14)]"
            >
              {dropdownItems.map((item, i) => (
                <li
                  key={item.kind === 'type' ? `type-${item.field}` : `value-${item.value}`}
                  role="option"
                  aria-selected={i === highlightIndex}
                  className={clsx(
                    'flex cursor-pointer items-center justify-between px-3 py-2 text-sm',
                    i === highlightIndex ? 'bg-primary-light/60' : 'hover:bg-gray-50',
                  )}
                  onMouseEnter={() => setHighlightIndex(i)}
                  onMouseDown={(e) => {
                    e.preventDefault()
                    selectDropdownItem(item)
                  }}
                >
                  <span className="font-medium text-gray-800">{item.label}</span>
                  {item.kind === 'type' ? (
                    <span className="ml-3 shrink-0 text-xs text-gray-400">{item.hint}</span>
                  ) : item.hint ? (
                    <span className="ml-3 shrink-0 text-xs text-gray-400">{item.hint}</span>
                  ) : null}
                </li>
              ))}
            </ul>
          )}
        </div>

        {actions ? (
          <div className="flex shrink-0 items-center gap-2">{actions}</div>
        ) : null}
      </div>

      {filters.length > 0 && (
        <div className="mt-2.5 flex flex-wrap items-center gap-2">
          {filters.map((filter) => (
            <FilterChip key={filter.id} filter={filter} onRemove={removeFilter} />
          ))}
          <button
            type="button"
            onClick={resetAll}
            className="text-sm font-medium text-red-500 hover:text-red-600"
          >
            Reset All Filters
          </button>
        </div>
      )}
    </div>
  )
}
