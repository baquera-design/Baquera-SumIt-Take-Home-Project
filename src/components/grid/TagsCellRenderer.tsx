import { useCallback, useEffect, useRef, useState } from 'react'
import type { ICellRendererParams } from 'ag-grid-community'
import { TagsCell } from '../ui/TagPill'
import type { RegisterTransaction } from '../../data/registerData'

export interface TagsCellRendererParams extends ICellRendererParams<RegisterTransaction> {
  onTagItems?: (transactionIds: string[]) => void
}

function VerticalMenuIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <circle cx="12" cy="5" r="1.75" />
      <circle cx="12" cy="12" r="1.75" />
      <circle cx="12" cy="19" r="1.75" />
    </svg>
  )
}

export function TagsCellRenderer(params: TagsCellRendererParams) {
  const [open, setOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)
  const tags = params.value ?? []
  const selectedCount = params.api.getSelectedRows().length
  const isRowSelected = params.node.isSelected()
  const showTagItemsOption = selectedCount >= 2 && isRowSelected

  const closeMenu = useCallback(() => setOpen(false), [])

  useEffect(() => {
    if (!open) return
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        closeMenu()
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [open, closeMenu])

  const handleTagItems = () => {
    const ids = params.api.getSelectedRows().map((row) => row.id)
    params.onTagItems?.(ids)
    closeMenu()
  }

  return (
    <div className="flex h-full items-center gap-1 py-0.5">
      {tags.length > 0 ? <TagsCell tags={tags} /> : null}

      {showTagItemsOption && (
        <div className="relative shrink-0" ref={menuRef}>
          <button
            type="button"
            aria-label="Tag actions"
            aria-expanded={open}
            onMouseDown={(e) => e.stopPropagation()}
            onClick={(e) => {
              e.stopPropagation()
              setOpen((value) => !value)
            }}
            className="flex h-6 w-6 items-center justify-center rounded text-gray-400 hover:bg-gray-100 hover:text-gray-600"
          >
            <VerticalMenuIcon className="h-4 w-4" />
          </button>

          {open && (
            <ul
              role="menu"
              className="absolute right-0 top-full z-50 mt-1 min-w-[140px] overflow-hidden rounded-md border border-gray-200 bg-white py-1 shadow-lg"
            >
              <li role="none">
                <button
                  type="button"
                  role="menuitem"
                  onMouseDown={(e) => e.stopPropagation()}
                  onClick={handleTagItems}
                  className="w-full px-3 py-2 text-left text-sm font-medium text-gray-800 hover:bg-gray-50"
                >
                  Tag Items
                </button>
              </li>
            </ul>
          )}
        </div>
      )}
    </div>
  )
}
