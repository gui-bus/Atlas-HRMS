export type UserRole = "ADMIN" | "MANAGER" | "EMPLOYEE" | "HR";

export interface User {
  id: string;
  email: string;
  role: UserRole;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export type EmployeeStatus = "ACTIVE" | "INACTIVE" | "ON_LEAVE" | "SUSPENDED";

export interface Employee {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  status: EmployeeStatus;
  hireDate: string;
  terminationDate?: string | null;
  salary: number;
  departmentId?: string | null;
  positionId?: string | null;
  userId?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Department {
  id: string;
  name: string;
  code: string;
  active: boolean;
  managerId?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Position {
  id: string;
  title: string;
  departmentId: string;
  salaryRangeMin: number;
  salaryRangeMax: number;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export type VacationStatus = "PENDING" | "APPROVED" | "REJECTED" | "CANCELLED";

export interface Vacation {
  id: string;
  employeeId: string;
  startDate: string;
  endDate: string;
  status: VacationStatus;
  approvedById?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Document {
  id: string;
  employeeId: string;
  name: string;
  type: string;
  url: string;
  createdAt: string;
  updatedAt: string;
}

export type RecruitmentStatus = "OPEN" | "CLOSED" | "ON_HOLD" | "DRAFT";

export interface Recruitment {
  id: string;
  title: string;
  status: RecruitmentStatus;
  description: string;
  salary: number;
  departmentId: string;
  createdAt: string;
  updatedAt: string;
}

export interface Notification {
  id: string;
  userId: string;
  message: string;
  read: boolean;
  createdAt: string;
}

export interface AuditLog {
  id: string;
  userId?: string | null;
  action: string;
  details: string;
  timestamp: string;
}
