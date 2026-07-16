import { api } from "@/lib/api";

export interface Document {
  id: string;
  name: string;
  type: "CONTRACT" | "IDENTIFICATION" | "EDUCATION" | "ADDRESS_PROOF" | "OTHER";
  url: string;
  employeeId: string;
  createdAt: string;
  updatedAt: string;
  employee?: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
}

export const documentService = {
  async getDocuments(): Promise<Document[]> {
    const response = await api.get<Document[]>("/documents");
    return response.data;
  },

  async getEmployeeDocuments(employeeId: string): Promise<Document[]> {
    const response = await api.get<Document[]>(`/documents/employee/${employeeId}`);
    return response.data;
  },

  async getDocument(id: string): Promise<Document> {
    const response = await api.get<Document>(`/documents/${id}`);
    return response.data;
  },

  async createDocument(data: {
    name: string;
    type: "CONTRACT" | "IDENTIFICATION" | "EDUCATION" | "ADDRESS_PROOF" | "OTHER";
    url: string;
    employeeId: string;
  }): Promise<Document> {
    const response = await api.post<Document>("/documents", data);
    return response.data;
  },

  async deleteDocument(id: string): Promise<Document> {
    const response = await api.delete<Document>(`/documents/${id}`);
    return response.data;
  },
};
