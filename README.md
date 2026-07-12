# Baquera-SumIt Take Home Project

A React + TypeScript register page built for the SumIt take-home exercise. It recreates a ledger-style transaction register with composable search filters, an AG Grid data table, and multi-row tagging.

## Features

- **Composable filters** — Search and filter transactions by field (account, date, amount, tags, and more) with contextual suggestion counts
- **Custom date picking** — Relative and custom date range filters
- **AG Grid register** — Sortable, groupable transaction grid with account grouping and custom cell renderers
- **Multi-row tagging** — Select rows and apply tags in bulk via a tag dialog
- **Selection-aware toolbar** — Actions update based on the number of selected transactions

## Tech Stack

- React 19 + TypeScript
- Vite
- Tailwind CSS 4
- AG Grid Community & Enterprise
- date-fns

## Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

## Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start the development server |
| `npm run build` | Type-check and build for production |
| `npm run preview` | Preview the production build |
| `npm run lint` | Run Oxlint |

## Project Structure

```
src/
├── components/
│   ├── filters/     # Composable search and filter chips
│   ├── grid/        # AG Grid table, cell renderers, tagging dialog
│   ├── navigation/  # Sidebar and ledger tabs
│   └── ui/          # Shared UI primitives
├── data/            # Mock transaction data and generator
├── layouts/         # App shell and page layout
└── lib/             # Filter/search logic
```
