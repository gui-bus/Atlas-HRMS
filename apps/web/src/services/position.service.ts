import { api } from "@/lib/api";

export interface Position {
  id: string;
  title: string;
  description?: string;
  salaryRangeMin: string; // Decimal returned as string
  salaryRangeMax: string; // Decimal returned as string
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
  async getPositions(): Promise<Position[]> {
    const response = await api.get<Position[]>("/positions");
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
  }): Promise<Position> {
    const response = await api.post<Position>("/positions", data);
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
    const response = await api.put<Position>(`/positions/${id}`, data);
    return response.data;
  },

  async deletePosition(id: string): Promise<void> {
    await api.delete(`/positions/${id}`);
  },
};
