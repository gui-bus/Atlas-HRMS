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
  newHiresThisMonth: number;
  pendingCorrections: number;
  applicationsByStage: Record<string, number>;
}

export interface UpcomingVacation {
  id: string;
  startDate: string;
  endDate: string;
  status: string;
}

export interface EmployeeDashboardSummary {
  hourBankBalance: number;
  pendingVacationsCount: number;
  pendingLeavesCount: number;
  todayRecordsCount: number;
  upcomingVacations: UpcomingVacation[];
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

  async getEmployeeSummary(): Promise<EmployeeDashboardSummary> {
    const response = await api.get<EmployeeDashboardSummary>("/dashboard/employee-summary");
    return response.data;
  },
};
