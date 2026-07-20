import { api } from "@/lib/api";
import { Employee } from "@atlas/types";


export interface PersonalData {
  id: string;
  cpf: string;
  rg?: string;
  birthDate: string;
  gender?: string;
  maritalStatus?: string;
  avatarUrl?: string;
}

export interface Address {
  id: string;
  cep: string;
  street: string;
  number: string;
  complement?: string;
  neighborhood: string;
  city: string;
  state: string;
}

export interface BankAccount {
  id: string;
  bankCode: string;
  bankAgency: string;
  bankAccount: string;
  accountType: string;
}

export interface EmergencyContact {
  id: string;
  name: string;
  phone: string;
  relationship: string;
  isPrimary: boolean;
}

export interface EmployeeWithDetails extends Omit<Employee, "salary"> {
  salary: string; 
  personalData?: PersonalData;
  address?: Address;
  bankAccount?: BankAccount;
  emergencyContacts?: EmergencyContact[];
}

export interface PaginatedEmployeesResponse {
  data: EmployeeWithDetails[];
  meta: {
    total: number;
    page: number;
    lastPage: number;
    limit: number;
  };
}

export interface GetEmployeesQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
  departmentId?: string;
  positionId?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

export const employeeService = {
  async getEmployees(params?: GetEmployeesQueryParams): Promise<PaginatedEmployeesResponse> {
    const response = await api.get<PaginatedEmployeesResponse>("/employees", { params });
    return response.data;
  },

  async getEmployee(id: string): Promise<EmployeeWithDetails> {
    const response = await api.get<EmployeeWithDetails>(`/employees/${id}`);
    return response.data;
  },

  async createEmployee(data: any): Promise<EmployeeWithDetails> {
    const response = await api.post<EmployeeWithDetails>("/employees", data);
    return response.data;
  },

  async updateEmployee(id: string, data: any): Promise<EmployeeWithDetails> {
    const response = await api.put<EmployeeWithDetails>(`/employees/${id}`, data);
    return response.data;
  },

  async deleteEmployee(id: string): Promise<EmployeeWithDetails> {
    const response = await api.delete<EmployeeWithDetails>(`/employees/${id}`);
    return response.data;
  },
};
