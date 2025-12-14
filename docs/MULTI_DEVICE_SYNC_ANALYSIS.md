# Multi-Device Sync Architecture Analysis

## Executive Summary

Your bidirectional sync system has **moderate robustness for multi-device scenarios** with **several critical vulnerabilities**:

- ✅ **Strengths**: Push-first strategy, soft-delete support, last-write-wins conflict resolution
- ⚠️ **Moderate Risk**: Race conditions during concurrent syncs, no distributed locking
- ❌ **Critical Issues**: No conflict detection beyond updated_at, non-deterministic merge behavior, transaction scope issues

**Recommendation**: Add **distributed locking** (Redis) and **explicit conflict resolution** before deploying to 3+ devices.

---

## 1. Current Architecture Overview

```
┌─────────────────┐         Sync Every 5min         ┌──────────────────┐
│  Device A       │◄──────────────────────────────►│  PostgreSQL      │
│  (SQLite Local) │  PUSH unsynced (synced=0)      │  (Remote Truth)  │
└─────────────────┘  PULL updated (since last_sync)└──────────────────┘
        │
        │ Same sync
        │ service
        │
┌─────────────────┐  Sync Every 5min   ┌──────────────────┐
│  Device B       │◄──────────────────►│  (same Postgres) │
│  (SQLite Local) │  PUSH unsynced      └──────────────────┘
└─────────────────┘  PULL updated
```

### Sync Flow (Per Device, Every 5 Minutes)
1. **PUSH**: Query unsynced (synced=0 or NULL) SQLite records → Normalize timestamps → INSERT/UPDATE Postgres
2. **PULL**: Query Postgres records changed since last sync → Merge into SQLite → Mark synced=1

---

## 2. Conflict Resolution Mechanism

### Current Strategy: "Last-Write-Wins" via `updated_at`

**Pull Phase (dbSyncService.js, lines ~700-1200)**:
```javascript
// Query from PostgreSQL - implicitly last record wins
const pgResult = await pool.query(`
  SELECT * FROM ${tableName} 
  WHERE updated_at > $1  // ← Only checks timestamp
  AND deleted_at IS NULL
  ORDER BY updated_at DESC  // ← Sorting by updated_at
  LIMIT 1000
`, [lastSyncTime]);
```

**Issue**: No comparison of SQLite's `updated_at` vs Postgres's `updated_at`
- If Device A modifies `attendance.time_in` locally (synced=0)
- Then Device B modifies same record in Postgres during Device A's PULL phase
- Device A **silently overwrites** its local change with Device B's version

### Critical Flaw: Unsynced Records Priority

In the update logic (lines ~1800-2100):
```javascript
// If record exists and is unsynced (synced = 0), skip overwriting it
if (existing.length > 0) {
  if (syncedValue === 0 || syncedValue === '0') {
    console.log(`Skipping ${tableName} record - has unsynced local changes`);
    continue;  // ← GOOD: Don't overwrite unsynced local
  }
}
```

**Positive**: Unsynced records ARE protected during PULL.

**Negative**: Only true for PULL. During PUSH, if two devices create same employee simultaneously:
- Device A: Creates `emp_id='EMP999'` locally (id=100, synced=0)
- Device B: Creates same `emp_id='EMP999'` locally (id=50, synced=0)
- When Device A pushes: INSERT succeeds with id=100
- When Device B pushes: INSERT fails (UNIQUE constraint on emp_id)
- Device B's PUSH handler catches error, **tries UPDATE** instead (line ~2090)

**Result**: Both devices think they created new employee but only one id is tracked.

---

## 3. Multi-Device Race Conditions

### Scenario 1: Concurrent PUSH Operations (Same Table, Different Records)

**Timeline**:
```
10:00:00 Device A starts sync
          - PUSH: attendance record 1 (time_in: 10:15)
          - PostgreSQL receives INSERT
          
10:00:05 Device B starts sync
          - PUSH: attendance record 2 (time_in: 10:20)
          - PostgreSQL receives INSERT
          
10:00:10 Device A continues with PULL
          - Queries Postgres with last_sync_time = 10:00:00
          - Finds Device B's record 2
          - Inserts into SQLite
          
10:00:15 Device B continues with PULL
          - Queries Postgres with last_sync_time = 09:55:00
          - Finds Device A's record 1
          - Inserts into SQLite

✅ RESULT: Both devices converge correctly
```

**Verdict**: Safe for **independent records** (different employees, dates).

---

