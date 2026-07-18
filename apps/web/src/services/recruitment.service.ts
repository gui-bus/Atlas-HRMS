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
  status: "DRAFT" | "OPEN" | "ON_HOLD" | "CLOSED" | "CANCELLED";
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

export interface Candidate {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  linkedinUrl?: string | null;
  githubUrl?: string | null;
  portfolioUrl?: string | null;
  currentSalary?: string | null;
  expectedSalary?: string | null;
}

export interface Application {
  id: string;
  candidateName: string;
  candidateEmail: string;
  resumeUrl: string;
  coverLetter?: string | null;
  status: "SCREENING" | "HR_INTERVIEW" | "TECHNICAL_TEST" | "OFFER" | "HIRED" | "REJECTED";
  recruitmentId: string;
  createdAt: string;
  candidate?: Candidate;
}

export const recruitmentService = {
  async getRecruitments(params?: {
    page?: number;
    limit?: number;
    sortBy?: string;
    sortOrder?: string;
    search?: string;
    seniority?: string;
    workModel?: string;
    employmentType?: string;
  }): Promise<{ data: Recruitment[]; totalPages?: number }> {
    const response = await api.get<{ data: Recruitment[]; totalPages?: number }>(
      "/recruitments/admin",
      {
        params,
      },
    );
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

  async getPublicJobBySlug(slug: string): Promise<Recruitment> {
    const response = await api.get<Recruitment>(`/recruitments/${slug}`);
    return response.data;
  },

  async applyToJob(slug: string, formData: FormData): Promise<any> {
    const response = await api.post(`/recruitments/${slug}/apply`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  },
};
