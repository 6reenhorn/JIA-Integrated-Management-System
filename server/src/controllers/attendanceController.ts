import { dbHelper } from '../db/dbHelper';
const bcrypt = require('bcryptjs');

export interface AttendanceRecord {
  id: number;
  employeeId: number;
  date: string;
  timeIn: string;
  timeOut: string | null;
  status: string;
}

// Helper function to format time in HH:MM AM/PM format
const formatTime = (timeStr: string | null): string | null => {
  if (!timeStr) return null;
  try {
    const date = new Date(timeStr);
    const hours = date.getHours();
    const minutes = date.getMinutes();
    const ampm = hours >= 12 ? 'PM' : 'AM';
    const displayHours = hours % 12 || 12;
    const displayMinutes = String(minutes).padStart(2, '0');
    return `${displayHours}:${displayMinutes} ${ampm}`;
  } catch {
    return timeStr;
  }
};

export const checkIn = async (employeeId: number, password: string): Promise<{ success: boolean; message: string }> => {
  // First, verify the password
  const employee = await dbHelper.getById('employees', employeeId);
  if (!employee || employee.deleted_at) {
    return { success: false, message: 'Employee not found' };
  }
  const storedPassword = employee.password;
  
  // Check if password is hashed (bcrypt hashes start with $2a$, $2b$, or $2y$)
  const isHashed = storedPassword && (storedPassword.startsWith('$2a$') || storedPassword.startsWith('$2b$') || storedPassword.startsWith('$2y$'));
  
  if (isHashed) {
    // Compare hashed password
    const isMatch = await bcrypt.compare(password, storedPassword);
    if (!isMatch) {
      return { success: false, message: 'Invalid password' };
    }
  } else {
    // Plain text comparison (for backwards compatibility)
    if (storedPassword !== password) {
      return { success: false, message: 'Invalid password' };
    }
  }

  // Check if already checked in today
  const today = new Date().toISOString().split('T')[0];
  const checkResult = await dbHelper.query('SELECT id FROM attendance WHERE employee_id = ? AND date = ?', [employeeId, today]);
  if (checkResult.length > 0) {
    return { success: false, message: 'Already checked in today' };
  }

  // Insert check-in record
  const now = new Date().toISOString();
  await dbHelper.run('INSERT INTO attendance (employee_id, date, time_in, status) VALUES (?, ?, ?, ?)', 
    [employeeId, today, now, 'Present']);

  return { success: true, message: 'Check-in successful' };
};

export const getAttendanceRecords = async (): Promise<any[]> => {
  const query = `
    SELECT
      a.id as attendanceId,
      e.name,
      e.emp_id as empId,
      e.role,
      a.date,
      a.time_in as timeIn,
      a.time_out as timeOut,
      a.status
    FROM attendance a
    JOIN employees e ON a.employee_id = e.id
    WHERE a.deleted_at IS NULL AND e.deleted_at IS NULL 
      AND LOWER(e.role) != 'admin'
    ORDER BY a.date DESC, a.time_in DESC
  `;
  const rows = await dbHelper.query(query);
  
  return rows.map((row: any) => ({
    attendanceId: row.attendanceId,
    name: row.name,
    empId: row.empId,
    role: row.role,
    date: row.date,
    timeIn: formatTime(row.timeIn),
    timeOut: formatTime(row.timeOut),
    status: row.status
  }));
};
