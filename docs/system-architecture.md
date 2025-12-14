# System Architecture

## Overview
The JIA Integrated Management System is a full-stack, role-aware platform that tracks attendance, payroll, inventory, and e-wallet transactions for store operations. It follows a classic three-tier architecture with optional synchronization to a PostgreSQL backend.

```
┌──────────────┐      REST/HTTPS      ┌───────────────┐       SQL       ┌───────────────┐
│ React Client │  ─────────────────▶  │ Express Server │  ─────────────▶ │ SQLite / Post │
│  (Browser)   │  ◀─────────────────  │  Controllers   │  ◀───────────── │   Database    │
└──────────────┘      JSON APIs      └───────────────┘   Transactions   └───────────────┘
                      AuthContext ↕  attendance, etc.                     Sync scripts
```

## Layered Architecture

- **Presentation Layer**
  - React + TypeScript SPA under `client/`
  - Pages: dashboard, inventory, employees, e-wallet, settings
  - Global auth/session via `AuthContext`
  - Axios talks to `http://localhost:3001/api/*`
- **Application Layer**
  - Node.js + Express routes (`server/src/routes`)
  - Controllers and services enforce domain logic (attendance, payroll, e-wallet)
  - Utilities (`timeUtils`, `dbHelper`) standardize PH timestamps and DB access
- **Data Layer**
  - SQLite primary datastore (tables provisioned in `initSQLite.js`)
  - Optional PostgreSQL mirror (`initPostgres.js`) for reporting or cloud backup
  - `dbSyncService.js` and `db/sync.ts` keep both databases consistent (timestamps preserved, soft deletes handled)
- **Background / Desktop Wrapper**
  - Electron shell (`electron/main.ts`) packages client + server for desktop deployment
  - Sync services can run on interval for offline-first setups

## Data Flow Diagram (DFD – Level 1)

```
Employee ──Check-in/out──▶ React UI ──REST──▶ Attendance Route ──SQL──▶ Attendance Table
   │                            │                       │                       │
   │         Dashboard data ◀───┘                       └──Sync service──────────┘
   │
Manager/Admin ──Queries/updates──▶ Inventory & Payroll APIs ──▶ Respective tables
```

1. Users authenticate/check-in from the dashboard; React sends credentials to `/api/attendance/checkin`.
2. Express validates credentials, records `time_in`, and returns status via JSON.
3. Checkout updates the latest attendance record’s `time_out`.
4. Dashboard pulls aggregated data (inventory levels, sales, payroll, e-wallet balances) through dedicated endpoints.
5. Optional sync job pushes/pulls records between SQLite and PostgreSQL, preserving timestamps and soft-delete markers.

## Context Diagram

```
                       ┌─────────────────────────┐
                       │   Store Employees       │
                       │ - Check in/out          │
                       │ - View schedules        │
                       └──────────┬──────────────┘
                                  │
                                  │ React SPA / Electron
                                  ▼
┌──────────────────────────────────────────────────────────────┐
│          JIA Integrated Management System (JIMS)              │
│  - Attendance, Payroll, Inventory, E-wallet modules           │
│  - Role-based access (Admin, GM, IM, E-wallet recorder, ITM)  │
│  - AuthContext session handling                              │
└──────────┬─────────────────────────────┬──────────────────────┘
           │                             │
           │                             │
           ▼                             ▼
┌──────────────────────┐       ┌──────────────────────────┐
│ Store Management     │       │ Optional External DB     │
│ - Approve payroll    │       │ - PostgreSQL replica     │
│ - Monitor dashboards │       │ - Reporting / backup     │
└──────────────────────┘       └──────────────────────────┘
```

## Hardware & Software Requirements

| Component              | Minimum Specs / Dependencies                            |
|-----------------------|----------------------------------------------------------|
| **Client (Developer)**| OS Win 10/11, macOS, or Linux; Node.js ≥ 18; npm/yarn; 4 GB RAM; modern browser |
| **Server**            | Same OS support; Node.js ≥ 18; 4 GB RAM; dual-core CPU; SQLite (bundled); optional PostgreSQL 13+ |
| **Runtime Tools**     | TypeScript, React 18, Tailwind, axios, Express, bcryptjs, sqlite3/pg drivers |
| **Deployment**        | HTTP port 3000 (client) & 3001 (server) configurable via env vars |
| **Optional Desktop**  | Electron builder; same Node.js toolchain; packaging scripts |
| **Sync/Background**   | Cron/interval capable host to run `dbSyncService` or `electron` scheduler |

### Notes
- All timestamps are normalized to Asia/Manila (UTC+8) using `timeUtils` to keep attendance consistent regardless of host locale.
- Attendance check-in prevents duplicates per day; checkout always updates the most recent record.
- Soft-delete pattern keeps historical data, while sync scripts respect `deleted_at` fields to avoid data loss.



