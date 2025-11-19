import pool from '../db/postgres';

export interface AttendanceRecord {
  id: number;
  employeeId: number;
  date: string;
  timeIn: string;
  timeOut: string | null;
  status: string;
}

export const checkIn = async (employeeId: number, password: string): Promise<{ success: boolean; message: string }> => {
  // First, verify the password
  const employeeQuery = 'SELECT password FROM employees WHERE id = $1';
  const employeeResult = await pool.query(employeeQuery, [employeeId]);
  if (employeeResult.rows.length === 0) {
    return { success: false, message: 'Employee not found' };
  }
  const storedPassword = employeeResult.rows[0].password;
  if (storedPassword !== password) {
    return { success: false, message: 'Invalid password' };
  }

  // Check if already checked in today
  const today = new Date().toISOString().split('T')[0];
  const checkQuery = 'SELECT id FROM attendance WHERE employee_id = $1 AND date = $2';
  const checkResult = await pool.query(checkQuery, [employeeId, today]);
  if (checkResult.rows.length > 0) {
    return { success: false, message: 'Already checked in today' };
  }

  // Insert check-in record
  const insertQuery = 'INSERT INTO attendance (employee_id, date, time_in, status) VALUES ($1, $2, CURRENT_TIMESTAMP, $3)';
  await pool.query(insertQuery, [employeeId, today, 'Present']);

  return { success: true, message: 'Check-in successful' };
};

export const getAttendanceRecords = async (): Promise<AttendanceRecord[]> => {
  const query = 'SELECT * FROM attendance ORDER BY date DESC, time_in DESC';
  const result = await pool.query(query);
  return result.rows.map(row => ({
    id: row.id,
    employeeId: row.employee_id,
    date: row.date,
    timeIn: row.time_in,
    timeOut: row.time_out,
    status: row.status
  }));
};
