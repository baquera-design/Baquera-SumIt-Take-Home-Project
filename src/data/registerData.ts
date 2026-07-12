import { generateRegisterTransactions } from './registerDataGenerator'

export interface RegisterTag {
  label: string
  variant: 'blue' | 'green' | 'gray'
}

export interface RegisterTransaction {
  id: string
  account: string
  entity: string
  effectiveAt: string
  accountingAmount: number
  description: string
  accountCode: string
  tags: RegisterTag[]
  debits: number | null
  credits: number | null
}

/** ~3,500 journal lines across 40 entities — representative of a mid-size family office register */
export const REGISTER_ROW_COUNT = 3500

export const registerTransactions: RegisterTransaction[] =
  generateRegisterTransactions(REGISTER_ROW_COUNT)

export const LEDGERS_TABS = [
  'Account Matrix',
  'Accounts',
  'Account Codes',
  'Register',
  'Journal',
  'Bank Register',
  'Tags',
] as const

export type LedgersTab = (typeof LEDGERS_TABS)[number]

export const SIDEBAR_NAV = [
  { id: 'search', label: 'Search', icon: 'search' },
  { id: 'entities', label: 'Entities', icon: 'entities' },
  {
    id: 'ledgers',
    label: 'Ledgers',
    icon: 'ledgers',
    children: [
      { id: 'account-matrix', label: 'Account Matrix' },
      { id: 'accounts', label: 'Accounts' },
      { id: 'account-codes', label: 'Account Codes' },
      { id: 'register', label: 'Register', active: true },
      { id: 'journal', label: 'Journal' },
      { id: 'bank-register', label: 'Bank Register' },
      { id: 'tags', label: 'Tags' },
    ],
  },
  { id: 'reconciliation', label: 'Reconciliation', icon: 'reconciliation' },
  { id: 'budgets', label: 'Budgets', icon: 'budgets' },
  { id: 'reports', label: 'Reports', icon: 'reports' },
  { id: 'settings', label: 'Settings', icon: 'settings' },
  { id: 'help', label: 'Help', icon: 'help' },
] as const
