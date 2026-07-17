import { api } from "@/lib/api";

export interface UserAccount {
  id: string;
  email: string;
  role: "ADMIN" | "HR" | "MANAGER" | "EMPLOYEE";
  createdAt: string;
}

export const userAccountService = {
  async getUserAccounts(params?: { page?: number; limit?: number }): Promise<any> {
    const response = await api.get<any>("/users", { params });
    return response.data;
  },

  async getUserAccount(id: string): Promise<UserAccount> {
    const response = await api.get<UserAccount>(`/users/${id}`);
    return response.data;
  },

  async updateUserAccount(id: string, data: { role?: string; isActive?: boolean }): Promise<void> {
    await api.put(`/users/${id}`, data);
  },
};
