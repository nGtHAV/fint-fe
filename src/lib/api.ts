/**
 * API Service for Fint Backend
 */

const DEFAULT_API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://api.fint.ngthav.xyz';
const DEFAULT_AI_URL = process.env.NEXT_PUBLIC_AI_URL || 'http://localhost:5001';
const API_URL_KEY = 'fint_api_url';
const AI_URL_KEY = 'fint_ai_url';

// Get/Set API URL
export const getApiUrl = (): string => {
  if (typeof window === 'undefined') return DEFAULT_API_URL;
  return localStorage.getItem(API_URL_KEY) || DEFAULT_API_URL;
};

export const setApiUrl = (url: string): void => {
  localStorage.setItem(API_URL_KEY, url);
};

export const getDefaultApiUrl = (): string => DEFAULT_API_URL;

// Get/Set AI API URL
export const getAiUrl = (): string => {
  if (typeof window === 'undefined') return DEFAULT_AI_URL;
  return localStorage.getItem(AI_URL_KEY) || DEFAULT_AI_URL;
};

export const setAiUrl = (url: string): void => {
  localStorage.setItem(AI_URL_KEY, url);
};

export const getDefaultAiUrl = (): string => DEFAULT_AI_URL;

// Types
export interface User {
  id: number;
  name: string;
  email: string;
  avatar_url?: string;
  created_at?: string;
}

export interface Receipt {
  id: number;
  user_id: number;
  name: string;
  amount: number;
  category: string;
  date: string;
  image_url?: string;
  notes?: string;
  created_at?: string;
  updated_at?: string;
}

export interface Category {
  id: number;
  name: string;
  icon: string;
  color: string;
}

export interface AuthResponse {
  message: string;
  token: string;
  user: User;
}

export interface ApiError {
  error: string;
}

// Token management
const TOKEN_KEY = 'fint_token';
const USER_KEY = 'fint_user';

export const getToken = (): string | null => {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(TOKEN_KEY);
};

export const setToken = (token: string): void => {
  localStorage.setItem(TOKEN_KEY, token);
};

export const removeToken = (): void => {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
};

export const getStoredUser = (): User | null => {
  if (typeof window === 'undefined') return null;
  const user = localStorage.getItem(USER_KEY);
  return user ? JSON.parse(user) : null;
};

export const setStoredUser = (user: User): void => {
  localStorage.setItem(USER_KEY, JSON.stringify(user));
};

// API request helper
async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token = getToken();
  const apiUrl = getApiUrl();
  
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (token) {
    (headers as Record<string, string>)['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${apiUrl}${endpoint}`, {
    ...options,
    headers,
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || 'An error occurred');
  }

  return data;
}

// ==================== AUTH API ====================

export const authApi = {
  async register(name: string, email: string, password: string): Promise<AuthResponse> {
    const data = await apiRequest<AuthResponse>('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify({ name, email, password }),
    });
    setToken(data.token);
    setStoredUser(data.user);
    return data;
  },

  async login(email: string, password: string): Promise<AuthResponse> {
    const data = await apiRequest<AuthResponse>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    setToken(data.token);
    setStoredUser(data.user);
    return data;
  },

  async getCurrentUser(): Promise<{ user: User }> {
    return apiRequest<{ user: User }>('/api/auth/me');
  },

  logout(): void {
    removeToken();
  },

  isAuthenticated(): boolean {
    return !!getToken();
  },
};

// ==================== RECEIPTS API ====================

export interface CreateReceiptData {
  name: string;
  amount: number;
  category: string;
  date: string;
  imageData?: string; // Base64 encoded image
  notes?: string;
}

