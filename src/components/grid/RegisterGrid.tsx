import { useMemo, useRef, useEffect, useCallback, useState, forwardRef, useImperativeHandle } from 'react'
import { AgGridReact } from 'ag-grid-react'
import {
  ModuleRegistry,
  AllCommunityModule,
  themeBalham,
  type CellClassParams,
  type ColDef,
  type GridReadyEvent,
  type GetRowIdParams,
  type GridApi,
  type IRowNode,
} from 'ag-grid-community'
import { AllEnterpriseModule } from 'ag-grid-enterprise'
import { format } from 'date-fns'
import type { RegisterTag, RegisterTransaction } from '../../data/registerData'
import { AccountCodeCellRenderer } from './cellRenderers'
import { TagsCellRenderer } from './TagsCellRenderer'
import { TagItemsDialog } from './TagItemsDialog'
import { applyRegisterFilters, type ActiveFilter } from '../../lib/registerSearch'
import '../../styles/ag-grid-overrides.css'

ModuleRegistry.registerModules([AllCommunityModule, AllEnterpriseModule])

const currencyFormatter = (value: number | null | undefined) => {
  if (value == null) return ''
  return value.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })
}

const FILTER_SUBTOTAL_ROW_ID = '__filter-subtotal__'

function isFilterSubtotalNode(node: IRowNode) {
  return node.rowPinned === 'bottom' && node.data?.id === FILTER_SUBTOTAL_ROW_ID
}

function subtotalCellStyle(params: CellClassParams, numeric = false) {
  if (!isFilterSubtotalNode(params.node)) return undefined
  return {
    fontWeight: '600',
    color: numeric ? '#0f766e' : '#1f2937',
    textAlign: 'left',
    justifyContent: 'flex-start',
  }
}

function buildFilterSubtotalRow(
  rows: RegisterTransaction[],
): RegisterTransaction {
  const netAmount = rows.reduce((sum, row) => sum + row.accountingAmount, 0)

  return {
    id: FILTER_SUBTOTAL_ROW_ID,
    entity: 'Subtotal',
    account: '',
    effectiveAt: '',
    accountingAmount: netAmount,
    description: '',
    accountCode: '',
    tags: [],
    debits: netAmount,
    credits: null,
  }
}

function isGroupedByAccount(api: GridApi): boolean {
  return api.getRowGroupColumns().some((col) => col.getColId() === 'account')
}

function syncGroupedColumnLayout(api: GridApi) {
  const grouped = isGroupedByAccount(api)
  api.setColumnsVisible(['debits', 'credits', 'account'], !grouped)
  api.setColumnsVisible(['accountingAmount'], grouped)

  const accountingCol = api.getColumn('accountingAmount')
  if (accountingCol) {
    const headerName = grouped ? 'sum(Accounting Amount)' : 'Accounting Amount'
    const colDef = accountingCol.getColDef()
    if (colDef.headerName !== headerName) {
      colDef.headerName = headerName
      api.refreshHeader()
    }
  }

  const groupCol = api.getColumn('ag-Grid-AutoColumn')
  if (groupCol) {
    api.setColumnsVisible(['ag-Grid-AutoColumn'], grouped)
  }
}

function expandAccountGroups(api: GridApi) {
  if (!isGroupedByAccount(api)) return
  requestAnimationFrame(() => api.expandAll())
}

interface RegisterGridProps {
  filters: ActiveFilter[]
  transactions: RegisterTransaction[]
  onTransactionsChange: (transactions: RegisterTransaction[]) => void
  onSelectionCountChange?: (count: number) => void
}

export interface RegisterGridHandle {
  resetSelection: () => void
}

