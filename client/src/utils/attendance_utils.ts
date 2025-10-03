import type { AttendanceRecord } from '../types/employee_types';

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
