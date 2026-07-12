import { useEffect, useRef, useState } from 'react'
import clsx from 'clsx'
import type { RegisterTag } from '../../data/registerData'

interface TagItemsDialogProps {
  open: boolean
  itemCount: number
  onClose: () => void
  onApply: (tag: RegisterTag) => void
}

export function TagItemsDialog({ open, itemCount, onClose, onApply }: TagItemsDialogProps) {
  const [label, setLabel] = useState('')
  const [variant, setVariant] = useState<RegisterTag['variant']>('blue')
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (!open) return
    setLabel('')
    setVariant('blue')
    requestAnimationFrame(() => inputRef.current?.focus())
  }, [open])

  useEffect(() => {
    if (!open) return
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [open, onClose])

  if (!open) return null

  const trimmed = label.trim()
  const canApply = trimmed.length > 0

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center">
      <button
        type="button"
        className="absolute inset-0 bg-black/30"
        aria-label="Close dialog"
        onClick={onClose}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="tag-items-dialog-title"
        className="relative z-10 w-full max-w-md rounded-lg border border-gray-200 bg-white p-6 shadow-xl"
      >
        <h2 id="tag-items-dialog-title" className="text-lg font-semibold text-gray-900">
          Tag Items
        </h2>
        <p className="mt-1 text-sm text-gray-500">
          Create a new tag and apply it to {itemCount} selected transaction
          {itemCount !== 1 ? 's' : ''}.
        </p>

        <div className="mt-5">
          <label htmlFor="tag-label" className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-gray-500">
            Tag name
          </label>
          <input
            ref={inputRef}
            id="tag-label"
            type="text"
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && canApply) {
                onApply({ label: trimmed, variant })
              }
            }}
            placeholder="e.g. Q3 Review"
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900 outline-none focus:border-primary focus:ring-1 focus:ring-primary"
          />
        </div>

        <div className="mt-4">
          <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-gray-500">
            Color
          </span>
          <div className="flex gap-2">
            {(['blue', 'green'] as const).map((option) => (
              <button
                key={option}
                type="button"
                onClick={() => setVariant(option)}
                className={clsx(
                  'rounded-md border px-3 py-1.5 text-xs font-medium capitalize transition-colors',
                  variant === option
                    ? option === 'blue'
                      ? 'border-tag-blue bg-tag-blue-bg text-tag-blue'
                      : 'border-tag-green bg-tag-green-bg text-tag-green'
                    : 'border-gray-200 bg-white text-gray-600 hover:bg-gray-50',
                )}
              >
                {option}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-6 flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={!canApply}
            onClick={() => onApply({ label: trimmed, variant })}
            className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary-dark disabled:cursor-not-allowed disabled:opacity-50"
          >
            Apply Tag
          </button>
        </div>
      </div>
    </div>
  )
}