export const RegisterGrid = forwardRef<RegisterGridHandle, RegisterGridProps>(
  function RegisterGrid(
    { filters, transactions, onTransactionsChange, onSelectionCountChange },
    ref,
  ) {
  const gridRef = useRef<AgGridReact>(null)
  const hasSelectedRef = useRef(false)
  const [tagDialogOpen, setTagDialogOpen] = useState(false)
  const [tagTargetIds, setTagTargetIds] = useState<string[]>([])

  useImperativeHandle(ref, () => ({
    resetSelection: () => {
      gridRef.current?.api?.deselectAll()
    },
  }), [])

  const notifySelectionCount = useCallback(() => {
    const count = gridRef.current?.api?.getSelectedRows().length ?? 0
    onSelectionCountChange?.(count)
  }, [onSelectionCountChange])

  const rowData = useMemo(
    () => applyRegisterFilters(transactions, filters),
    [transactions, filters],
  )

  const pinnedBottomRowData = useMemo(
    () => (filters.length > 0 ? [buildFilterSubtotalRow(rowData)] : []),
    [filters.length, rowData],
  )

  const handleTagItems = useCallback((transactionIds: string[]) => {
    setTagTargetIds(transactionIds)
    setTagDialogOpen(true)
  }, [])

  const refreshTagsColumn = useCallback(() => {
    gridRef.current?.api?.refreshCells({ columns: ['tags'], force: true })
  }, [])

  const handleApplyTag = useCallback(
    (tag: RegisterTag) => {
      const idSet = new Set(tagTargetIds)
      onTransactionsChange(
        transactions.map((tx) => {
          if (!idSet.has(tx.id)) return tx
          const hasTag = tx.tags.some((existing) => existing.label === tag.label)
          if (hasTag) return tx
          return { ...tx, tags: [...tx.tags, tag] }
        }),
      )
      setTagDialogOpen(false)
      setTagTargetIds([])
      requestAnimationFrame(() => refreshTagsColumn())
    },
    [tagTargetIds, transactions, onTransactionsChange, refreshTagsColumn],
  )

  const columnDefs = useMemo<ColDef[]>(
    () => [
      {
        field: 'entity',
        headerName: 'Entity',
        filter: 'agTextColumnFilter',
        enableRowGroup: true,
        minWidth: 130,
      },
      {
        field: 'account',
        headerName: 'Account',
        filter: 'agTextColumnFilter',
        enableRowGroup: true,
        minWidth: 150,
      },
      {
        field: 'offsetAccount',
        headerName: 'Offset Account',
        hide: true,
        enableRowGroup: true,
      },
      {
        field: 'effectiveAt',
        headerName: 'Effective At',
        filter: 'agDateColumnFilter',
        minWidth: 130,
        valueFormatter: (p) =>
          p.value ? format(new Date(p.value), 'MMM dd, yyyy') : '',
      },
      {
        colId: 'debits',
        field: 'debits',
        headerName: 'Debits',
        enableValue: true,
        aggFunc: 'sum',
        type: 'numericColumn',
        minWidth: 110,
        valueFormatter: (p) => currencyFormatter(p.value),
        cellStyle: (params) => subtotalCellStyle(params, true),
      },
      {
        colId: 'credits',
        field: 'credits',
        headerName: 'Credits',
        enableValue: true,
        aggFunc: 'sum',
        type: 'numericColumn',
        minWidth: 110,
        valueFormatter: (p) =>
          p.node && isFilterSubtotalNode(p.node) ? '' : currencyFormatter(p.value),
        cellStyle: (params) => subtotalCellStyle(params, true),
      },
      {
        colId: 'accountingAmount',
        field: 'accountingAmount',
        headerName: 'Accounting Amount',
        hide: true,
        enableValue: true,
        aggFunc: 'sum',
        type: 'numericColumn',
        minWidth: 170,
        valueFormatter: (p) => currencyFormatter(p.value),
        cellStyle: (params) => subtotalCellStyle(params, true),
      },
      {
        field: 'description',
        headerName: 'Description',
        filter: 'agTextColumnFilter',
        flex: 1,
        minWidth: 180,
      },
      {
        field: 'accountCode',
        headerName: 'Account Code',
        filter: 'agTextColumnFilter',
        minWidth: 120,
        cellRenderer: AccountCodeCellRenderer,
      },
      {
        field: 'tags',
        headerName: 'Tags',
        filter: false,
        minWidth: 160,
        cellRenderer: TagsCellRenderer,
        cellRendererParams: {
          onTagItems: handleTagItems,
        },
        sortable: false,
        suppressNavigable: true,
        suppressHeaderFilterButton: true,
        mainMenuItems: (params) => [
          {
            name: 'Tag Items',
            disabled: params.api.getSelectedRows().length < 2,
            action: () => {
              handleTagItems(params.api.getSelectedRows().map((row) => row.id))
            },
          },
        ],
      },
    ],
    [handleTagItems],
  )

  const defaultColDef = useMemo<ColDef>(
    () => ({
      sortable: true,
      resizable: true,
      filter: true,
      suppressHeaderMenuButton: false,
      cellStyle: (params) => subtotalCellStyle(params),
    }),
    [],
  )

  const autoGroupColumnDef = useMemo<ColDef>(
    () => ({
      headerName: 'Group',
      pinned: 'left',
      lockPosition: 'left',
      minWidth: 240,
      cellRendererParams: {
        suppressCount: true,
        totalValueGetter: (params: { value?: string; node?: { level?: number } }) => {
          if (params.node?.level === -1) return 'Grand Total'
          if (params.value) return `Sub total ${params.value}`
          return 'Sub total'
        },
      },
    }),
    [],
  )

  const sideBar = useMemo(
    () => ({
      toolPanels: [
        {
          id: 'columns',
          labelDefault: 'Columns',
          labelKey: 'columns',
          iconKey: 'columns',
          toolPanel: 'agColumnsToolPanel',
          toolPanelParams: {
            suppressPivotMode: true,
            suppressRowGroups: false,
            suppressValues: false,
          },
        },
        {
          id: 'filters',
          labelDefault: 'Filters',
          labelKey: 'filters',
          iconKey: 'filter',
          toolPanel: 'agFiltersToolPanel',
        },
      ],
      defaultToolPanel: 'columns',
      position: 'right' as const,
    }),
    [],
  )

  const onGridReady = (params: GridReadyEvent) => {
    if (!hasSelectedRef.current) {
      params.api.forEachNode((node) => {
        if (
          !hasSelectedRef.current &&
          !node.group &&
          !node.footer &&
          node.data?.entity === 'Parents' &&
          node.data?.account === 'Insurance Expense'
        ) {
          node.setSelected(true)
          hasSelectedRef.current = true
        }
      })
    }

    params.api.addEventListener('columnRowGroupChanged', () => {
      syncGroupedColumnLayout(params.api)
      expandAccountGroups(params.api)
    })

    syncGroupedColumnLayout(params.api)
    params.api.sizeColumnsToFit()
    notifySelectionCount()
  }

  useEffect(() => {
    const api = gridRef.current?.api
    if (!api) return
    api.sizeColumnsToFit()
  }, [rowData])

  const onSelectionChanged = useCallback(() => {
    refreshTagsColumn()
    notifySelectionCount()
  }, [refreshTagsColumn, notifySelectionCount])

  const isRowSelectable = useCallback(
    (node: IRowNode) => !node.group && !node.footer && !node.rowPinned,
    [],
  )

  const getRowClass = useCallback(
    (params: { node: IRowNode }) =>
      params.node.rowPinned === 'bottom' ? 'register-filter-subtotal' : '',
    [],
  )

  const sumitTheme = useMemo(
    () =>
      themeBalham.withParams({
        accentColor: '#1a8a8a',
        headerBackgroundColor: '#f8f9fa',
        headerTextColor: '#374151',
        borderColor: '#e5e7eb',
        rowHoverColor: '#f0f7ff',
        selectedRowBackgroundColor: '#e8f4fc',
        fontFamily: { googleFont: 'Inter' },
        fontSize: 13,
        spacing: 6,
        wrapperBorderRadius: 0,
      }),
    [],
  )

  const getRowId = (params: GetRowIdParams) => params.data.id

  return (
    <>
      <div className="sumit-grid h-full w-full">
        <AgGridReact
          ref={gridRef}
          theme={sumitTheme}
          rowData={rowData}
          pinnedBottomRowData={pinnedBottomRowData}
          columnDefs={columnDefs}
          defaultColDef={defaultColDef}
          autoGroupColumnDef={autoGroupColumnDef}
          getRowId={getRowId}
          getRowClass={getRowClass}
          isRowSelectable={isRowSelectable}
          rowSelection={{
            mode: 'multiRow',
            checkboxes: false,
            headerCheckbox: false,
            enableClickSelection: true,
          }}
          onSelectionChanged={onSelectionChanged}
          rowGroupPanelShow="always"
          groupDisplayType="singleColumn"
          groupTotalRow="bottom"
          groupDefaultExpanded={0}
          sideBar={sideBar}
          animateRows
          suppressAggFuncInHeader={false}
          onGridReady={onGridReady}
          domLayout="normal"
        />
      </div>

      <TagItemsDialog
        open={tagDialogOpen}
        itemCount={tagTargetIds.length}
        onClose={() => {
          setTagDialogOpen(false)
          setTagTargetIds([])
        }}
        onApply={handleApplyTag}
      />
    </>
  )
})
