import type { ICellRendererParams } from 'ag-grid-community'

export function AccountCodeCellRenderer(params: ICellRendererParams) {
  const value = params.value as string
  if (value === 'Uncoded') {
    return <span className="text-xs italic text-gray-400">{value}</span>
  }
  return <span className="text-xs text-gray-700">{value}</span>
}
