import clsx from 'clsx'
import type { RegisterTag } from '../../data/registerData'

interface TagPillProps {
  tag: RegisterTag
}

export function TagPill({ tag }: TagPillProps) {
  if (tag.variant === 'gray') {
    return (
      <span className="text-xs text-tag-gray italic">{tag.label}</span>
    )
  }

  return (
    <span
      className={clsx(
        'inline-flex items-center rounded border px-1.5 py-0.5 text-[11px] font-medium leading-none',
        tag.variant === 'blue' &&
          'border-tag-blue/40 bg-tag-blue-bg text-tag-blue',
        tag.variant === 'green' &&
          'border-tag-green/40 bg-tag-green-bg text-tag-green',
      )}
    >
      {tag.label}
    </span>
  )
}

interface TagsCellProps {
  tags: RegisterTag[]
}

export function TagsCell({ tags }: TagsCellProps) {
  return (
    <div className="flex flex-wrap items-center gap-1 py-0.5">
      {tags.map((tag) => (
        <TagPill key={tag.label} tag={tag} />
      ))}
    </div>
  )
}
