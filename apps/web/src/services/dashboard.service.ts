import { api } from "@/lib/api";

export interface DashboardStats {
  totalEmployees: number;
  totalDepartments: number;
  pendingVacations: number;
  pendingLeaves: number;
  activeAbsences: number;
  openJobs: number;
  totalApplications: number;
  hiredCount: number;
}

export const dashboardService = {
  async getStats(params?: {
    departmentId?: string;
    startDate?: string;
    endDate?: string;
  }): Promise<DashboardStats> {
    const response = await api.get<DashboardStats>("/dashboard", { params });
    return response.data;
  },
};
