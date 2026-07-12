import type { RegisterTag, RegisterTransaction } from './registerData'

/** Seeded PRNG for reproducible demo data */
function mulberry32(seed: number) {
  return () => {
    seed |= 0
    seed = (seed + 0x6d2b79f5) | 0
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

const ENTITIES = [
  'Parents',
  'Family Trust',
  'Anderson Revocable Trust',
  'Anderson Irrevocable Trust',
  'Whitmore Dynasty Trust',
  'Harbor View GRAT',
  'Oakwood Holdings LLC',
  'Summit Family Office LLC',
  'Peninsula Real Estate Holdings',
  'Real Estate Holdings',
  'Maple Street Properties LLC',
  'Lakeside Ranch LP',
  'Red Cedar Investment LP',
  'Crosswind Aviation LLC',
  'Whitmore Charitable Foundation',
  'Meridian Capital Partners LP',
  'Coastal Vineyard LLC',
  'Highland Park Residence LLC',
  'Riverstone Development LLC',
  'Cascade Timber Holdings LP',
  'Sterling Art Collection LLC',
  'Northgate Management LLC',
  'Bayview Marina LLC',
  'Pinecrest Family LP',
  'Horizon Private Equity LLC',
  'Valley View Ranch Trust',
  'Eastside Commercial LLC',
  'Westbrook Energy LP',
  'Silverleaf Hospitality LLC',
  'Crown Estate Services LLC',
  'Fairmont Family Limited Partnership',
  'Greenwich Investment Trust',
  'Brookfield Asset Holdings LLC',
  'Clearwater Philanthropic Fund',
  'Teton Outdoor Ventures LLC',
  'Ashford Credit Facility LLC',
  'Legacy Wealth Preservation Trust',
  'Sunrise 1031 Exchange LLC',
  'Blackstone Carry Vehicle LP',
  'Willow Creek Farmland LLC',
  'Presidio Tech Ventures LLC',
] as const

type AccountDef = {
  name: string
  side: 'debit' | 'credit' | 'both'
  /** Typical amount range in dollars */
  min: number
  max: number
  descriptions: string[]
  accountCodes: string[]
}

const ACCOUNTS: AccountDef[] = [
  {
    name: 'Checking Account',
    side: 'both',
    min: 500,
    max: 250000,
    descriptions: [
      'Wire transfer — operating',
      'ACH deposit — investment proceeds',
      'Check #4821 — vendor payment',
      'Internal transfer from related entity',
      'Monthly sweep to money market',
      'Returned wire — insufficient reference',
      'Client reimbursement deposit',
      'Quarter-end cash reconciliation',
    ],
    accountCodes: ['1010', '1015', 'Uncoded'],
  },
  {
    name: 'Money Market Account',
    side: 'both',
    min: 10000,
    max: 500000,
    descriptions: [
      'Sweep from operating account',
      'Redemption for capital call',
      'Interest credit',
      'Transfer to checking — tax payment',
    ],
    accountCodes: ['1020', 'Uncoded'],
  },
  {
    name: 'Investment Account',
    side: 'both',
    min: 25000,
    max: 2000000,
    descriptions: [
      'Purchase — US large cap equity',
      'Sale — municipal bond position',
      'Dividend reinvestment',
      'Capital gain distribution',
      'Mark-to-market adjustment',
      'Private equity capital call funding',
      'Redemption — hedge fund quarterly',
    ],
    accountCodes: ['1200', '1210', 'Uncoded'],
  },
  {
    name: 'Due To Related Party',
    side: 'both',
    min: 5000,
    max: 750000,
    descriptions: [
      'Inter-entity loan advance',
      'Repayment from subsidiary LLC',
      'Allocation of shared family office expense',
      'Temporary funding — property closing',
      'Year-end related party true-up',
    ],
    accountCodes: ['2100', 'Uncoded'],
  },
  {
    name: 'Due From Related Party',
    side: 'both',
    min: 5000,
    max: 750000,
    descriptions: [
      'Advance to sister entity — operating',
      'Repayment received from trust',
      'Shared services recharge',
      'Inter-entity note principal payment',
    ],
    accountCodes: ['1150', 'Uncoded'],
  },
  {
    name: 'Insurance Expense',
    side: 'debit',
    min: 800,
    max: 45000,
    descriptions: [
      'D&O insurance premium',
      'Auto insurance premium',
      'General liability premium',
      'GL liability premium',
      'Gen Liab prem — annual renewal',
      'Gen Liab prem — Q2 installment',
      'Property insurance renewal',
      'Property insurance premium',
      'Umbrella policy premium',
      'Workers comp — estate staff',
      'Aircraft hull & liability premium',
      'Cyber liability premium',
      'Fine art floater policy',
      'Flood insurance',
      'Liability coverage',
      'Annual insurance premium — policy renewal',
      'Commercial auto premium',
    ],
    accountCodes: ['6200', '6210', 'Uncoded'],
  },
  {
    name: 'Professional Fees',
    side: 'debit',
    min: 2500,
    max: 85000,
    descriptions: [
      'Legal due diligence — acquisition',
      'Legal counsel retainer',
      'Accounting services — quarterly',
      'Tax advisory — estate planning',
      'Audit fees — annual financials',
      'Trust administration fees',
      'Valuation services — illiquid holdings',
      'Family office consulting',
    ],
    accountCodes: ['6300', '6310', 'Uncoded'],
  },
  {
    name: 'Management Fees',
    side: 'debit',
    min: 5000,
    max: 120000,
    descriptions: [
      'Investment manager fee — Q1',
      'Investment manager fee — Q2',
      'Investment manager fee — Q3',
      'Investment manager fee — Q4',
      'Family office platform fee',
      'Private bank advisory fee',
    ],
    accountCodes: ['6320', 'Uncoded'],
  },
  {
    name: 'Real Estate Expense',
    side: 'debit',
    min: 1500,
    max: 65000,
    descriptions: [
      'Property management fee',
      'Landscaping & grounds maintenance',
      'HVAC repair — main residence',
      'Pool & spa maintenance',
      'Security system monitoring',
      'Snow removal — Colorado property',
      'HOA assessment — San Francisco',
      'Roof repair — tenant-ready unit',
    ],
    accountCodes: ['6400', '6410', 'Uncoded'],
  },
  {
    name: 'Property Tax Expense',
    side: 'debit',
    min: 8000,
    max: 185000,
    descriptions: [
      'Property tax — installment 1',
      'Property tax — installment 2',
      'Supplemental tax assessment',
      'Personal property tax — aircraft',
      'Delinquent tax penalty & interest',
    ],
    accountCodes: ['6420', 'Uncoded'],
  },
  {
    name: 'Interest Expense',
    side: 'debit',
    min: 1200,
    max: 95000,
    descriptions: [
      'Mortgage interest — primary residence',
      'Line of credit interest',
      'Promissory note interest — related party',
      'Aircraft financing interest',
      'Bridge loan interest — acquisition',
    ],
    accountCodes: ['6500', 'Uncoded'],
  },
  {
    name: 'Interest Income',
    side: 'credit',
    min: 150,
    max: 22000,
    descriptions: [
      'Bank interest — operating account',
      'Money market interest',
      'Loan interest received — related entity',
      'Treasury bill interest at maturity',
    ],
    accountCodes: ['4100', 'Uncoded'],
  },
  {
    name: 'Dividend Income',
    side: 'credit',
    min: 500,
    max: 180000,
    descriptions: [
      'Qualified dividend — public equities',
      'Dividend — REIT position',
      'Return of capital — MLP',
      'Special dividend — concentrated holding',
    ],
    accountCodes: ['4110', 'Uncoded'],
  },
  {
    name: 'K-1 Income',
    side: 'credit',
    min: 10000,
    max: 450000,
    descriptions: [
      'K-1 ordinary income — investment LP',
      'K-1 rental income — real estate LP',
      'K-1 capital gain — PE fund',
      'K-1 guaranteed payment',
      'K-1 Section 199A income',
    ],
    accountCodes: ['4120', 'Uncoded'],
  },
  {
    name: 'Trust Distributions',
    side: 'debit',
    min: 10000,
    max: 500000,
    descriptions: [
      'Distribution to beneficiary — support',
      'Distribution — education expenses',
      'Distribution — healthcare',
      'Discretionary distribution — trustee',
      'Required minimum distribution',
    ],
    accountCodes: ['3200', 'Uncoded'],
  },
  {
    name: 'Capital Contributions',
    side: 'credit',
    min: 25000,
    max: 2000000,
    descriptions: [
      'Capital contribution — new LP interest',
      'Additional funding — real estate LLC',
      'Member contribution — holding company',
      'Gift to irrevocable trust',
      'Seed capital — family venture entity',
    ],
    accountCodes: ['3100', 'Uncoded'],
  },
  {
    name: 'Member Distributions',
    side: 'debit',
    min: 15000,
    max: 750000,
    descriptions: [
      'Quarterly distribution to members',
      'Tax distribution — estimated liability',
      'Preferred return payment — LP',
      'Carried interest distribution',
    ],
    accountCodes: ['3300', 'Uncoded'],
  },
  {
    name: 'Payroll Expense',
    side: 'debit',
    min: 3500,
    max: 42000,
    descriptions: [
      'Household staff payroll',
      'Estate manager salary',
      'Nanny & childcare payroll',
      'Private chef payroll',
      'Family office controller salary',
      'Payroll tax remittance',
    ],
    accountCodes: ['6100', 'Uncoded'],
  },
  {
    name: 'Travel & Entertainment',
    side: 'debit',
    min: 400,
    max: 28000,
    descriptions: [
      'Charter flight — family travel',
      'Commercial airfare — board meeting',
      'Hotel — property site visit',
      'Family retreat — Aspen',
      'Client entertainment — not applicable',
      'Vehicle lease — estate use',
    ],
    accountCodes: ['6600', 'Uncoded'],
  },
  {
    name: 'Bank Fees',
    side: 'debit',
    min: 25,
    max: 3500,
    descriptions: [
      'Wire transfer fee',
      'Monthly account maintenance',
      'Overdraft fee — timing difference',
      'Foreign exchange conversion fee',
      'Custody fee — investment account',
    ],
    accountCodes: ['6700', 'Uncoded'],
  },
  {
    name: 'Depreciation Expense',
    side: 'debit',
    min: 800,
    max: 45000,
    descriptions: [
      'Depreciation — residential rental',
      'Depreciation — aircraft',
      'Depreciation — art & collectibles framing',
      'Depreciation — commercial property',
      'Amortization — leasehold improvements',
    ],
    accountCodes: ['6800', 'Uncoded'],
  },
  {
    name: 'Charitable Contributions',
    side: 'debit',
    min: 5000,
    max: 250000,
    descriptions: [
      'Donation to family foundation',
      'DAF grant recommendation',
      'Matching gift — board pledge',
      'In-kind contribution — appreciated securities',
    ],
    accountCodes: ['6900', 'Uncoded'],
  },
  {
    name: 'Gift Tax Expense',
    side: 'debit',
    min: 50000,
    max: 500000,
    descriptions: [
      'Gift tax payment — Form 709',
      'Generation-skipping transfer tax',
      'Gift tax — annual exclusion true-up',
    ],
    accountCodes: ['6910', 'Uncoded'],
  },
  {
    name: 'Accounts Payable',
    side: 'both',
    min: 1000,
    max: 85000,
    descriptions: [
      'Invoice accrual — legal services',
      'Vendor payment — property maintenance',
      'Accrued management fee',
      'Payment — outstanding AP balance',
    ],
    accountCodes: ['2000', 'Uncoded'],
  },
  {
    name: 'Prepaid Expenses',
    side: 'debit',
    min: 2000,
    max: 75000,
    descriptions: [
      'Amortization of prepaid — monthly',
    ],
    accountCodes: ['1300', 'Uncoded'],
  },
]

const VENDOR_TAGS: RegisterTag[] = [
  { label: 'J.P. Morgan Private Bank', variant: 'blue' },
  { label: 'Goldman Sachs PWM', variant: 'blue' },
  { label: 'Northern Trust', variant: 'blue' },
  { label: 'PwC', variant: 'blue' },
  { label: 'EY', variant: 'blue' },
  { label: 'KPMG', variant: 'blue' },
  { label: 'Deloitte', variant: 'blue' },
  { label: 'Cravath, Swaine & Moore', variant: 'blue' },
  { label: 'Kirkland & Ellis', variant: 'blue' },
  { label: 'Latham & Watkins', variant: 'blue' },
  { label: 'State Farm', variant: 'blue' },
  { label: 'Geico Insurance', variant: 'blue' },
  { label: 'Allstate', variant: 'blue' },
  { label: 'Chubb', variant: 'blue' },
  { label: 'BlackRock', variant: 'blue' },
  { label: 'Blackstone', variant: 'blue' },
  { label: 'KKR', variant: 'blue' },
  { label: 'Related Party', variant: 'green' },
  { label: 'Deductible', variant: 'green' },
  { label: 'Non-Deductible', variant: 'green' },
  { label: 'Tax-Exempt', variant: 'green' },
  { label: '1031 Exchange', variant: 'green' },
  { label: 'Untagged', variant: 'gray' },
]

function pick<T>(rng: () => number, arr: readonly T[]): T {
  return arr[Math.floor(rng() * arr.length)]!
}

function randomAmount(rng: () => number, min: number, max: number): number {
  const raw = min + rng() * (max - min)
  return Math.round(raw * 100) / 100
}

function randomDate(rng: () => number, start: Date, end: Date): string {
  const startMs = start.getTime()
  const endMs = end.getTime()
  const ms = startMs + rng() * (endMs - startMs)
  return new Date(ms).toISOString().slice(0, 10)
}

const INSURANCE_EXPENSE_ACCOUNT = 'Insurance Expense'

const INSURANCE_DESCRIPTION_PATTERN =
  /\binsurance\b|\bliability premium\b|\bliab prem\b|^gl liability|\bpolicy premium\b|\bumbrella policy\b|\bworkers comp\b|\bfloater policy\b|\bhull & liability\b/i

function isInsuranceDescription(description: string): boolean {
  return INSURANCE_DESCRIPTION_PATTERN.test(description)
}

function getInsuranceExpenseAccount(): AccountDef {
  return ACCOUNTS.find((a) => a.name === INSURANCE_EXPENSE_ACCOUNT)!
}

function normalizeInsuranceAccount(tx: RegisterTransaction): RegisterTransaction {
  if (!isInsuranceDescription(tx.description)) return tx
  if (tx.account === INSURANCE_EXPENSE_ACCOUNT) return tx
  return { ...tx, account: INSURANCE_EXPENSE_ACCOUNT }
}

function buildInsuranceTags(rng: () => number): RegisterTag[] {
  const tags: RegisterTag[] = [
    pick(
      rng,
      VENDOR_TAGS.filter((t) => ['State Farm', 'Geico Insurance', 'Allstate', 'Chubb'].includes(t.label)),
    ),
  ]
  if (rng() < 0.4) {
    tags.push(pick(rng, VENDOR_TAGS.filter((t) => ['Deductible', 'Non-Deductible'].includes(t.label))))
  }
  return tags.slice(0, rng() < 0.15 ? 2 : 1)
}
function buildTags(
  rng: () => number,
  account: AccountDef,
  entity: string,
  description: string,
): RegisterTag[] {
  const tags: RegisterTag[] = []
  const isInsuranceLine =
    account.name === INSURANCE_EXPENSE_ACCOUNT || isInsuranceDescription(description)

  if (
    account.name.includes('Due To') ||
    account.name.includes('Due From') ||
    account.name.includes('Related') ||
    rng() < 0.12
  ) {
    tags.push({ label: 'Related Party', variant: 'green' })
  }

  if (isInsuranceLine) {
    return buildInsuranceTags(rng)
  }

  if (account.name.includes('Professional') && rng() < 0.6) {
    tags.push(
      pick(
        rng,
        VENDOR_TAGS.filter((t) =>
          ['PwC', 'EY', 'KPMG', 'Deloitte', 'Cravath, Swaine & Moore', 'Kirkland & Ellis', 'Latham & Watkins'].includes(t.label),
        ),
      ),
    )
  } else if (account.name.includes('Management') || account.name.includes('Investment')) {
    if (rng() < 0.5) {
      tags.push(
        pick(
          rng,
          VENDOR_TAGS.filter((t) =>
            ['J.P. Morgan Private Bank', 'Goldman Sachs PWM', 'Northern Trust', 'BlackRock', 'Blackstone', 'KKR'].includes(t.label),
          ),
        ),
      )
    }
  }

  if (account.name.includes('Expense') && rng() < 0.35) {
    tags.push(pick(rng, VENDOR_TAGS.filter((t) => ['Deductible', 'Non-Deductible'].includes(t.label))))
  }

  if (account.name.includes('Charitable') || entity.includes('Foundation') || entity.includes('Philanthropic')) {
    if (rng() < 0.7) tags.push({ label: 'Tax-Exempt', variant: 'green' })
  }

  const nonInsuranceVendors = VENDOR_TAGS.filter(
    (t) => !['State Farm', 'Geico Insurance', 'Allstate', 'Chubb'].includes(t.label),
  )

  if (tags.length === 0) {
    tags.push(rng() < 0.25 ? { label: 'Untagged', variant: 'gray' } : pick(rng, nonInsuranceVendors))
  }

  return tags.slice(0, rng() < 0.08 ? 2 : 1)
}

const GENERAL_LIABILITY_DESCRIPTION = 'General liability premium'
const REAL_ESTATE_HOLDINGS = 'Real Estate Holdings'

function makeInsuranceSeedLine(
  id: string,
  description: string,
  effectiveAt: string,
  amount: number,
  tags: RegisterTag[],
  accountCode: string = '6200',
): RegisterTransaction {
  return {
    id,
    entity: REAL_ESTATE_HOLDINGS,
    account: INSURANCE_EXPENSE_ACCOUNT,
    effectiveAt,
    debits: amount,
    credits: null,
    accountingAmount: amount,
    description,
    accountCode,
    tags,
  }
}

/** Hefty Insurance Expense block for demo filtering — Real Estate Holdings only */
function createRealEstateHoldingsInsuranceSeeds(): RegisterTransaction[] {
  const lines: RegisterTransaction[] = []

  const doAmounts = [
    28450.0, 31200.0, 26875.5, 35120.0, 29750.0, 42300.0, 18950.0, 33680.0, 27420.0, 39850.0,
    24560.0, 36790.0, 41250.0, 22100.0, 28900.0, 45320.0, 31840.0, 26550.0, 38475.0, 33120.0,
  ]
  const doDates = [
    '2024-03-15', '2024-05-22', '2024-07-08', '2024-09-14', '2024-11-30',
    '2025-01-18', '2025-03-04', '2025-04-21', '2025-06-09', '2025-08-27',
    '2025-10-11', '2025-12-03', '2026-01-20', '2026-02-28', '2026-03-17',
    '2026-04-25', '2026-05-08', '2026-05-19', '2026-06-02', '2026-06-24',
  ]
  const doTags: RegisterTag[] = [
    { label: 'Chubb', variant: 'blue' },
    { label: 'Chubb', variant: 'blue' },
    { label: 'Deductible', variant: 'green' },
    { label: 'Chubb', variant: 'blue' },
    { label: 'State Farm', variant: 'blue' },
    { label: 'Chubb', variant: 'blue' },
    { label: 'Chubb', variant: 'blue' },
    { label: 'Deductible', variant: 'green' },
    { label: 'Chubb', variant: 'blue' },
    { label: 'Chubb', variant: 'blue' },
    { label: 'State Farm', variant: 'blue' },
    { label: 'Chubb', variant: 'blue' },
    { label: 'Chubb', variant: 'blue' },
    { label: 'Deductible', variant: 'green' },
    { label: 'Chubb', variant: 'blue' },
    { label: 'Chubb', variant: 'blue' },
    { label: 'Chubb', variant: 'blue' },
    { label: 'State Farm', variant: 'blue' },
    { label: 'Chubb', variant: 'blue' },
    { label: 'Deductible', variant: 'green' },
  ]

  doAmounts.forEach((amount, i) => {
    lines.push(
      makeInsuranceSeedLine(
        `seed-reh-do-${i}`,
        'D&O insurance premium',
        doDates[i]!,
        amount,
        [doTags[i]!],
      ),
    )
  })

  const autoAmounts = [
    1245.6, 987.35, 1567.8, 2103.45, 892.0, 1789.25, 1340.5, 2456.9, 1122.75, 1890.0,
    1567.3, 998.6, 2234.15, 1456.8, 1678.4,
  ]
  const autoDates = [
    '2025-01-08', '2025-02-12', '2025-03-06', '2025-04-19', '2025-05-03',
    '2025-06-14', '2025-07-22', '2025-08-30', '2025-09-17', '2025-10-25',
    '2025-11-11', '2025-12-08', '2026-01-15', '2026-03-02', '2026-04-18',
  ]
  const autoTags: RegisterTag[] = [
    { label: 'Geico Insurance', variant: 'blue' },
    { label: 'Allstate', variant: 'blue' },
    { label: 'Geico Insurance', variant: 'blue' },
    { label: 'Geico Insurance', variant: 'blue' },
    { label: 'Allstate', variant: 'blue' },
    { label: 'Deductible', variant: 'green' },
    { label: 'Geico Insurance', variant: 'blue' },
    { label: 'Allstate', variant: 'blue' },
    { label: 'Geico Insurance', variant: 'blue' },
    { label: 'Geico Insurance', variant: 'blue' },
    { label: 'Allstate', variant: 'blue' },
    { label: 'Geico Insurance', variant: 'blue' },
    { label: 'Geico Insurance', variant: 'blue' },
    { label: 'Allstate', variant: 'blue' },
    { label: 'Deductible', variant: 'green' },
  ]

  autoAmounts.forEach((amount, i) => {
    lines.push(
      makeInsuranceSeedLine(
        `seed-reh-auto-${i}`,
        'Auto insurance premium',
        autoDates[i]!,
        amount,
        [autoTags[i]!],
        i % 4 === 0 ? '6210' : 'Uncoded',
      ),
    )
  })

  const propertyAmounts = [8750.0, 12340.0, 6890.5, 15820.0, 9425.0, 11200.0, 18650.0]
  const propertyDates = [
    '2024-06-01', '2024-12-01', '2025-06-01', '2025-12-01', '2026-01-15', '2026-03-01', '2026-06-01',
  ]
  const propertyTags: RegisterTag[] = [
    { label: 'Allstate', variant: 'blue' },
    { label: 'State Farm', variant: 'blue' },
    { label: 'Allstate', variant: 'blue' },
    { label: 'Allstate', variant: 'blue' },
    { label: 'State Farm', variant: 'blue' },
    { label: 'Allstate', variant: 'blue' },
    { label: 'Deductible', variant: 'green' },
  ]

  propertyAmounts.forEach((amount, i) => {
    lines.push(
      makeInsuranceSeedLine(
        `seed-reh-prop-${i}`,
        'Property insurance premium',
        propertyDates[i]!,
        amount,
        [propertyTags[i]!],
      ),
    )
  })

  const glDescriptions = [
    'General liability premium',
    'General liability premium',
    'GL liability premium',
    'Gen Liab prem — annual renewal',
    'Gen Liab prem — Q2 installment',
    'General liability premium',
    'GL liability premium',
    'General liability premium',
    'Gen Liab prem — annual renewal',
    'General liability premium',
    'GL liability premium',
    'General liability premium',
  ]
  const glAmounts = [
    3245.0, 2890.5, 4120.75, 3567.2, 2789.0, 4450.0, 3012.6, 2678.9, 3890.25, 3345.8, 2956.4, 4180.0,
  ]
  const glDates = [
    '2024-04-10', '2024-08-22', '2024-11-05', '2025-02-14', '2025-05-30',
    '2025-08-18', '2025-11-02', '2026-01-28', '2026-03-11', '2026-04-07',
    '2026-05-15', '2026-06-20',
  ]
  const glTags: RegisterTag[] = [
    { label: 'Chubb', variant: 'blue' },
    { label: 'State Farm', variant: 'blue' },
    { label: 'Chubb', variant: 'blue' },
    { label: 'Allstate', variant: 'blue' },
    { label: 'Geico Insurance', variant: 'blue' },
    { label: 'Chubb', variant: 'blue' },
    { label: 'State Farm', variant: 'blue' },
    { label: 'Geico Insurance', variant: 'blue' },
    { label: 'Allstate', variant: 'blue' },
    { label: 'Chubb', variant: 'blue' },
    { label: 'Deductible', variant: 'green' },
    { label: 'Geico Insurance', variant: 'blue' },
  ]

  glAmounts.forEach((amount, i) => {
    lines.push(
      makeInsuranceSeedLine(
        `seed-reh-gl-${i}`,
        glDescriptions[i]!,
        glDates[i]!,
        amount,
        [glTags[i]!],
        i % 3 === 0 ? '6200' : 'Uncoded',
      ),
    )
  })

  return lines
}

/** General liability lines spread across other entities for broader register volume */
function createGeneralLiabilitySeedTransactions(): RegisterTransaction[] {
  const seedEntities = [
    'Peninsula Real Estate Holdings',
    'Parents',
    'Family Trust',
    'Oakwood Holdings LLC',
    'Maple Street Properties LLC',
    'Highland Park Residence LLC',
    'Eastside Commercial LLC',
    'Summit Family Office LLC',
    'Whitmore Dynasty Trust',
    'Lakeside Ranch LP',
    'Coastal Vineyard LLC',
    'Riverstone Development LLC',
    'Bayview Marina LLC',
    'Silverleaf Hospitality LLC',
    'Northgate Management LLC',
  ] as const

  const amounts = [2418.45, 3191.87, 2089.8, 3890.1, 3078.25, 2666.4, 3456.0, 2295.6, 2892.9, 3012.8, 2789.3, 2345.5, 3578.9, 1987.7, 4220.0, 3350.25]
  const dates = [
    '2026-04-12', '2026-04-15', '2026-05-09', '2026-05-12', '2026-05-22',
    '2026-05-28', '2026-06-01', '2026-06-05', '2026-06-10', '2026-06-14',
    '2026-06-18', '2026-06-22', '2026-06-25', '2026-06-28', '2026-07-01', '2026-07-04',
  ]
  const vendors: RegisterTag[] = [
    { label: 'State Farm', variant: 'blue' },
    { label: 'Geico Insurance', variant: 'blue' },
    { label: 'Chubb', variant: 'blue' },
    { label: 'Deductible', variant: 'green' },
  ]

  return seedEntities.map((entity, i) => {
    const amount = amounts[i]!
    return {
      id: `seed-gl-${i}`,
      entity,
      account: INSURANCE_EXPENSE_ACCOUNT,
      effectiveAt: dates[i]!,
      debits: amount,
      credits: null,
      accountingAmount: amount,
      description: GENERAL_LIABILITY_DESCRIPTION,
      accountCode: i % 3 === 0 ? '6200' : 'Uncoded',
      tags: [vendors[i % vendors.length]!],
    }
  })
}

export function generateRegisterTransactions(count: number, seed = 42): RegisterTransaction[] {
  const rng = mulberry32(seed)
  const startDate = new Date('2024-01-01')
  const endDate = new Date('2026-07-12')
  const transactions: RegisterTransaction[] = [
    ...createRealEstateHoldingsInsuranceSeeds(),
    ...createGeneralLiabilitySeedTransactions(),
  ]

  for (let i = 0; i < count; i++) {
    let account = pick(rng, ACCOUNTS)
    let description = pick(rng, account.descriptions)

    if (isInsuranceDescription(description)) {
      account = getInsuranceExpenseAccount()
      if (!account.descriptions.includes(description)) {
        description = pick(rng, account.descriptions)
      }
    }

    const entity = pick(rng, ENTITIES)
    const amount = randomAmount(rng, account.min, account.max)

    const accountCode = pick(rng, account.accountCodes)

    let debits: number | null = null
    let credits: number | null = null
    let accountingAmount: number

    if (account.side === 'debit') {
      debits = amount
      accountingAmount = amount
    } else if (account.side === 'credit') {
      credits = amount
      accountingAmount = -amount
    } else {
      if (rng() < 0.55) {
        debits = amount
        accountingAmount = amount
      } else {
        credits = amount
        accountingAmount = -amount
      }
    }

    transactions.push({
      id: String(i + 1),
      entity,
      account: account.name,
      effectiveAt: randomDate(rng, startDate, endDate),
      debits,
      credits,
      accountingAmount,
      description,
      accountCode,
      tags: buildTags(rng, account, entity, description),
    })
  }

  const normalized = transactions.map(normalizeInsuranceAccount)

  // Sort by date descending — how accountants typically scan recent activity first
  normalized.sort((a, b) => b.effectiveAt.localeCompare(a.effectiveAt))

  // Re-assign IDs after sort so row ids stay stable for selection
  normalized.forEach((tx, index) => {
    tx.id = String(index + 1)
  })

  return normalized
}

export { ENTITIES, ACCOUNTS }
