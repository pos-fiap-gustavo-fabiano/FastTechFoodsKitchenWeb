export const API_BASE_URL = 'https://apim-hackathon-fiap.azure-api.net/identity/api';
export const API_BASE_ORDERS_URL = 'https://apim-hackathon-fiap.azure-api.net/kitchen/api';
export const API_BASE_CATALOG_URL = 'https://apim-hackathon-fiap.azure-api.net/menu/api';

export interface ApiError {
  message: string;
  details?: string;
  timestamp?: string;
}

export interface LoginResponse {
  access_token: string;
  refreshToken: string;
  user: {
    id: string;
    email: string;
    cpf: string;
    name: string;
    roles: string[];
  };
}

export interface RegisterRequest {
  email: string;
  cpf?: string;
  password: string;
  name: string;
  role: string;
}

export interface UserProfile {
  id: string;
  email: string;
  cpf: string;
  name: string;
  roles: string[];
}

export interface HealthStatus {
  status: string;
  results?: Record<string, unknown>;
  totalDuration?: string;
}

export interface InstanceInfo {
  podName: string;
  podNamespace: string;
  podIp: string;
  nodeName: string;
  applicationName: string;
  version: string;
  environment: string;
  platform: string;
  architecture: number;
  workingSet: number;
  startTime: string;
  uptime: string;
  requestId: string;
  timestamp: string;
  serviceAccount: string;
  clusterName: string;
}

export interface TokenInfo {
  isAuthenticated: boolean;
  authenticationType: string;
  name: string;
  userIdDebugging: Record<string, string>;
  totalClaims: number;
  claims: Array<{
    type: string;
    value: string;
    isStandardClaim: boolean;
  }>;
  timestamp: string;
}

export class ApiClient {
  private static getAuthHeaders(): HeadersInit {
    const token = localStorage.getItem('auth_token');
    return {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` }),
    };
  }

  static async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`;
    
    const config: RequestInit = {
      headers: this.getAuthHeaders(),
      ...options,
    };

    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        let errorMessage = 'Erro na requisição';
        
        try {
          const errorData = await response.json();
          errorMessage = errorData.message || errorData.details || errorMessage;
        } catch {
          errorMessage = `Erro ${response.status}: ${response.statusText}`;
        }
        
        throw new Error(errorMessage);
      }

      // Se a resposta for vazia (204 No Content), retornar null
      if (response.status === 204) {
        return null as T;
      }

      return await response.json();
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Erro de rede ou servidor indisponível');
    }
  }

  static async get<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'GET' });
  }

  static async post<T>(endpoint: string, data?: unknown): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  static async put<T>(endpoint: string, data?: unknown): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  static async delete<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'DELETE' });
  }

  static async patch<T>(endpoint: string, data?: unknown): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PATCH',
      body: data ? JSON.stringify(data) : undefined,
    });
  }
}

// Utility functions para health checks
export const HealthApi = {
  checkHealth: () => fetch(`${API_BASE_URL.replace('/api', '')}/health`).then(r => r.text()),
  checkDetailedHealth: () => fetch(`${API_BASE_URL.replace('/api', '')}/health/detailed`).then(r => r.json()),
  getInstanceInfo: () => ApiClient.get<InstanceInfo>('/instance/info'),
  getPodName: () => ApiClient.get<{ podName: string }>('/instance/pod-name'),
};

// Utility functions para autenticação
export const AuthApi = {
  login: (emailOrCpf: string, password: string) =>
    ApiClient.post<LoginResponse>('/auth/login', { emailOrCpf, password }),
  
  register: (userData: RegisterRequest) => 
    ApiClient.post<UserProfile>('/auth/register', userData),
  
  getCurrentUser: () => ApiClient.get<UserProfile>('/auth/eu'),
  
  getTokenInfo: () => ApiClient.get<TokenInfo>('/auth/token-info'),
  
  checkAdminAccess: () => ApiClient.get<{ message: string; userId: string; userName: string; roles: string }>('/auth/admin'),
};

// Interfaces para catálogo
export interface Category {
  id: string;
  name: string;
  description: string;
  isActive: boolean;
  createdDate?: string;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  availability: boolean;
  categoryId: string;
  imageUrl?: string;
  createdDate?: string;
}

export interface CreateCategoryRequest {
  name: string;
  description: string;
  isActive: boolean;
}

