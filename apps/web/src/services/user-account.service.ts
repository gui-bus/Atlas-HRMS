import { api } from "@/lib/api";

export interface UserAccount {
  id: string;
  email: string;
  role: "ADMIN" | "HR" | "MANAGER" | "EMPLOYEE";
  createdAt: string;
}

export const userAccountService = {
  async getUserAccounts(): Promise<UserAccount[]> {
    const response = await api.get<UserAccount[]>("/users");
    return response.data;
  },
};
