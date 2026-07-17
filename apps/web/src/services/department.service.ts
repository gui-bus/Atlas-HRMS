import { api } from "@/lib/api";

export interface Department {
  id: string;
  name: string;
  code: string;
  description?: string;
  active: boolean;
  managerId?: string;
  manager?: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  employeesCount?: number;
  positionsCount?: number;
}

export const departmentService = {
  async getDepartments(params?: { page?: number; limit?: number }): Promise<any> {
    const response = await api.get<any>("/departments", { params });
    return response.data;
  },

  async getDepartment(id: string): Promise<Department> {
    const response = await api.get<Department>(`/departments/${id}`);
    return response.data;
  },

  async createDepartment(data: {
    name: string;
    code: string;
    description?: string;
    managerId?: string | null;
  }): Promise<Department> {
    const response = await api.post<Department>("/departments", data);
    return response.data;
  },

  async updateDepartment(
    id: string,
    data: {
      name?: string;
      code?: string;
      description?: string;
      managerId?: string | null;
      active?: boolean;
    },
  ): Promise<Department> {
    const response = await api.put<Department>(`/departments/${id}`, data);
    return response.data;
  },

  async deleteDepartment(id: string): Promise<void> {
    await api.delete(`/departments/${id}`);
  },
};
