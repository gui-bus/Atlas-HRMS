import { api } from "@/lib/api";

export interface TimeRecord {
  id: string;
  timestamp: string;
  type: "ENTRY" | "INTERVAL_OUT" | "INTERVAL_IN" | "EXIT";
  source: "WEB" | "MOBILE" | "ADMIN";
  comments?: string;
}

export interface TimeCorrectionRequest {
  id: string;
  date: string;
  targetType: "ENTRY" | "INTERVAL_OUT" | "INTERVAL_IN" | "EXIT";
  time: string;
  reason: string;
  status: "PENDING" | "APPROVED" | "REJECTED";
  notes?: string;
  employee?: {
    firstName: string;
    lastName: string;
  };
}

export const timeAttendanceService = {
  async clockIn(
    comments?: string,
    coords?: { latitude?: number; longitude?: number },
  ): Promise<TimeRecord> {
    const response = await api.post<TimeRecord>("/time-attendance/clock-in", {
      source: "WEB",
      comments,
      latitude: coords?.latitude,
      longitude: coords?.longitude,
    });
    return response.data;
  },

  async getTodayRecords(): Promise<TimeRecord[]> {
    const response = await api.get<TimeRecord[]>("/time-attendance/records/today");
    return response.data;
  },

  async getMyHistory(): Promise<TimeRecord[]> {
    const response = await api.get<TimeRecord[]>("/time-attendance/records/my-history");
    return response.data;
  },

  async getHourBankBalance(): Promise<number> {
    const response = await api.get<number>("/time-attendance/hour-bank/balance");
    return response.data;
  },

  async requestCorrection(data: {
    date: string;
    targetType: string;
    time: string;
    reason: string;
  }): Promise<TimeCorrectionRequest> {
    const response = await api.post<TimeCorrectionRequest>("/time-attendance/corrections", data);
    return response.data;
  },

  async getPendingCorrections(): Promise<TimeCorrectionRequest[]> {
    const response = await api.get<TimeCorrectionRequest[]>("/time-attendance/corrections/pending");
    return response.data;
  },

  async approveCorrection(id: string, notes?: string): Promise<TimeCorrectionRequest> {
    const response = await api.put<TimeCorrectionRequest>(
      `/time-attendance/corrections/${id}/approve`,
      { notes },
    );
    return response.data;
  },

  async rejectCorrection(id: string, notes?: string): Promise<TimeCorrectionRequest> {
    const response = await api.put<TimeCorrectionRequest>(
      `/time-attendance/corrections/${id}/reject`,
      { notes },
    );
    return response.data;
  },
};