### Scenario 2: Concurrent PUSH Operations (Same Record, Different Fields)

**Timeline**:
```
10:00:00 Device A: User checks in emp_id=EMP001
          - SQLite: attendance id=27, time_in='2025-12-13T10:00Z', synced=0
          
10:00:05 Device B: User checks out emp_id=EMP001 (same device or shared account)
          - SQLite: attendance id=27, time_out='2025-12-13T17:00Z', synced=0
          
10:00:10 Device A runs sync PUSH
          - Fetches id=27 from SQLite (has time_in, time_out is NULL)
          - normalizeTimestampForPush(time_in) → UTC ISO ✓
          - normalizeTimestampForPush(time_out=NULL) → NULL ✓
          - Updates Postgres: time_in='...', time_out=NULL
          - Device A marks synced=1
          
10:00:15 Device B runs sync PUSH
          - Fetches id=27 from SQLite (now has time_out only)
          - BUT: Device A already synced time_in!
          - Problem: Which version is "correct"?
          
          Option 1: Device B overwrites time_in with NULL (✗ Data loss!)
          Option 2: Device B preserves time_in (✓ Safe but requires logic)
```

**Current Code Behavior** (lines ~1900-2000):
```javascript
// When updating existing Postgres record:
const updateFields = availableFields
  .filter(f => f !== idField && f !== 'synced' && f !== 'updated_at')
  .map(f => `${f} = ?`);
// ↑ This REPLACES all fields with SQLite values!
// If SQLite.time_out is NULL but Postgres.time_in is NOT NULL,
// the NULL from time_out field doesn't touch time_in, BUT
// all other provided fields are overwritten.
```

**Verdict**: **Unsafe** for concurrent edits on same record by multiple devices.

---

### Scenario 3: Delete-After-Sync Race

**Timeline**:
```
10:00:00 Device A (offline): Creates payroll record emp_id=EMP001, Dec 2024
         - SQLite: synced=0, deleted_at=NULL
         
10:05:00 Device A comes online, pushes to Postgres
         - Record created in Postgres, Device A marks synced=1
         
10:05:05 Device B (online continuously): Sees same payroll record in Postgres
         - Device B runs PULL, inserts into SQLite, synced=1
         
10:05:10 Device B user deletes the payroll record
         - SQLite: deleted_at='2025-12-13T10:05:10Z', synced=0
         - Device B starts PUSH DELETE
         - Postgres: UPDATE ... SET deleted_at=... WHERE ...
         - SQLite Device B: synced=1
         
10:05:15 Device A pulls from Postgres
         - Sees deleted_at is set in Postgres record
         - Soft-deletes in SQLite too ✓
         - RESULT: Data converges correctly
         
BUT: What if Device A modifies the payroll record AFTER pushing but BEFORE pulling?
```

**Sub-scenario: Write-After-Push-Before-Pull**:
```
10:00:00 Device A: Creates payroll record, synced=0
10:00:05 Device A: Pushes to Postgres, synced=1
10:00:10 Device A: User manually edits payroll amount → synced=0 (marked again)
10:00:15 Device B: Pulls from Postgres (sees Device A's CREATE but not EDIT yet)
10:00:20 Device A: Runs PULL
         - Postgres has Device B's version (potentially newer created_at?)
         - Device A's local edit (synced=0) is NOT overwritten (good!)
         - Device A still has local edit pending

RESULT: Device A will push again at next sync → OK
```

**Verdict**: **Mostly safe** for soft deletes, but depends on `synced` flag integrity.

---

### Scenario 4: CRITICAL - Payroll Record Conflict

**Problem**: Payroll records use **composite key** (emp_id, month, year) not single `id`.

**Timeline**:
```
10:00:00 Device A: Creates payroll emp_id=EMP001, Dec=12, Year=2024, synced=0
         - SQLite id=100, Postgres id=500
         
10:00:05 Device B: Creates same payroll emp_id=EMP001, month='December', year=2024, synced=0
         - SQLite id=101, Postgres id=501
         
10:00:10 Device A: PUSH
         - Checks: SELECT FROM payroll WHERE emp_id=EMP001 AND month=12 AND year=2024
         - Postgres returns id=501 (Device B's record!)
         - Device A UPDATE id=501 with its data → Device B's record overwritten ✗
         
10:00:15 Device B: PUSH
         - Checks: SELECT FROM payroll WHERE emp_id=EMP001 AND month='December' AND year=2024
         - Postgres might return id=500 now (after Device A's update)
         - Device B UPDATE id=500 → Back to Device B's data
         - OR INSERT fails because emp_id+month+year unique constraint ✗
```

