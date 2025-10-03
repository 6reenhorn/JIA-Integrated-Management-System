export interface Employee {
  id: number;
  name: string;
  empId: string;
  role: string;
  department: string;
  contact: string;
  status: 'Active' | 'Inactive';
  lastLogin: string;
  avatar?: string;
}

export interface EmployeeStats {
  totalEmployees: number;
  activeEmployees: number;
  newHires: number;
}

export interface AttendanceRecord {
  attendanceId: number;
  name: string;
  empId: string;
  role: string;
  date: string;
  timeIn: string;
  timeOut: string;
  status: 'Present' | 'Absent' | 'On Leave';
}