export const receiptsApi = {
  async getAll(params?: {
    category?: string;
    start_date?: string;
    end_date?: string;
    limit?: number;
  }): Promise<{ receipts: Receipt[] }> {
    const searchParams = new URLSearchParams();
    if (params?.category) searchParams.append('category', params.category);
    if (params?.start_date) searchParams.append('start_date', params.start_date);
    if (params?.end_date) searchParams.append('end_date', params.end_date);
    if (params?.limit) searchParams.append('limit', params.limit.toString());

    const query = searchParams.toString();
    return apiRequest<{ receipts: Receipt[] }>(`/api/receipts${query ? `?${query}` : ''}`);
  },

  async getById(id: number): Promise<{ receipt: Receipt }> {
    return apiRequest<{ receipt: Receipt }>(`/api/receipts/${id}`);
  },

  async create(data: CreateReceiptData): Promise<{ receipt: Receipt }> {
    return apiRequest<{ receipt: Receipt }>('/api/receipts', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async update(id: number, data: Partial<CreateReceiptData>): Promise<{ receipt: Receipt }> {
    return apiRequest<{ receipt: Receipt }>(`/api/receipts/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  async delete(id: number): Promise<{ message: string }> {
    return apiRequest<{ message: string }>(`/api/receipts/${id}`, {
      method: 'DELETE',
    });
  },
};

// ==================== STATS API ====================

export interface StatsSummary {
  total_spent: number;
  monthly_spent: number;
  total_receipts: number;
  categories: { category: string; total: number }[];
  top_category: string | null;
}

export interface MonthlyStats {
  monthly: { month: string; total: number }[];
}

export const statsApi = {
  async getSummary(): Promise<StatsSummary> {
    return apiRequest<StatsSummary>('/api/stats/summary');
  },

  async getMonthly(): Promise<MonthlyStats> {
    return apiRequest<MonthlyStats>('/api/stats/monthly');
  },
};

// ==================== CATEGORIES API ====================

export const categoriesApi = {
  async getAll(): Promise<{ categories: Category[] }> {
    return apiRequest<{ categories: Category[] }>('/api/categories');
  },
};

// ==================== USERS API ====================

export const usersApi = {
  async updateProfile(data: { name?: string; avatar_url?: string }): Promise<{ user: User }> {
    return apiRequest<{ user: User }>('/api/users/profile', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  async changePassword(currentPassword: string, newPassword: string): Promise<{ message: string }> {
    return apiRequest<{ message: string }>('/api/users/password', {
      method: 'PUT',
      body: JSON.stringify({ currentPassword, newPassword }),
    });
  },

  async deleteAccount(): Promise<{ message: string }> {
    return apiRequest<{ message: string }>('/api/users/delete', {
      method: 'DELETE',
    });
  },
};

// ==================== HEALTH CHECK ====================

export const healthApi = {
  async check(): Promise<{ status: string; timestamp: string }> {
    return apiRequest<{ status: string; timestamp: string }>('/api/health');
  },
};

// ==================== OCR/AI API ====================

export interface OCRResult {
  success: boolean;
  merchant?: string;
  total?: number;
  date?: string;
  category?: string;
  items?: { name: string; price: number }[];
  raw_text?: string;
  language?: string;
  provider?: string;
  error?: string;
}

export interface AIProviderInfo {
  current_provider: string;
  default_language: string;
  provider_info: {
    name: string;
    type: string;
    description: string;
    requires_api_key: boolean;
    supported_languages: string[];
  };
  available_providers: string[];
}

export const ocrApi = {
  async scanReceipt(imageData: string, language: 'en' | 'km' = 'en'): Promise<OCRResult> {
    const aiUrl = getAiUrl();
    
    const response = await fetch(`${aiUrl}/api/ocr/scan`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ image: imageData, language }),
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error || 'OCR request failed');
    }
    
    return data;
  },

  async getProviderInfo(): Promise<AIProviderInfo> {
    const aiUrl = getAiUrl();
    
    const response = await fetch(`${aiUrl}/api/ocr/provider`);
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error || 'Failed to get provider info');
    }
    
    return data;
  },

  async checkHealth(): Promise<{ status: string; service: string; timestamp: string }> {
    const aiUrl = getAiUrl();
    
    const response = await fetch(`${aiUrl}/api/health`);
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error || 'AI service health check failed');
    }
    
    return data;
  },
};
