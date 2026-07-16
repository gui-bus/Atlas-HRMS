import { api } from "@/lib/api";

export interface Recruitment {
  id: string;
  title: string;
  slug: string;
  description: string;
  employmentType: "CLT" | "PJ" | "CONTRACTOR" | "INTERNSHIP" | "TEMPORARY";
  workModel: "REMOTE" | "HYBRID" | "ONSITE";
  seniority: "JUNIOR" | "MID" | "SENIOR" | "LEAD" | "EXECUTIVE";
  vacancies?: number;
  salaryMin?: string;
  salaryMax?: string;
  requirements?: string;
  status: "DRAFT" | "OPEN" | "CLOSED" | "CANCELLED";
  departmentId: string;
  positionId: string;
  department?: {
    id: string;
    name: string;
  };
  position?: {
    id: string;
    title: string;
  };
}

export interface Application {
  id: string;
  candidateName: string;
  candidateEmail: string;
  resumeUrl: string;
  status:
    | "SUBMITTED"
    | "SCREENING"
    | "HR_INTERVIEW"
    | "TECHNICAL_TEST"
    | "MANAGER_INTERVIEW"
    | "OFFER"
    | "HIRED"
    | "REJECTED";
  recruitmentId: string;
  createdAt: string;
}

export const recruitmentService = {
  async getRecruitments(): Promise<{ data: Recruitment[] }> {
    const response = await api.get<{ data: Recruitment[] }>("/recruitments");
    return response.data;
  },

  async getRecruitment(id: string): Promise<Recruitment> {
    const response = await api.get<Recruitment>(`/recruitments/${id}`);
    return response.data;
  },

  async createRecruitment(data: any): Promise<Recruitment> {
    const response = await api.post<Recruitment>("/recruitments/admin", data);
    return response.data;
  },

  async updateRecruitment(id: string, data: any): Promise<Recruitment> {
    const response = await api.put<Recruitment>(`/recruitments/admin/${id}`, data);
    return response.data;
  },

  async deleteRecruitment(id: string): Promise<void> {
    await api.delete(`/recruitments/admin/${id}`);
  },

  async getApplications(recruitmentId: string): Promise<{ data: Application[] }> {
    const response = await api.get<{ data: Application[] }>(
      `/recruitments/admin/${recruitmentId}/applications`,
    );
    return response.data;
  },

  async updateApplicationStatus(
    applicationId: string,
    data: { status: string; feedback?: string },
  ): Promise<Application> {
    const response = await api.put<Application>(
      `/recruitments/applications/${applicationId}/status`,
      data,
    );
    return response.data;
  },

  async hireCandidate(applicationId: string): Promise<void> {
    await api.post(`/recruitments/applications/${applicationId}/hire`);
  },
};
