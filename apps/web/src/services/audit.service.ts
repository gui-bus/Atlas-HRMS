import { api } from "@/lib/api";

export interface AuditLog {
  id: string;
  action: string;
  details?: string; 
  timestamp: string;
  userId?: string;
  user?: {
    id: string;
    email: string;
  };
}

export interface PaginatedAuditResponse {
  data: AuditLog[];
  meta: {
    total: number;
    page: number;
    lastPage: number;
    limit: number;
  };
}

export interface QueryAuditParams {
  page?: number;
  limit?: number;
  search?: string;
}

export const auditService = {
  async getAuditLogs(params?: QueryAuditParams): Promise<PaginatedAuditResponse> {
    const response = await api.get<PaginatedAuditResponse>("/audit", { params });
    return response.data;
  },
};