export interface CreateProductRequest {
  name: string;
  description: string;
  price: number;
  availability: boolean;
  categoryId: string;
}

export interface UpdateProductRequest {
  name: string;
  description: string;
  price: number;
  availability: boolean;
  categoryId: string;
}

export interface UpdateAvailabilityRequest {
  availability: boolean;
}

// Catalog API Client
export class CatalogApiClient {
  private static getAuthHeaders(): HeadersInit {
    const token = localStorage.getItem('auth_token');
    return {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` }),
    };
  }

  private static getCatalogUrl(endpoint: string): string {
    return `${API_BASE_CATALOG_URL}/${endpoint}`;
  }

  static async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = this.getCatalogUrl(endpoint);
    
    const config: RequestInit = {
      headers: this.getAuthHeaders(),
      ...options,
    };

    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        let errorMessage = 'Erro na requisição do catálogo';
        
        try {
          const errorData = await response.json();
          errorMessage = errorData.message || errorData.details || errorMessage;
        } catch {
          errorMessage = `Erro ${response.status}: ${response.statusText}`;
        }
        
        throw new Error(errorMessage);
      }

      // Se a resposta for vazia (204 No Content), retornar null
      if (response.status === 204) {
        return null as T;
      }

      return await response.json();
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Erro de rede ou servidor de catálogo indisponível');
    }
  }

  static async get<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'GET' });
  }

  static async post<T>(endpoint: string, data?: unknown): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  static async put<T>(endpoint: string, data?: unknown): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  static async delete<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'DELETE' });
  }

  static async patch<T>(endpoint: string, data?: unknown): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PATCH',
      body: data ? JSON.stringify(data) : undefined,
    });
  }
}

// Catalog API functions
export const CatalogApi = {
  // Categories
  getCategories: () => CatalogApiClient.get<Category[]>('categories'),
  getCategoryById: (id: string) => CatalogApiClient.get<Category>(`categories/${id}`),
  createCategory: (data: CreateCategoryRequest) => CatalogApiClient.post<Category>('categories', data),
  updateCategory: (id: string, data: CreateCategoryRequest) => CatalogApiClient.put<Category>(`categories/${id}`, data),
  deleteCategory: (id: string) => CatalogApiClient.delete<void>(`categories/${id}`),

  // Products
  getProductById: (id: string) => CatalogApiClient.get<Product>(`products/${id}`),
  getProductsByCategory: (categoryId: string) => CatalogApiClient.get<Product[]>(`categories/${categoryId}/products`),
  getAllProducts: () => CatalogApiClient.get<Product[]>('products'),
  createProduct: async (data: CreateProductRequest, imageFile?: File): Promise<Product> => {
    const url = `${API_BASE_CATALOG_URL}/products`;
    const token = localStorage.getItem('auth_token');
    
    const formData = new FormData();
    formData.append('Name', data.name);
    formData.append('Description', data.description);
    formData.append('Price', data.price.toString());
    formData.append('Availability', data.availability.toString());
    formData.append('CategoryId', data.categoryId);
    
    if (imageFile) {
      formData.append('Image', imageFile);
    }

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        ...(token && { 'Authorization': `Bearer ${token}` }),
      },
      body: formData,
    });

    if (!response.ok) {
      let errorMessage = 'Erro ao criar produto';
      try {
        const errorData = await response.json();
        errorMessage = errorData.message || errorData.details || errorMessage;
      } catch {
        errorMessage = `Erro ${response.status}: ${response.statusText}`;
      }
      throw new Error(errorMessage);
    }

    return await response.json();
  },
  updateProduct: (id: string, data: UpdateProductRequest) => CatalogApiClient.put<Product>(`products/${id}`, data),
  updateProductAvailability: (id: string, data: UpdateAvailabilityRequest) => CatalogApiClient.patch<Product>(`products/${id}/availability`, data),
  deleteProduct: (id: string) => CatalogApiClient.delete<void>(`products/${id}`),

  // Menu (optimized endpoint)
  getMenu: (categoryId?: string, search?: string) => {
    const params = new URLSearchParams();
    if (categoryId) params.append('categoryId', categoryId);
    if (search) params.append('search', search);
    const queryString = params.toString();
    return CatalogApiClient.get<Product[]>(`menu${queryString ? `?${queryString}` : ''}`);
  },
};

// Interfaces para pedidos
export interface OrderItem {
  name: string;
  quantity: number;
  unitPrice: number;
}

export interface ApiOrder {
  id: string;
  items: OrderItem[];
  total: number;
  status: 'pending' | 'accepted' | 'preparing' | 'ready' | 'cancelled' | 'Received';
  orderDate: string;
}

export interface UpdateOrderStatusRequest {
  status: string;
  updatedBy?: string;
  userName?: string;
  notes?: string;
}

// Analytics interfaces
export interface DashboardData {
  totalOrders: number;
  totalRevenue: number;
  avgOrderValue: number;
  pendingOrders: number;
  acceptedOrders: number;
  preparingOrders: number;
  readyOrders: number;
  cancelledOrders: number;
}

export interface OrdersByStatus {
  status: string;
  count: number;
}

export interface TopProduct {
  productName: string;
  quantity: number;
  revenue: number;
}

// Orders API Client
export class OrdersApiClient {
  private static getAuthHeaders(): HeadersInit {
    const token = localStorage.getItem('auth_token');
    return {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` }),
    };
  }

  private static getOrdersUrl(endpoint: string): string {
    // Para pedidos, usar porta 5180 em vez de 5271
    return `${API_BASE_ORDERS_URL}/${endpoint}`;
  }

  static async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = this.getOrdersUrl(endpoint);
    
    const config: RequestInit = {
      headers: this.getAuthHeaders(),
      ...options,
    };

    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        let errorMessage = 'Erro na requisição de pedidos';
        
        try {
          const errorData = await response.json();
          errorMessage = errorData.message || errorData.details || errorMessage;
        } catch {
          errorMessage = `Erro ${response.status}: ${response.statusText}`;
        }
        
        throw new Error(errorMessage);
      }

      // Se a resposta for vazia (204 No Content), retornar null
      if (response.status === 204) {
        return null as T;
      }

      return await response.json();
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Erro de rede ou servidor de pedidos indisponível');
    }
  }

  static async get<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'GET' });
  }

  static async put<T>(endpoint: string, data?: unknown): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    });
  }
}

