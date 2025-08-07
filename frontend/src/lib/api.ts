const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
}

class ApiClient {
  private baseURL: string;

  constructor(baseURL: string) {
    this.baseURL = baseURL;
  }

  private getAuthHeaders(): Record<string, string> {
    const token = localStorage.getItem('token');
    return {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
    };
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const url = `${this.baseURL}${endpoint}`;
    const config: RequestInit = {
      headers: this.getAuthHeaders(),
      ...options,
    };

    try {
      const response = await fetch(url, config);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || `HTTP error! status: ${response.status}`);
      }

      return data;
    } catch (error) {
      console.error(`API request failed: ${endpoint}`, error);
      throw error;
    }
  }

  // Auth endpoints
  async login(username: string, password: string) {
    return this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    });
  }

  async register(username: string, email: string, password: string) {
    return this.request('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ username, email, password }),
    });
  }

  async verifyToken() {
    return this.request('/auth/verify');
  }

  async getCurrentUser() {
    return this.request('/auth/me');
  }

  async updateProfile(username: string, email: string) {
    return this.request('/auth/profile', {
      method: 'PUT',
      body: JSON.stringify({ username, email }),
    });
  }

  async updatePassword(currentPassword: string, newPassword: string) {
    return this.request('/auth/password', {
      method: 'PUT',
      body: JSON.stringify({ currentPassword, newPassword }),
    });
  }

  // User management endpoints (admin only)
  async getUsers(page = 1, limit = 10) {
    return this.request(`/users?page=${page}&limit=${limit}`);
  }

  async getUserById(id: number) {
    return this.request(`/users/${id}`);
  }

  async updateUser(id: number, userData: any) {
    return this.request(`/users/${id}`, {
      method: 'PUT',
      body: JSON.stringify(userData),
    });
  }

  async deleteUser(id: number) {
    return this.request(`/users/${id}`, {
      method: 'DELETE',
    });
  }

  // Model endpoints
  async getModels(page = 1, limit = 10) {
    return this.request(`/models?page=${page}&limit=${limit}`);
  }

  async getModelById(id: number) {
    return this.request(`/models/${id}`);
  }

  async createModel(modelData: any) {
    return this.request('/models', {
      method: 'POST',
      body: JSON.stringify(modelData),
    });
  }

  async updateModel(id: number, modelData: any) {
    return this.request(`/models/${id}`, {
      method: 'PUT',
      body: JSON.stringify(modelData),
    });
  }

  async deleteModel(id: number) {
    return this.request(`/models/${id}`, {
      method: 'DELETE',
    });
  }

  // Metrics endpoints
  async getEnzymeMetrics() {
    return this.request('/metrics/enzyme');
  }

  async getSpeciesMetrics() {
    return this.request('/metrics/species');
  }

  async createEnzymeMetric(metricData: any) {
    return this.request('/metrics/enzyme', {
      method: 'POST',
      body: JSON.stringify(metricData),
    });
  }

  async createSpeciesMetric(metricData: any) {
    return this.request('/metrics/species', {
      method: 'POST',
      body: JSON.stringify(metricData),
    });
  }

  async updateEnzymeMetric(id: number, metricData: any) {
    return this.request(`/metrics/enzyme/${id}`, {
      method: 'PUT',
      body: JSON.stringify(metricData),
    });
  }

  async updateSpeciesMetric(id: number, metricData: any) {
    return this.request(`/metrics/species/${id}`, {
      method: 'PUT',
      body: JSON.stringify(metricData),
    });
  }

  async deleteEnzymeMetric(id: number) {
    return this.request(`/metrics/enzyme/${id}`, {
      method: 'DELETE',
    });
  }

  async deleteSpeciesMetric(id: number) {
    return this.request(`/metrics/species/${id}`, {
      method: 'DELETE',
    });
  }

  // Submission endpoints
  async getMySubmissions() {
    return this.request('/submissions/my/submissions');
  }

  async getAllSubmissions(page = 1, limit = 10) {
    return this.request(`/submissions?page=${page}&limit=${limit}`);
  }

  async getSubmissionById(id: number) {
    return this.request(`/submissions/${id}`);
  }

  async createSubmission(submissionData: any) {
    return this.request('/submissions', {
      method: 'POST',
      body: JSON.stringify(submissionData),
    });
  }

  async updateSubmission(id: number, submissionData: any) {
    return this.request(`/submissions/${id}`, {
      method: 'PUT',
      body: JSON.stringify(submissionData),
    });
  }

  async deleteSubmission(id: number) {
    return this.request(`/submissions/${id}`, {
      method: 'DELETE',
    });
  }

  // Health check
  async healthCheck() {
    return this.request('/health');
  }
}

export const api = new ApiClient(API_BASE_URL);
export default api; 