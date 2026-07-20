import { api } from "@/lib/api";

export interface Position {
  id: string;
  title: string;
  description?: string;
  salaryRangeMin: string; 
  salaryRangeMax: string; 
  active: boolean;
  departmentId: string;
  department?: {
    id: string;
    name: string;
    code: string;
  };
  employeesCount?: number;
}

export const positionService = {
  async getPositions(params?: {
    page?: number;
    limit?: number;
    sortBy?: string;
    sortOrder?: string;
  }): Promise<any> {
    const response = await api.get<any>("/positions", { params });
    return response.data;
  },

  async getPosition(id: string): Promise<Position> {
    const response = await api.get<Position>(`/positions/${id}`);
    return response.data;
  },

  async createPosition(data: {
    title: string;
    description?: string;
    salaryRangeMin: string;
    salaryRangeMax: string;
    departmentId: string;
    active?: boolean;
  }): Promise<Position> {
    const payload = {
      ...data,
      salaryRangeMin: parseFloat(data.salaryRangeMin),
      salaryRangeMax: parseFloat(data.salaryRangeMax),
    };
    const response = await api.post<Position>("/positions", payload);
    return response.data;
  },

  async updatePosition(
    id: string,
    data: {
      title?: string;
      description?: string;
      salaryRangeMin?: string;
      salaryRangeMax?: string;
      departmentId?: string;
      active?: boolean;
    },
  ): Promise<Position> {
    const payload: any = { ...data };
    if (data.salaryRangeMin) payload.salaryRangeMin = parseFloat(data.salaryRangeMin);
    if (data.salaryRangeMax) payload.salaryRangeMax = parseFloat(data.salaryRangeMax);
    const response = await api.put<Position>(`/positions/${id}`, payload);
    return response.data;
  },

  async deletePosition(id: string): Promise<void> {
    await api.delete(`/positions/${id}`);
  },
};