**Code Evidence** (lines ~1740-1760):
```javascript
if (tableName === 'payroll_records') {
  pgCheck = await pgPool.query(
    `SELECT ${idField} FROM payroll_records 
     WHERE emp_id = $1 AND month = $2 AND year = $3 AND deleted_at IS NULL`,
    [mappedRecord.emp_id, monthValue, yearValue]
  );
  
  if (pgCheck.rows.length > 0) {
    // UPDATE (no conflict check on created_at/updated_at!)
    // Whoever pushed last wins completely
  }
}
```

**Verdict**: **CRITICAL FLAW** - Last-device-to-push overwrites first device's entire payroll record.

---

## 4. Sync Metadata and Tracking Issues

### Issue 4.1: Shared `last_sync_time` Across Devices

**Current Code** (lines ~300-320):
```javascript
// Each device maintains its OWN SQLite database
// last_sync_time is stored in SQLite sync_metadata table
SELECT last_sync FROM sync_metadata WHERE table_name = 'attendance';
// ↑ Each Device has different last_sync!

// Device A: last_sync = 10:00:00 (last time Device A synced)
// Device B: last_sync = 09:55:00 (last time Device B synced)
// Device C: last_sync = 09:30:00 (Device C hasn't synced in a while)
```

**Impact**:
- Device A pushes changes at 10:05
- Device B's PULL uses its own last_sync=09:55 (10 minutes behind!)
- Device B might miss Device C's changes if Device C hasn't pushed yet

**Is This Safe?**
```
YES, because:
1. PUSH phase goes to Postgres first (source of truth)
2. PULL phase queries Postgres by updated_at > last_sync
3. Each device's last_sync only affects its own PULL window
4. No harm if pull window is stale - just re-pulls data
```

**Verdict**: **Safe but suboptimal** - Can lead to repeated pulls of same data.

---

### Issue 4.2: `synced` Flag Corruption on Restart

**Scenario**:
```
10:00:00 Device A: Checks in (synced=0 in SQLite)
10:00:05 Device A: Pushes to Postgres successfully
         - Updates SQLite: synced=1
         - Network interrupt before SQLite update completes!
         
10:00:10 Device A: Restarts (crashes)
         - Reads SQLite: attendance record still has synced=0
         - On next sync: re-pushes same record
         - Postgres already has it: UPDATE instead of INSERT
         - Result: Duplicate timestamps? Or correct behavior?
```

**Code Check** (line ~1725):
```javascript
// During PUSH, for each unsynced record:
const unsyncedRecords = await sqliteAll(
  `SELECT * FROM ${tableName} WHERE (synced = 0 OR synced IS NULL)`
);
// If process crashes before UPDATE synced=1:
// Next sync will re-process same record
// Since UPDATE to Postgres uses existing pgCheck.rows.length > 0,
// it will UPDATE not INSERT → Safe!
```

**Verdict**: **Safe** - Re-processing is idempotent (UPDATE vs INSERT).

---

## 5. Data Loss Scenarios

### Scenario 5.1: Device Goes Offline Indefinitely

**Timeline**:
```
Day 1:   Device A checks in: emp_id=EMP001, time_in='10:00', synced=0
Day 2:   Device A offline (network down)
         Other devices work: Device B, C make changes
         Postgres is updated by Devices B, C
Day 5:   Device A comes back online with SAME check-in record (still synced=0)
         Device A runs PUSH
         - Inserts/Updates record in Postgres
         BUT: timestamp is from Day 1!
         - Device B's updates (Days 2-4) in same employee's records remain
         - Device A's outdated time_in overwrites any concurrent updates? NO!
         
         Why NO data loss:
         - Check-in records are per employee+date
         - Device A's record doesn't overlap Device B's (different times/days)
         - Composite key (emp_id, date) ensures isolation
```

**Verdict**: **Safe** - Different records are isolated.

---

### Scenario 5.2: Concurrent Deletes

