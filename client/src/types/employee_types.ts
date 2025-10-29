export interface Employee {
  id: number;
  name: string;
  empId: string;
  role: string;
  contact: string;
  status: 'Active' | 'Inactive';
  lastLogin: string;
  avatar?: string;
  address: string;
  salary: string;
  contactName: string;
  contactNumber: string;
  relationship: string;
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