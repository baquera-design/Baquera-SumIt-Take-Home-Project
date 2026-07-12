import type { RegisterTransaction } from '../data/registerData'
import { format } from 'date-fns'

export type FilterField = 'entity' | 'account' | 'date' | 'tag' | 'description' | 'text'

export interface ActiveFilter {
  id: string
  field: FilterField
  label: string
  value: string
}

export interface ValueSuggestion {
  value: string
  count: number
}

export const FILTER_TYPE_OPTIONS: { field: FilterField; label: string; hint: string }[] = [
  { field: 'entity', label: 'Entity', hint: 'Filter by legal entity' },
  { field: 'account', label: 'Account', hint: 'Filter by GL account' },
  { field: 'date', label: 'Date', hint: 'Filter by date range' },
  { field: 'tag', label: 'Tag', hint: 'Filter by tag' },
  { field: 'description', label: 'Description', hint: 'Filter by line description' },
]

export const DATE_PRESETS = [
  'Last Quarter',
  'This Quarter',
  'Last Month',
  'This Month',
  'This Year',
  'Last Year',
  'YTD',
  'Last 30 Days',
  'Last 90 Days',
] as const

export const DATE_CUSTOM_OPTION = 'Custom'

export type DatePreset = (typeof DATE_PRESETS)[number]

const ISO_DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/

export function isCustomDateValue(value: string): boolean {
  return ISO_DATE_PATTERN.test(value)
}

export type ComposeField = Exclude<FilterField, 'text'>

function normalize(s: string) {
  return s.toLowerCase().trim()
}

function activeValuesForField(field: FilterField, activeFilters: ActiveFilter[]): Set<string> {
  return new Set(
    activeFilters.filter((f) => f.field === field).map((f) => normalize(f.value)),
  )
}

function matchesQuery(query: string, target: string): boolean {
  const q = normalize(query)
  if (!q) return true
  const t = normalize(target)
  if (t.includes(q)) return true
  const words = t.split(/\s+/)
  if (words.some((w) => w.startsWith(q))) return true
  return q.split(/\s+/).every((part) => t.includes(part))
}

export function buildSearchIndex(transactions: RegisterTransaction[]) {
  const entities = [...new Set(transactions.map((t) => t.entity))].sort()
  const accounts = [...new Set(transactions.map((t) => t.account))].sort()
  const descriptions = [...new Set(transactions.map((t) => t.description))].sort()
  const tags = [...new Set(transactions.flatMap((t) => t.tags.map((tag) => tag.label)))].sort()

  return { entities, accounts, descriptions, tags }
}

export function getTypeSuggestions(query: string) {
  return FILTER_TYPE_OPTIONS.filter(
    (opt) => matchesQuery(query, opt.label) || matchesQuery(query, opt.field),
  )
}

function countTransactionsForValue(
  field: ComposeField,
  value: string,
  transactions: RegisterTransaction[],
): number {
  switch (field) {
    case 'entity':
      return transactions.filter((tx) => normalize(tx.entity) === normalize(value)).length
    case 'account':
      return transactions.filter((tx) => normalize(tx.account) === normalize(value)).length
    case 'tag':
      return transactions.filter((tx) =>
        tx.tags.some((t) => normalize(t.label) === normalize(value)),
      ).length
    case 'date':
      if (value === DATE_CUSTOM_OPTION) return 0
      if (isCustomDateValue(value)) {
        return transactions.filter((tx) => tx.effectiveAt === value).length
      }
      return transactions.filter((tx) => inDateRange(tx.effectiveAt, value as DatePreset)).length
    case 'description':
      return transactions.filter((tx) => normalize(tx.description) === normalize(value)).length
  }
}

export function getValueSuggestions(
  field: ComposeField,
  query: string,
  index: ReturnType<typeof buildSearchIndex>,
  activeFilters: ActiveFilter[] = [],
): string[] {
  const activeValues = activeValuesForField(field, activeFilters)
  let values: string[] = []
  switch (field) {
    case 'entity':
      values = index.entities
      break
    case 'account':
      values = index.accounts
      break
    case 'date':
      values = [DATE_CUSTOM_OPTION, ...DATE_PRESETS]
      break
    case 'tag':
      values = index.tags
      break
    case 'description':
      values = index.descriptions
      break
  }
  return values.filter(
    (v) => matchesQuery(query, v) && !activeValues.has(normalize(v)),
  )
}

export function getValueSuggestionsWithCounts(
  field: ComposeField,
  query: string,
  index: ReturnType<typeof buildSearchIndex>,
  activeFilters: ActiveFilter[] = [],
  contextTransactions: RegisterTransaction[] = [],
): ValueSuggestion[] {
  const values = getValueSuggestions(field, query, index, activeFilters)
  const useContext = contextTransactions.length > 0

  const suggestions = values.map((value) => ({
    value,
    count: countTransactionsForValue(field, value, contextTransactions),
  }))

  const filtered = useContext
    ? suggestions.filter(
        (s) => s.value === DATE_CUSTOM_OPTION || s.count > 0,
      )
    : suggestions

  return filtered.sort((a, b) => {
    if (a.value === DATE_CUSTOM_OPTION) return -1
    if (b.value === DATE_CUSTOM_OPTION) return 1
    return b.count - a.count
  })
}