**Timeline**:
```
10:00:00 Device A sees payroll record emp_id=EMP001, Dec 2024
         - Decides to delete it: deleted_at='2025-12-13T10:00Z', synced=0
         
10:00:05 Device B sees SAME payroll record
         - User also deletes it: deleted_at='2025-12-13T10:00:05Z', synced=0
         
10:00:10 Device A PUSH DELETE
         - Updates Postgres: SET deleted_at='2025-12-13T10:00Z'
         - Sets synced=1 in SQLite
         
10:00:15 Device B PUSH DELETE
         - Updates Postgres: SET deleted_at='2025-12-13T10:00:05Z'
         - (Overwrites Device A's timestamp with newer one)
         - Sets synced=1 in SQLite
         
10:00:20 Both devices PULL
         - See deleted_at is set in Postgres
         - Soft-delete in SQLite
         - RESULT: Converges to both having deleted_at (safe)
         
BUT: The `deleted_at` value is Device B's version (later timestamp)
     Device A's original delete intent is lost
     → Is this a data loss? Not really (soft delete is the goal)
     → More of an audit trail loss
```

**Verdict**: **Safe** for soft deletes - Actual data isn't lost, just version timestamp.

---

## 6. Transaction Isolation Issues

### Issue 6.1: No Distributed Transactions

**Problem**:
```
PostgreSQL transaction: BEGIN ... UPDATE ... COMMIT
SQLite transaction: BEGIN ... UPDATE ... COMMIT

These are INDEPENDENT! If Postgres commits but SQLite fails:
- Postgres has updated data
- SQLite is stale
- Next sync will re-push (idempotent, but confusing)
```

**Code Check** (lines ~1735-1800):
```javascript
// PUSH: One transaction per device
await sqliteRun(`UPDATE ${tableName} SET synced=1`);  // SQLite transaction
await pgPool.query(`UPDATE ${tableName} SET ...`);    // Postgres transaction
// ↑ No coordination!

// If SQLite update fails after Postgres update:
// SQLite still has synced=0
// Next sync: Device A re-pushes
// Postgres: Already has data, does UPDATE again
// Result: Idempotent but inefficient (OK)
```

**Verdict**: **Safe but not ACID** - Idempotent because of UPDATE-if-exists logic.

---

### Issue 6.2: PULL Phase Rollback

**Code** (lines ~440-480):
```javascript
// For each record from Postgres:
for (const row of allRecordsToSync) {
  try {
    // Insert or update SQLite
    await sqliteRun(`INSERT OR UPDATE INTO ${tableName} ...`);
  } catch (err) {
    // Continue with next record!
    // Previous records already inserted
  }
}
// ↑ Partial pull! Some records synced, some not!
```

**Impact**:
- Device A pulls 100 records
- Record 50 has foreign key error (employee deleted)
- Records 1-49 inserted, records 51-100 continue
- **Inconsistent state**: Device A has partial sync

**Verdict**: **Moderate Risk** - Can leave device in inconsistent state if some records fail.

---

## 7. Verdict Matrix: Multi-Device Safety

| Scenario | Devices | Risk | Issue |
|----------|---------|------|-------|
| Independent records (different emp/date) | 2-5 | ✅ LOW | Safe |
| Same record, different fields | 2 | ⚠️ MEDIUM | Last-write-wins overwrites |
| Payroll composite key conflicts | 2+ | ❌ HIGH | Overwrites entire record |
| Delete conflicts | 2+ | ✅ LOW | Soft deletes converge |
| Offline-then-sync | 1 → 2 | ✅ LOW | Idempotent re-push |
| Network partition (2 subnets) | 2+ | ⚠️ MEDIUM | Postgres unreachable |
| Cascading deletes | 3+ | ⚠️ MEDIUM | Foreign key issues |

---

## 8. Specific Issues to Address

### Issue #1: Payroll Composite Key Race (CRITICAL)

**Problem**: Two devices creating same (emp_id, month, year) simultaneously overwrite each other.

**Fix**:
```javascript
// In pushTableToPostgres, for payroll_records:
// Use PostgreSQL UPSERT instead of check-then-update

const upsertSql = `
  INSERT INTO payroll_records (emp_id, month, year, ...)
  VALUES ($1, $2, $3, ...)
  ON CONFLICT (emp_id, month, year) DO UPDATE SET
    amount = EXCLUDED.amount,
    ... (other fields)
    updated_at = CURRENT_TIMESTAMP
  WHERE payroll_records.updated_at < EXCLUDED.updated_at
  // ↑ Only update if incoming record is NEWER
`;
```

### Issue #2: Concurrent Edits on Same Record (HIGH)

**Problem**: Device A pushes time_in, Device B pushes time_out, last-one-wins.

