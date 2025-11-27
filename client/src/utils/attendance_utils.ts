import type { AttendanceRecord, AttendanceStats } from '../types/employee_types';

export const ATTENDANCE_STATUSES = ['Present', 'Absent', 'On Leave'] as const;

export type AttendanceStatus = typeof ATTENDANCE_STATUSES[number];

export const getAttendanceStatusColor = (status: AttendanceRecord['status']): string => {
  switch (status) {
    case 'Present':
      return 'bg-green-100 text-green-800';
    case 'Absent':
      return 'bg-red-100 text-red-800';
    case 'On Leave':
      return 'bg-yellow-100 text-yellow-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

export const calculateAttendanceStats = (attendanceRecords: AttendanceRecord[], totalEmployees: number, employees?: any[]): AttendanceStats => {
  // Get today's date in local timezone (YYYY-MM-DD format)
  const today = new Date();
  const todayString = today.getFullYear() + '-' +
    String(today.getMonth() + 1).padStart(2, '0') + '-' +
    String(today.getDate()).padStart(2, '0');

  // Check yesterday's UTC date (for existing records stored in UTC)
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayUtcString = yesterday.toISOString().split('T')[0]; // This gives yesterday's date in UTC

  // Exclude admin employees from total count if employees array is provided
  let nonAdminEmployeeCount = totalEmployees;
  if (employees && Array.isArray(employees)) {
    nonAdminEmployeeCount = employees.filter(emp => 
      emp.role && emp.role.toLowerCase() !== 'admin'
    ).length;
  }

  console.log('Debug:', { todayString, yesterdayUtcString, totalEmployees, nonAdminEmployeeCount, totalRecords: attendanceRecords.length });
  console.log('All record dates:', attendanceRecords.map(r => r.date.split('T')[0]));

  // Filter records for today (handle both local and UTC date formats)
  // Also filter out any admin records that might have slipped through
  const todayRecords = attendanceRecords.filter(record => {
    // Extract date part from ISO datetime string
    const recordDate = record.date.split('T')[0];
    // Check if record matches today's local date OR yesterday's UTC date (which represents today in UTC)
    const matches = recordDate === todayString || recordDate === yesterdayUtcString;
    // Also exclude admin records
    const isNotAdmin = !record.role || record.role.toLowerCase() !== 'admin';
    if (matches && isNotAdmin) console.log('Found today record:', record);
    return matches && isNotAdmin;
  });

  console.log('Today records found:', todayRecords.length);

  // Count present: employees who checked in today (excluding admins)
  const present = todayRecords.filter(record => record.timeIn && record.timeIn.trim() !== '').length;

  // Count on leave: employees marked as on leave today (excluding admins)
  const onLeave = todayRecords.filter(record => record.status === 'On Leave').length;

  // Count absent: non-admin employees minus those who are present or on leave
  const absent = nonAdminEmployeeCount - present - onLeave;

  console.log('Final counts:', { present, absent, onLeave, nonAdminEmployeeCount });

  return {
    present: Math.max(0, present), // Ensure non-negative
    absent: Math.max(0, absent), // Ensure non-negative
    onLeave: Math.max(0, onLeave) // Ensure non-negative
  };
};
