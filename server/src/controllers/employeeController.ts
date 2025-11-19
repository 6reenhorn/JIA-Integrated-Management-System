import pool from '../db/postgres';

export interface Employee {
  id: number;
  empId: string;
  name: string;
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
  password: string;
}

export const getEmployees = async (): Promise<Employee[]> => {
  const query = 'SELECT * FROM employees';
  const result = await pool.query(query);
  return result.rows.map(row => ({
    id: row.id,
    empId: row.emp_id,
    name: row.name,
    role: row.role,
    contact: row.contact,
    status: row.status,
    lastLogin: row.last_login,
    avatar: row.avatar,
    address: row.address,
    salary: row.salary,
    contactName: row.contact_name,
    contactNumber: row.contact_number,
    relationship: row.relationship,
    password: row.password
  }));
};

export const getEmployeeById = async (id: number): Promise<Employee | null> => {
  const query = 'SELECT * FROM employees WHERE id = $1';
  const result = await pool.query(query, [id]);
  if (result.rows.length === 0) return null;
  const row = result.rows[0];
  return {
    id: row.id,
    empId: row.emp_id,
    name: row.name,
    role: row.role,
    contact: row.contact,
    status: row.status,
    lastLogin: row.last_login,
    avatar: row.avatar,
    address: row.address,
    salary: row.salary,
    contactName: row.contact_name,
    contactNumber: row.contact_number,
    relationship: row.relationship,
    password: row.password
  };
};

export const addEmployee = async (employeeData: Omit<Employee, 'id'>): Promise<Employee> => {
  const query = `
    INSERT INTO employees (emp_id, name, role, contact, status, last_login, avatar, address, salary, contact_name, contact_number, relationship, password)
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
    RETURNING *
  `;
  const values = [
    employeeData.empId,
    employeeData.name,
    employeeData.role,
    employeeData.contact,
    employeeData.status,
    employeeData.lastLogin,
    employeeData.avatar,
    employeeData.address,
    employeeData.salary,
    employeeData.contactName,
    employeeData.contactNumber,
    employeeData.relationship,
    employeeData.password
  ];
  const result = await pool.query(query, values);
  const row = result.rows[0];
  return {
    id: row.id,
    empId: row.emp_id,
    name: row.name,
    role: row.role,
    contact: row.contact,
    status: row.status,
    lastLogin: row.last_login,
    avatar: row.avatar,
    address: row.address,
    salary: row.salary,
    contactName: row.contact_name,
    contactNumber: row.contact_number,
    relationship: row.relationship,
    password: row.password
  };
};

export const updateEmployee = async (id: number, employeeData: Partial<Employee>): Promise<Employee | null> => {
  const fields = [];
  const values = [];
  let index = 1;

  if (employeeData.empId !== undefined) {
    fields.push(`emp_id = $${index++}`);
    values.push(employeeData.empId);
  }
  if (employeeData.name !== undefined) {
    fields.push(`name = $${index++}`);
    values.push(employeeData.name);
  }
  if (employeeData.role !== undefined) {
    fields.push(`role = $${index++}`);
    values.push(employeeData.role);
  }
  if (employeeData.contact !== undefined) {
    fields.push(`contact = $${index++}`);
    values.push(employeeData.contact);
  }
  if (employeeData.status !== undefined) {
    fields.push(`status = $${index++}`);
    values.push(employeeData.status);
  }
  if (employeeData.lastLogin !== undefined) {
    fields.push(`last_login = $${index++}`);
    values.push(employeeData.lastLogin);
  }
  if (employeeData.avatar !== undefined) {
    fields.push(`avatar = $${index++}`);
    values.push(employeeData.avatar);
  }
  if (employeeData.address !== undefined) {
    fields.push(`address = $${index++}`);
    values.push(employeeData.address);
  }
  if (employeeData.salary !== undefined) {
    fields.push(`salary = $${index++}`);
    values.push(employeeData.salary);
  }
  if (employeeData.contactName !== undefined) {
    fields.push(`contact_name = $${index++}`);
    values.push(employeeData.contactName);
  }
  if (employeeData.contactNumber !== undefined) {
    fields.push(`contact_number = $${index++}`);
    values.push(employeeData.contactNumber);
  }
  if (employeeData.relationship !== undefined) {
    fields.push(`relationship = $${index++}`);
    values.push(employeeData.relationship);
  }
  if (employeeData.password !== undefined) {
    fields.push(`password = $${index++}`);
    values.push(employeeData.password);
  }

  if (fields.length === 0) return null;

  const query = `UPDATE employees SET ${fields.join(', ')} WHERE id = $${index} RETURNING *`;
  values.push(id);

  const result = await pool.query(query, values);
  if (result.rows.length === 0) return null;
  const row = result.rows[0];
  return {
    id: row.id,
    empId: row.emp_id,
    name: row.name,
    role: row.role,
    contact: row.contact,
    status: row.status,
    lastLogin: row.last_login,
    avatar: row.avatar,
    address: row.address,
    salary: row.salary,
    contactName: row.contact_name,
    contactNumber: row.contact_number,
    relationship: row.relationship,
    password: row.password
  };
};

export const deleteEmployee = async (id: number): Promise<boolean> => {
  const query = 'DELETE FROM employees WHERE id = $1';
  const result = await pool.query(query, [id]);
  return (result.rowCount ?? 0) > 0;
};
