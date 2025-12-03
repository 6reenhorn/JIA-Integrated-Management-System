/**
 * Utility functions for handling Philippines (Asia/Manila) local time
 * Philippines is UTC+8
 */

/**
 * Get current date and time in Philippines timezone as ISO string
 * @returns ISO string in PH local time
 */
function getPHLocalTimeISO() {
  const now = new Date();
  // Philippines is UTC+8
  const phOffset = 8 * 60; // 8 hours in minutes
  const utc = now.getTime() + (now.getTimezoneOffset() * 60000);
  const phTime = new Date(utc + (phOffset * 60000));
  return phTime.toISOString();
}

/**
 * Get current date in Philippines timezone (YYYY-MM-DD format)
 * @returns Date string in YYYY-MM-DD format
 */
function getPHLocalDate() {
  const now = new Date();
  // Philippines is UTC+8
  const phOffset = 8 * 60; // 8 hours in minutes
  const utc = now.getTime() + (now.getTimezoneOffset() * 60000);
  const phTime = new Date(utc + (phOffset * 60000));
  
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
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  const phOffset = 8 * 60; // 8 hours in minutes
  const utc = dateObj.getTime() + (dateObj.getTimezoneOffset() * 60000);
  const phTime = new Date(utc + (phOffset * 60000));
  return phTime.toISOString();
}

module.exports = {
  getPHLocalTimeISO,
  getPHLocalDate,
  toPHLocalTimeISO
};