export function formatSuggestionCount(count: number): string {
  return `${count} line${count !== 1 ? 's' : ''}`
}

export function getDateRange(preset: DatePreset, refDate = new Date('2026-07-12')): {
  start: Date
  end: Date
} {
  const year = refDate.getFullYear()
  const month = refDate.getMonth()
  const quarter = Math.floor(month / 3)

  switch (preset) {
    case 'This Quarter': {
      const start = new Date(year, quarter * 3, 1)
      const end = new Date(year, quarter * 3 + 3, 0)
      return { start, end }
    }
    case 'Last Quarter': {
      const q = quarter === 0 ? 3 : quarter - 1
      const y = quarter === 0 ? year - 1 : year
      const start = new Date(y, q * 3, 1)
      const end = new Date(y, q * 3 + 3, 0)
      return { start, end }
    }
    case 'This Month': {
      const start = new Date(year, month, 1)
      const end = new Date(year, month + 1, 0)
      return { start, end }
    }
    case 'Last Month': {
      const start = new Date(year, month - 1, 1)
      const end = new Date(year, month, 0)
      return { start, end }
    }
    case 'This Year':
      return { start: new Date(year, 0, 1), end: new Date(year, 11, 31) }
    case 'Last Year':
      return { start: new Date(year - 1, 0, 1), end: new Date(year - 1, 11, 31) }
    case 'YTD':
      return { start: new Date(year, 0, 1), end: refDate }
    case 'Last 30 Days': {
      const start = new Date(refDate)
      start.setDate(start.getDate() - 30)
      return { start, end: refDate }
    }
    case 'Last 90 Days': {
      const start = new Date(refDate)
      start.setDate(start.getDate() - 90)
      return { start, end: refDate }
    }
  }
}

function inDateRange(dateStr: string, preset: DatePreset): boolean {
  const { start, end } = getDateRange(preset)
  const d = new Date(dateStr + 'T00:00:00')
  return d >= start && d <= end
}

export function applyRegisterFilters(
  transactions: RegisterTransaction[],
  filters: ActiveFilter[],
): RegisterTransaction[] {
  if (filters.length === 0) return transactions

  const groups = new Map<FilterField, ActiveFilter[]>()
  for (const filter of filters) {
    const group = groups.get(filter.field) ?? []
    group.push(filter)
    groups.set(filter.field, group)
  }

  return transactions.filter((tx) => {
    for (const [, groupFilters] of groups) {
      if (!groupFilters.some((f) => matchesFilter(tx, f))) return false
    }
    return true
  })
}

/** Rows visible for composing a new filter on `field` (other active filters applied) */
export function getTransactionsForFieldCompose(
  transactions: RegisterTransaction[],
  activeFilters: ActiveFilter[],
  composingField: FilterField,
): RegisterTransaction[] {
  const otherFilters = activeFilters.filter((f) => f.field !== composingField)
  return applyRegisterFilters(transactions, otherFilters)
}

function matchesFilter(tx: RegisterTransaction, filter: ActiveFilter): boolean {
  switch (filter.field) {
    case 'entity':
      return normalize(tx.entity) === normalize(filter.value)
    case 'account':
      return normalize(tx.account) === normalize(filter.value)
    case 'date':
      if (isCustomDateValue(filter.value)) {
        return tx.effectiveAt === filter.value
      }
      return inDateRange(tx.effectiveAt, filter.value as DatePreset)
    case 'tag':
      return tx.tags.some((t) => normalize(t.label) === normalize(filter.value))
    case 'description':
      return normalize(tx.description) === normalize(filter.value)
    case 'text': {
      const q = normalize(filter.value)
      return (
        normalize(tx.entity).includes(q) ||
        normalize(tx.account).includes(q) ||
        normalize(tx.description).includes(q) ||
        normalize(tx.accountCode).includes(q) ||
        tx.tags.some((t) => normalize(t.label).includes(q))
      )
    }
    default:
      return true
  }
}

export function formatComposeSuggestionLabel(field: ComposeField, value: string): string {
  if (field === 'date' && isCustomDateValue(value)) {
    return format(new Date(`${value}T00:00:00`), 'MMM dd, yyyy')
  }
  return value
}

export function formatFilterLabel(field: FilterField, value: string): string {
  switch (field) {
    case 'entity':
      return `Entity: ${value}`
    case 'account':
      return `Account: ${value}`
    case 'date':
      if (isCustomDateValue(value)) {
        return `Date: ${format(new Date(`${value}T00:00:00`), 'MMM dd, yyyy')}`
      }
      return `Date: ${value}`
    case 'tag':
      return `Tag: ${value}`
    case 'description':
      return `Description: ${value}`
    case 'text':
      return value
  }
}

export const FIELD_LABELS: Record<ComposeField, string> = {
  entity: 'Entity',
  account: 'Account',
  date: 'Date',
  tag: 'Tag',
  description: 'Description',
}
