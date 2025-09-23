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
  departments: number;
  newHires: number;
}