// Orders API functions
export const OrdersApi = {
  // Buscar todos os pedidos (com filtro opcional por status)
  getOrders: (status?: string) => {
    const params = new URLSearchParams();
    if (status) params.append('status', status);
    const queryString = params.toString();
    return OrdersApiClient.get<ApiOrder[]>(`orders${queryString ? `?${queryString}` : ''}`);
  },
  
  // Buscar pedido específico por ID
  getOrderById: (orderId: string) => OrdersApiClient.get<ApiOrder>(`orders/${orderId}`),
  
  // Buscar apenas pedidos pendentes (endpoint otimizado)
  getPendingOrders: () => OrdersApiClient.get<ApiOrder[]>('orders/pending'),
  
  // Atualizar status do pedido
  updateOrderStatus: (orderId: string, data: UpdateOrderStatusRequest) => 
    OrdersApiClient.put<void>(`orders/${orderId}/status`, data),
};

// Analytics API functions
export const AnalyticsApi = {
  // Dashboard com dados gerais
  getDashboard: (startDate?: string, endDate?: string, status?: string) => {
    const params = new URLSearchParams();
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    if (status) params.append('status', status);
    const queryString = params.toString();
    return OrdersApiClient.get<DashboardData>(`Analytics/dashboard${queryString ? `?${queryString}` : ''}`);
  },
  
  // Pedidos por status
  getOrdersByStatus: (startDate?: string, endDate?: string) => {
    const params = new URLSearchParams();
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    const queryString = params.toString();
    return OrdersApiClient.get<OrdersByStatus[]>(`Analytics/orders-by-status${queryString ? `?${queryString}` : ''}`);
  },
  
  // Top produtos
  getTopProducts: (top: number = 5, startDate?: string, endDate?: string) => {
    const params = new URLSearchParams();
    params.append('top', top.toString());
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    const queryString = params.toString();
    return OrdersApiClient.get<TopProduct[]>(`Analytics/top-products${queryString ? `?${queryString}` : ''}`);
  },
  
  // Health check
  getHealth: () => OrdersApiClient.get<{ status: string }>('Analytics/health'),
};

// Catalog API functions
