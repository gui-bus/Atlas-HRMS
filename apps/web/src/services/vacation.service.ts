import { api } from "@/lib/api";

export interface Vacation {
  id: string;
  employeeId: string;
  startDate: string;
  endDate: string;
  status: "PENDING" | "APPROVED" | "REJECTED" | "CANCELLED";
  comments?: string;
  rejectionReason?: string;
  approvedById?: string;
  approvedBy?: {
    id: string;
    email: string;
  };
  employee?: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
}

export interface Leave {
  id: string;
  employeeId: string;
  type: "MEDICAL" | "PARENTAL" | "LEGAL" | "UNPAID" | "OTHER";
  startDate: string;
  endDate: string;
  reason: string;
  status: "PENDING" | "APPROVED" | "REJECTED" | "CANCELLED";
  rejectionReason?: string;
  attachmentUrl?: string;
  approvedById?: string;
  approvedBy?: {
    id: string;
    email: string;
  };
  employee?: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
}

export const vacationService = {
  // --- Vacations endpoints ---
  async getVacations(): Promise<Vacation[]> {
    const response = await api.get<Vacation[]>("/vacations");
    return response.data;
  },

  async getEmployeeVacations(employeeId: string): Promise<Vacation[]> {
    const response = await api.get<Vacation[]>(`/vacations/employee/${employeeId}`);
    return response.data;
  },

  async createVacation(data: {
    employeeId: string;
    startDate: string;
    endDate: string;
    comments?: string;
  }): Promise<Vacation> {
    const response = await api.post<Vacation>("/vacations", data);
    return response.data;
  },

  async updateVacationStatus(
    id: string,
    data: {
      status: "APPROVED" | "REJECTED";
      rejectionReason?: string;
    },
  ): Promise<Vacation> {
    const response = await api.put<Vacation>(`/vacations/${id}/status`, data);
    return response.data;
  },

  async cancelVacation(id: string): Promise<Vacation> {
    const response = await api.delete<Vacation>(`/vacations/${id}`);
    return response.data;
  },

  // --- Leaves endpoints ---
  async getLeaves(): Promise<Leave[]> {
    const response = await api.get<Leave[]>("/vacations/leaves");
    return response.data;
  },

  async getEmployeeLeaves(employeeId: string): Promise<Leave[]> {
    const response = await api.get<Leave[]>(`/vacations/leaves/employee/${employeeId}`);
    return response.data;
  },

  async createLeave(data: {
    employeeId: string;
    type: "MEDICAL" | "PARENTAL" | "LEGAL" | "UNPAID" | "OTHER";
    startDate: string;
    endDate: string;
    reason: string;
    attachmentUrl?: string;
  }): Promise<Leave> {
    const response = await api.post<Leave>("/vacations/leaves", data);
    return response.data;
  },

  async updateLeaveStatus(
    id: string,
    data: {
      status: "APPROVED" | "REJECTED";
      rejectionReason?: string;
    },
  ): Promise<Leave> {
    const response = await api.put<Leave>(`/vacations/leaves/${id}/status`, data);
    return response.data;
  },

  async cancelLeave(id: string): Promise<Leave> {
    const response = await api.delete<Leave>(`/vacations/leaves/${id}`);
    return response.data;
  },
};