**Fix**: Implement **field-level versioning**:
```javascript
// For each field, track when it was last modified
attendance {
  id: 27,
  time_in: '2025-12-13T10:00Z',
  time_in_updated_by: 'Device_A',
  time_in_updated_at: '2025-12-13T10:00Z',
  time_out: '2025-12-13T17:00Z',
  time_out_updated_by: 'Device_B',
  time_out_updated_at: '2025-12-13T17:00Z',
}

// During merge, accept both:
Postgres result: {time_in, time_in_updated_at, time_out, time_out_updated_at}
SQLite result: {time_in, time_in_updated_at, time_out, time_out_updated_at}
→ Merge: Take newer version of each field independently
```

### Issue #3: No Distributed Locking (MEDIUM)

**Problem**: Two devices can start PUSH at exact same millisecond, both fetch existing Postgres record, both UPDATE.

**Fix**: Use Redis for distributed lock:
```javascript
const lockKey = `sync:lock:${tableName}:${empId}:${month}:${year}`;
const locked = await redisClient.set(lockKey, deviceId, 'NX', 'EX', 30);

if (!locked) {
  console.log('Another device is syncing this record, waiting...');
  await delay(random(1000, 5000));
  return retrySync();  // Retry after random backoff
}

try {
  // Do sync work
} finally {
  await redisClient.del(lockKey);
}
```

### Issue #4: Partial PULL Failures (MEDIUM)

**Problem**: If one record fails to insert, PULL continues leaving device inconsistent.

**Fix**: Wrap pull in transaction:
```javascript
const transaction = await sqliteDb.beginTransaction();
try {
  for (const record of allRecordsToSync) {
    await transaction.run(`INSERT ...`);
  }
  await transaction.commit();
} catch (err) {
  await transaction.rollback();
  throw err;  // Entire PULL fails, nothing partially synced
}
```

---

## 9. Deployment Recommendations

### ✅ Safe Now:
- 2 devices with **independent** attendance records (different employees/dates)
- Payroll reads (no concurrent creates of same emp_id/month/year)
- Soft deletes

### ⚠️ Test Before Deploying:
- 2 devices with **same** employee's check-in (concurrent time_in/time_out)
- 3+ devices creating payroll records simultaneously
- Network partition (Postgres unreachable) recovery

### ❌ DO NOT DEPLOY:
- 5+ devices in high-concurrency environment without distributed locking
- Production payroll reconciliation until composite key upsert is fixed
- Zero-downtime schema migrations without version coordination

---

## 10. Implementation Priority

| Priority | Issue | Effort | Impact |
|----------|-------|--------|--------|
| 🔴 P0 | Payroll composite key UPSERT | 4 hours | **Prevents data loss** |
| 🟠 P1 | Add Redis distributed lock | 6 hours | Prevents concurrent conflicts |
| 🟠 P1 | Transaction rollback on PULL failure | 3 hours | Ensures consistency |
| 🟡 P2 | Field-level versioning | 16 hours | Enables true concurrent edits |
| 🟡 P2 | Better conflict detection logging | 2 hours | Debugging aid |

---

## 11. Testing Checklist for Multi-Device

```bash
# Test Case 1: Simultaneous PUSH different records
Device A: Check in emp_id=EMP001
Device B: Check in emp_id=EMP002
Both: Run sync at same time
Expected: Both records in Postgres and both SQLites ✓

# Test Case 2: Simultaneous PUSH same payroll
Device A: Create payroll emp_id=EMP001, Dec 2024
Device B: Create payroll emp_id=EMP001, Dec 2024
Both: Run sync at same time (< 1 second apart)
Expected: Only ONE record in Postgres (or error with good recovery)

# Test Case 3: Concurrent field edits
Device A: offline, has time_in
Device B: online, receives time_in, adds time_out
Device A: comes online, pushes time_in
Expected: Final state has BOTH time_in and time_out

# Test Case 4: Network partition recovery
All Devices: Working normally
Network: Postgres unreachable for 5 minutes
Device A: Makes check-in locally
Device B: Makes payroll update locally
Network: Recovers
Both Devices: Run sync
Expected: All changes converge in Postgres

# Test Case 5: Extreme - 5 devices, 100 concurrent records
Expected: No data loss, all converge within 2 sync cycles
```

---

## Conclusion

Your sync system is **production-ready for 2-3 low-concurrency devices** but needs **immediate fixes** for:
1. Payroll composite key conflicts
2. Distributed locking
3. Transaction safety

**Estimated time to production-hardened**: 20-24 hours of engineering.
