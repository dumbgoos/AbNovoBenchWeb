// API service configuration
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || '/api';

// Get authentication header
const getAuthHeader = () => {
  const token = localStorage.getItem('token');
  return token ? `Bearer ${token}` : '';
};

// Common API request function
async function apiRequest(endpoint: string, options: RequestInit = {}) {
  const url = `${API_BASE_URL}${endpoint}`;
  
  console.log('🔍 API Request:', {
    url,
    method: options.method || 'GET',
    headers: options.headers
  });
  
  const config: RequestInit = {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  };

  // Add authentication token
  const token = localStorage.getItem('token');
  if (token) {
    config.headers = {
      ...config.headers,
      Authorization: `Bearer ${token}`,
    } as HeadersInit;
  }

  try {
    const response = await fetch(url, config);
    
    console.log('📡 API Response:', {
      status: response.status,
      statusText: response.statusText,
      ok: response.ok,
      url
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      let errorMessage = 'API request failed';
      let errorData: any = null;
      
      try {
        errorData = JSON.parse(errorText);
        errorMessage = errorData.message || `HTTP ${response.status}: ${response.statusText}`;
      } catch {
        errorMessage = errorText || `HTTP ${response.status}: ${response.statusText}`;
      }
      
      const errorInfo = {
        status: response.status,
        statusText: response.statusText,
        message: errorMessage,
        url,
        endpoint,
        method: options.method || 'GET',
        errorData: errorData,
        timestamp: new Date().toISOString()
      };
      
      console.error('❌ API Error:', errorInfo);
      
      throw new Error(errorMessage);
    }

    const data = await response.json();
    console.log('✅ API Success:', {
      url,
      endpoint,
      status: response.status,
      hasData: !!data,
      dataKeys: data && typeof data === 'object' ? Object.keys(data) : 'non-object response',
      timestamp: new Date().toISOString()
    });
    
    return data;
  } catch (error) {
    // Create detailed error information object
    const errorInfo: any = {
      url,
      endpoint,
      method: options.method || 'GET',
      timestamp: new Date().toISOString(),
      baseUrl: API_BASE_URL
    };

    // Check if it's a network error
    if (error instanceof TypeError && error.message.includes('fetch')) {
      errorInfo.type = 'NetworkError';
      errorInfo.message = 'Unable to connect to backend server, please check if backend is running';
      errorInfo.originalMessage = error.message;
      
      console.error('❌ Network Connection Error:', errorInfo);
      throw new Error('Network connection failed, please check if backend server is running');
    }
    
    // Handle other types of errors
    if (error instanceof Error) {
      errorInfo.type = error.constructor.name;
      errorInfo.message = error.message;
      if (process.env.NODE_ENV === 'development' && error.stack) {
        errorInfo.stack = error.stack.split('\n').slice(0, 5).join('\n'); // Keep only first 5 lines of stack trace
      }
    } else {
      errorInfo.type = 'UnknownError';
      errorInfo.message = String(error);
      errorInfo.errorValue = error;
    }
    
    console.error('❌ API Request Exception:', errorInfo);
    throw error;
  }
}

// Authentication related APIs
export const authAPI = {
  // User login
  login: async (credentials: { username: string; password: string }) => {
    return apiRequest('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
  },

  // User registration
  register: async (userData: { username: string; email: string; password: string }) => {
    return apiRequest('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  },

  // Get current user information
  getCurrentUser: async () => {
    return apiRequest('/auth/me');
  },

  // Verify token
  verifyToken: async () => {
    return apiRequest('/auth/verify');
  },

  // Update user information
  updateProfile: async (userData: any) => {
    return apiRequest('/auth/profile', {
      method: 'PUT',
      body: JSON.stringify(userData),
    });
  },

  // Update password
  updatePassword: async (passwordData: { currentPassword: string; newPassword: string }) => {
    return apiRequest('/auth/password', {
      method: 'PUT',
      body: JSON.stringify(passwordData),
    });
  },
};

// Model related APIs
export const modelsAPI = {
  // Get all models
  getAllModels: async (params?: { page?: number; limit?: number; architecture?: string }) => {
    const searchParams = new URLSearchParams();
    if (params?.page) searchParams.append('page', params.page.toString());
    if (params?.limit) searchParams.append('limit', params.limit.toString());
    if (params?.architecture) searchParams.append('architecture', params.architecture);
    
    const queryString = searchParams.toString();
    return apiRequest(`/models${queryString ? `?${queryString}` : ''}`);
  },

  // Get model details
  getModelById: async (id: string) => {
    return apiRequest(`/models/${id}`);
  },

  // Create model (admin)
  createModel: async (modelData: any) => {
    return apiRequest('/models', {
      method: 'POST',
      body: JSON.stringify(modelData),
    });
  },

  // Update model (admin)
  updateModel: async (id: string, modelData: any) => {
    return apiRequest(`/models/${id}`, {
      method: 'PUT',
      body: JSON.stringify(modelData),
    });
  },

  // Delete model (admin)
  deleteModel: async (id: string) => {
    return apiRequest(`/models/${id}`, {
      method: 'DELETE',
    });
  },

  // Get model statistics
  getModelStats: async () => {
    return apiRequest('/models/stats/overview');
  },

  // Search models by architecture
  searchByArchitecture: async (architecture: string) => {
    return apiRequest(`/models/search/architecture?architecture=${encodeURIComponent(architecture)}`);
  },

  // Get model file information
  getModelFileInfo: async (id: string) => {
    return apiRequest(`/download/models/${id}/info`);
  },

  // Download model code file
  downloadModelCode: async (id: string, modelName: string) => {
    try {
      const token = localStorage.getItem('token');
      const headers: HeadersInit = {};
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const response = await fetch(`${API_BASE_URL}/download/models/${id}/code`, {
        method: 'GET',
        headers,
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      // Get file name
      const contentDisposition = response.headers.get('Content-Disposition');
      let filename = `${modelName.replace(/[^a-zA-Z0-9]/g, '_')}_code.zip`;
      if (contentDisposition) {
        const filenameMatch = contentDisposition.match(/filename="(.+)"/);
        if (filenameMatch) {
          filename = filenameMatch[1];
        }
      }

      // Download file
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      return { success: true, filename };
    } catch (error) {
      console.error('Download code error:', error);
      throw error;
    }
  },

  // Download model checkpoint file
  downloadModelCheckpoint: async (id: string, modelName: string) => {
    try {
      const token = localStorage.getItem('token');
      const headers: HeadersInit = {};
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const response = await fetch(`${API_BASE_URL}/download/models/${id}/checkpoint`, {
        method: 'GET',
        headers,
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      // Get file name
      const contentDisposition = response.headers.get('Content-Disposition');
      let filename = `${modelName.replace(/[^a-zA-Z0-9]/g, '_')}_checkpoint.pth`;
      if (contentDisposition) {
        const filenameMatch = contentDisposition.match(/filename="(.+)"/);
        if (filenameMatch) {
          filename = filenameMatch[1];
        }
      }

      // Download file
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      return { success: true, filename };
    } catch (error) {
      console.error('Download checkpoint error:', error);
      throw error;
    }
  },
};

// Metrics related APIs
export const metricsAPI = {
  // Enzyme metrics
  enzyme: {
    // Get all enzyme metrics
    getAll: async (params?: { page?: number; limit?: number }) => {
      const searchParams = new URLSearchParams();
      if (params?.page) searchParams.append('page', params.page.toString());
      if (params?.limit) searchParams.append('limit', params.limit.toString());
      
      const queryString = searchParams.toString();
      return apiRequest(`/metrics/enzyme${queryString ? `?${queryString}` : ''}`);
    },

    // Get enzyme metrics for a model
    getByModelId: async (modelId: string) => {
      return apiRequest(`/metrics/enzyme/model/${modelId}`);
    },

    // Create enzyme metric
    create: async (metricData: any) => {
      return apiRequest('/metrics/enzyme', {
        method: 'POST',
        body: JSON.stringify(metricData),
      });
    },

    // Update enzyme metric
    update: async (id: string, metricData: any) => {
      return apiRequest(`/metrics/enzyme/${id}`, {
        method: 'PUT',
        body: JSON.stringify(metricData),
      });
    },

    // Delete enzyme metric
    delete: async (id: string) => {
      return apiRequest(`/metrics/enzyme/${id}`, {
        method: 'DELETE',
      });
    },

    // Get enzyme metrics leaderboard
    getLeaderboard: async () => {
      return apiRequest('/metrics/enzyme/leaderboard');
    },

    // Get all enzyme types
    getTypes: async () => {
      return apiRequest('/metrics/enzyme/types');
    },

    // Get enzyme metrics statistics
    getStats: async () => {
      return apiRequest('/metrics/enzyme/stats');
    },
  },

  // Species metrics
  species: {
    // Get all species metrics
    getAll: async (params?: { page?: number; limit?: number }) => {
      const searchParams = new URLSearchParams();
      if (params?.page) searchParams.append('page', params.page.toString());
      if (params?.limit) searchParams.append('limit', params.limit.toString());
      
      const queryString = searchParams.toString();
      return apiRequest(`/metrics/species${queryString ? `?${queryString}` : ''}`);
    },

    // Get species metrics for a model
    getByModelId: async (modelId: string) => {
      return apiRequest(`/metrics/species/model/${modelId}`);
    },

    // Create species metric
    create: async (metricData: any) => {
      return apiRequest('/metrics/species', {
        method: 'POST',
        body: JSON.stringify(metricData),
      });
    },

    // Update species metric
    update: async (id: string, metricData: any) => {
      return apiRequest(`/metrics/species/${id}`, {
        method: 'PUT',
        body: JSON.stringify(metricData),
      });
    },

    // Delete species metric
    delete: async (id: string) => {
      return apiRequest(`/metrics/species/${id}`, {
        method: 'DELETE',
      });
    },

    // Get species metrics leaderboard
    getLeaderboard: async () => {
      return apiRequest('/metrics/species/leaderboard');
    },

    // Get all species types
    getTypes: async () => {
      return apiRequest('/metrics/species/types');
    },

    // Get species metrics statistics
    getStats: async () => {
      return apiRequest('/metrics/species/stats');
    },
  },

  // Summary metrics
  all: {
    // Get all summary metrics
    getAll: async (params?: { page?: number; limit?: number }) => {
      const searchParams = new URLSearchParams();
      if (params?.page) searchParams.append('page', params.page.toString());
      if (params?.limit) searchParams.append('limit', params.limit.toString());
      
      const queryString = searchParams.toString();
      return apiRequest(`/metrics/all${queryString ? `?${queryString}` : ''}`);
    },

    // Get summary metrics for a model
    getByModelId: async (modelId: string) => {
      return apiRequest(`/metrics/all/model/${modelId}`);
    },

    // Create summary metric
    create: async (metricData: any) => {
      return apiRequest('/metrics/all', {
        method: 'POST',
        body: JSON.stringify(metricData),
      });
    },

    // Update summary metric
    update: async (id: string, metricData: any) => {
      return apiRequest(`/metrics/all/${id}`, {
        method: 'PUT',
        body: JSON.stringify(metricData),
      });
    },

    // Delete summary metric
    delete: async (id: string) => {
      return apiRequest(`/metrics/all/${id}`, {
        method: 'DELETE',
      });
    },

    // Get summary metrics leaderboard
    getLeaderboard: async (limit?: number) => {
      const queryString = limit ? `?limit=${limit}` : '';
      return apiRequest(`/metrics/all/leaderboard${queryString}`);
    },

    // Get summary metrics statistics
    getStats: async () => {
      return apiRequest('/metrics/all/stats');
    },
  },

  // Get model comparison data
  getComparison: async (modelId: string) => {
    return apiRequest(`/metrics/comparison/${modelId}`);
  },

  // Error types related APIs
  errorTypes: {
    // Get all error types metrics
    getAll: async (params?: { page?: number; limit?: number }) => {
      const searchParams = new URLSearchParams();
      if (params?.page) searchParams.append('page', params.page.toString());
      if (params?.limit) searchParams.append('limit', params.limit.toString());
      
      const queryString = searchParams.toString();
      return apiRequest(`/metrics/error-types${queryString ? `?${queryString}` : ''}`);
    },

    // Get error types for a model
    getByModelId: async (modelId: string) => {
      return apiRequest(`/metrics/error-types/model/${modelId}`);
    },

    // Create error types metric
    create: async (metricData: any) => {
      return apiRequest('/metrics/error-types', {
        method: 'POST',
        body: JSON.stringify(metricData),
      });
    },

    // Update error types metric
    update: async (id: string, metricData: any) => {
      return apiRequest(`/metrics/error-types/${id}`, {
        method: 'PUT',
        body: JSON.stringify(metricData),
      });
    },

    // Delete error types metric
    delete: async (id: string) => {
      return apiRequest(`/metrics/error-types/${id}`, {
        method: 'DELETE',
      });
    },

    // Get error types leaderboard
    getLeaderboard: async (limit?: number) => {
      const queryString = limit ? `?limit=${limit}` : '';
      return apiRequest(`/metrics/error-types/leaderboard${queryString}`);
    },

    // Get error types statistics
    getStats: async () => {
      return apiRequest('/metrics/error-types/stats');
    },
  },
};

// Submission related APIs
export const submissionsAPI = {
  // Get all submission records (admin)
  getAll: async (params?: { page?: number; limit?: number }) => {
    const searchParams = new URLSearchParams();
    if (params?.page) searchParams.append('page', params.page.toString());
    if (params?.limit) searchParams.append('limit', params.limit.toString());
    
    const queryString = searchParams.toString();
    return apiRequest(`/submissions${queryString ? `?${queryString}` : ''}`);
  },

  // Get submission details
  getById: async (id: string) => {
    return apiRequest(`/submissions/${id}`);
  },

  // Create submission record (supports file upload)
  create: async (formData: FormData) => {
    const token = localStorage.getItem('token');
    
    const response = await fetch(`${API_BASE_URL}/submissions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        // Don't set Content-Type, let browser set multipart/form-data automatically
      },
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: 'Request failed' }));
      throw new Error(errorData.message || `HTTP ${response.status}`);
    }

    return response.json();
  },

  // Update submission record (supports file upload)
  update: async (id: string, formData: FormData) => {
    const token = localStorage.getItem('token');
    
    const response = await fetch(`${API_BASE_URL}/submissions/${id}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        // Don't set Content-Type, let browser set multipart/form-data automatically
      },
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: 'Request failed' }));
      throw new Error(errorData.message || `HTTP ${response.status}`);
    }

    return response.json();
  },

  // Delete submission record
  delete: async (id: string) => {
    return apiRequest(`/submissions/${id}`, {
      method: 'DELETE',
    });
  },

  // Get submission records for the current user
  getMy: async (userId?: string) => {
    // Use the new /my/submissions endpoint which doesn't require userId
    return apiRequest('/submissions/my/submissions');
  },

  // Get submission records by architecture
  getByArchitecture: async (architecture: string) => {
    return apiRequest(`/submissions/architecture/${encodeURIComponent(architecture)}`);
  },

  // Get submission statistics
  getStats: async () => {
    return apiRequest('/submissions/stats/overview');
  },

  // Get recent submission records
  getRecent: async (limit = 10) => {
    return apiRequest(`/submissions/recent/list?limit=${limit}`);
  },

  // Get all architecture types
  getArchitectures: async () => {
    return apiRequest('/submissions/architectures/list');
  },

  // Search submission records
  search: async (query: string) => {
    return apiRequest(`/submissions/search/query?q=${encodeURIComponent(query)}`);
  },

  // Download file
  downloadFile: async (id: string, type: 'code' | 'model') => {
    const token = localStorage.getItem('token');
    
    const response = await fetch(`${API_BASE_URL}/submissions/${id}/download/${type}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error(`Download failed: HTTP ${response.status}`);
    }

    const blob = await response.blob();
    const fileName = response.headers.get('content-disposition')?.split('filename=')[1]?.replace(/"/g, '') || `${type}_${id}.zip`;
    
    // Create download link
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.style.display = 'none';
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  },
};

// User related APIs (admin)
export const usersAPI = {
  // Get all users
  getAll: async (params?: { page?: number; limit?: number }) => {
    const searchParams = new URLSearchParams();
    if (params?.page) searchParams.append('page', params.page.toString());
    if (params?.limit) searchParams.append('limit', params.limit.toString());
    
    const queryString = searchParams.toString();
    return apiRequest(`/users${queryString ? `?${queryString}` : ''}`);
  },

  // Get user details
  getById: async (id: string) => {
    return apiRequest(`/users/${id}`);
  },

  // Create user
  create: async (userData: any) => {
    return apiRequest('/users', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  },

  // Update user
  update: async (id: string, userData: any) => {
    return apiRequest(`/users/${id}`, {
      method: 'PUT',
      body: JSON.stringify(userData),
    });
  },

  // Delete user
  delete: async (id: string) => {
    return apiRequest(`/users/${id}`, {
      method: 'DELETE',
    });
  },

  // Reset user password
  resetPassword: async (id: string) => {
    return apiRequest(`/users/${id}/reset-password`, {
      method: 'POST',
    });
  },

  // Get user statistics
  getStats: async () => {
    return apiRequest('/users/stats/overview');
  },

  // Search users
  search: async (query: string) => {
    return apiRequest(`/users/search/query?q=${encodeURIComponent(query)}`);
  },

  // Get user activity records
  getActivity: async (id: string) => {
    return apiRequest(`/users/${id}/activity`);
  },
};

// System related APIs
export const systemAPI = {
  // Health check
  healthCheck: async () => {
    return apiRequest('/health');
  },
};

// Test network connection
export const testConnection = async () => {
  try {
    console.log('🔍 Testing network connection to:', API_BASE_URL);
    const response = await fetch(`${API_BASE_URL}/health`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ Network connection successful:', data);
      return true;
    } else {
      console.error('❌ Network connection failed:', response.status, response.statusText);
      return false;
    }
  } catch (error) {
    console.error('❌ Network connection exception:', error);
    return false;
  }
};

// Datasets API
export const datasetsAPI = {
  // 获取所有MGF文件列表
  getMGFFiles: async () => {
    return apiRequest('/datasets/mgf');
  },

  // 获取MGF文件预览
  getMGFFilePreview: async (fileId: string) => {
    return apiRequest(`/datasets/mgf/${fileId}/preview`);
  },

  // 下载MGF文件
  downloadMGF: async (fileId: string) => {
    const token = localStorage.getItem('token');
    const url = `${API_BASE_URL}/datasets/mgf/${fileId}/download`;
    
    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          ...(token && { Authorization: `Bearer ${token}` }),
        },
      });

      if (!response.ok) {
        throw new Error(`Download failed: ${response.statusText}`);
      }

      // Get filename from Content-Disposition header
      const contentDisposition = response.headers.get('Content-Disposition');
      let filename = 'download.mgf';
      if (contentDisposition) {
        const matches = contentDisposition.match(/filename="(.+)"/);
        if (matches) {
          filename = matches[1];
        }
      }

      // Create blob and download
      const blob = await response.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(downloadUrl);

      return { success: true, filename };
    } catch (error) {
      console.error('Download error:', error);
      throw error;
    }
  }
};

// Efficiency APIs
export const efficiencyAPI = {
  // Get all efficiency data
  getAll: async () => {
    return apiRequest('/efficiency');
  },

  // Get efficiency data by model name
  getByModel: async (modelName: string) => {
    return apiRequest(`/efficiency/${encodeURIComponent(modelName)}`);
  },
};

// Robustness APIs
export const robustnessAPI = {
  // Get all indicators list
  getIndicators: async () => {
    return apiRequest('/robustness/indicators');
  },

  // Get all robustness data (backward compatible)
  getAll: async () => {
    return apiRequest('/robustness');
  },

  // Get specific indicator data
  getIndicatorData: async (indicatorKey: string) => {
    return apiRequest(`/robustness/indicator/${encodeURIComponent(indicatorKey)}`);
  },

  // Get specific indicator and tool data
  getIndicatorByTool: async (indicatorKey: string, toolName: string) => {
    return apiRequest(`/robustness/indicator/${encodeURIComponent(indicatorKey)}/tool/${encodeURIComponent(toolName)}`);
  },

  // Get robustness data by tool name (backward compatible)
  getByTool: async (toolName: string) => {
    return apiRequest(`/robustness/${encodeURIComponent(toolName)}`);
  },
};

// Data Request APIs
export const dataRequestAPI = {
  // Create a new data request
  createRequest: async (requestData: {
    dataName: string;
    purpose: string;
    organization: string;
    contactEmail: string;
    additionalInfo?: string;
  }) => {
    return apiRequest('/data-requests', {
      method: 'POST',
      body: JSON.stringify(requestData),
    });
  },

  // Get current user's requests
  getMyRequests: async () => {
    return apiRequest('/data-requests/my');
  },

  // Get request by ID
  getRequestById: async (id: string) => {
    return apiRequest(`/data-requests/${id}`);
  },

  // Get all requests (admin only)
  getAllRequests: async (page = 1, limit = 50) => {
    const searchParams = new URLSearchParams();
    searchParams.append('page', page.toString());
    searchParams.append('limit', limit.toString());
    
    return apiRequest(`/data-requests?${searchParams.toString()}`);
  },

  // Get pending requests (admin only)
  getPendingRequests: async () => {
    return apiRequest('/data-requests/admin/pending');
  },

  // Review a request (admin only)
  reviewRequest: async (id: string, isApproved: boolean) => {
    return apiRequest(`/data-requests/${id}/review`, {
      method: 'PUT',
      body: JSON.stringify({ isApproved }),
    });
  },

  // Get request statistics (admin only)
  getStatistics: async () => {
    return apiRequest('/data-requests/admin/statistics');
  },
};

// Assembly APIs
export const assemblyAPI = {
  // Get assembly scores data
  getScores: async (page = 1, limit = 50) => {
    const searchParams = new URLSearchParams();
    searchParams.append('page', page.toString());
    searchParams.append('limit', limit.toString());
    
    return apiRequest(`/assembly/scores?${searchParams.toString()}`);
  },

  // Get assembly statistics data
  getStats: async (page = 1, limit = 50) => {
    const searchParams = new URLSearchParams();
    searchParams.append('page', page.toString());
    searchParams.append('limit', limit.toString());
    
    return apiRequest(`/assembly/stats?${searchParams.toString()}`);
  },

  // Get ALPS results data
  getAlps: async (page = 1, limit = 50) => {
    const searchParams = new URLSearchParams();
    searchParams.append('page', page.toString());
    searchParams.append('limit', limit.toString());
    
    return apiRequest(`/assembly/alps?${searchParams.toString()}`);
  },
};

// Export all APIs
export default {
  auth: authAPI,
  models: modelsAPI,
  metrics: metricsAPI,
  submissions: submissionsAPI,
  users: usersAPI,
  system: systemAPI,
  datasets: datasetsAPI,
  efficiency: efficiencyAPI,
  robustness: robustnessAPI,
  dataRequests: dataRequestAPI,
  assembly: assemblyAPI,
}; 