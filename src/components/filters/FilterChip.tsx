import type { ActiveFilter } from '../../lib/registerSearch'

interface FilterChipProps {
  filter: ActiveFilter
  onRemove: (id: string) => void
}

export function FilterChip({ filter, onRemove }: FilterChipProps) {
  return (
    <span className="inline-flex items-center gap-1 rounded border border-primary/30 bg-primary-light px-2 py-0.5 text-xs font-medium text-primary">
      {filter.label}
      <button
        type="button"
        onClick={() => onRemove(filter.id)}
        className="ml-0.5 text-primary/70 hover:text-primary"
        aria-label={`Remove ${filter.label} filter`}
      >
        <svg className="h-3 w-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
          <path d="M18 6L6 18M6 6l12 12" />
        </svg>
      </button>
    </span>
  )
}
