/**
 * Utility functions for handling Philippines (Asia/Manila) local time
 * Philippines is UTC+8
 */

/**
 * Get current date and time in Philippines timezone as ISO string
 * @returns ISO string in PH local time
 */
function getPHLocalTimeISO() {
  // Store timestamps as standard UTC ISO strings (toISOString()).
  // Avoid creating a Date object that represents the PH local clock then
  // calling toISOString() (that produces a different instant). Always
  // return the current instant in UTC so it remains unambiguous across
  // processes and databases. Formatting to PH local time should be done
  // at display time (frontend or when formatting for users).
  return new Date().toISOString();
}

/**
 * Get current date in Philippines timezone (YYYY-MM-DD format)
 * @returns Date string in YYYY-MM-DD format
 */
function getPHLocalDate() {
  // Compute the current date in Philippines local date (YYYY-MM-DD)
  // Use Intl.DateTimeFormat with timeZone to get a stable PH date regardless
  // of server timezone.
  const now = new Date();
  const parts = new Intl.DateTimeFormat('en-CA', { // en-CA uses YYYY-MM-DD order
    timeZone: 'Asia/Manila',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  }).formatToParts(now);

  const y = parts.find(p => p.type === 'year')?.value;
  const m = parts.find(p => p.type === 'month')?.value;
  const d = parts.find(p => p.type === 'day')?.value;
  if (y && m && d) return `${y}-${m}-${d}`;
  // Fallback: compute by shifting to Manila timezone
  const utc = now.getTime() + (now.getTimezoneOffset() * 60000);
  const phOffsetMs = 8 * 60 * 60 * 1000;
  const phTime = new Date(utc + phOffsetMs);
  const year = phTime.getUTCFullYear();
  const month = String(phTime.getUTCMonth() + 1).padStart(2, '0');
  const day = String(phTime.getUTCDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Convert a date to Philippines timezone ISO string
 * @param date - Date object or ISO string
 * @returns ISO string in PH local time
 */
function toPHLocalTimeISO(date) {
  // Convert a Date or date string to an ISO string representing the same
  // absolute instant (UTC). If callers want a PH-local formatted string,
  // they should format using Intl.DateTimeFormat with timeZone 'Asia/Manila'.
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  if (!dateObj || isNaN(dateObj.getTime())) return null;
  return dateObj.toISOString();
}

module.exports = {
  getPHLocalTimeISO,
  getPHLocalDate,
  toPHLocalTimeISO
};

