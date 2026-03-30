import { 
  Content, 
  ContentInput, 
  Category, 
  Tag, 
  FAQ, 
  FAQInput, 
  HomePageSection, 
  HomePageSectionInput,
  SiteStyle,
  NavItem,
  SiteSettings,
  MediaItem,
  Redirect,
  PaginatedResponse,
  AuthResponse,
  VerifyResponse,
  ApiError
} from '../types';

const API_BASE = '/api';

async function request<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const token = localStorage.getItem('cms_auth_token');
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(options?.headers as Record<string, string> || {}),
  };

  try {
    const response = await fetch(`${API_BASE}${endpoint}`, {
      ...options,
      headers,
    });

    if (!response.ok) {
      const error: ApiError = await response.json().catch(() => ({ 
        message: 'Request failed' 
      }));
      throw new Error(error.message || `HTTP ${response.status}`);
    }

    return response.json();
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('Network error occurred');
  }
}

export const api = {
  // Content
  getContent: (type?: string, page?: number, limit?: number) => {
    const params = new URLSearchParams();
    if (type) params.append('type', type);
    if (page) params.append('page', page.toString());
    if (limit) params.append('limit', limit.toString());
    const query = params.toString();
    return request<PaginatedResponse<Content>>(`/content${query ? `?${query}` : ''}`);
  },
  
  getContentBySlug: (slug: string) =>
    request<{ data: Content }>(`/content/${slug}`),
  
  getContentById: (id: string) =>
    request<{ data: Content }>(`/content/id/${id}`),
  
  createContent: (data: ContentInput) =>
    request<{ data: Content }>('/content', { 
      method: 'POST', 
      body: JSON.stringify(data) 
    }),
  
  updateContent: (id: string, data: Partial<ContentInput>) =>
    request<{ data: Content }>(`/content/${id}`, { 
      method: 'PUT', 
      body: JSON.stringify(data) 
    }),
  
  deleteContent: (id: string) =>
    request<{ success: boolean; message: string }>(`/content/${id}`, { 
      method: 'DELETE' 
    }),

  // Categories
  getCategories: () => 
    request<{ data: Category[] }>('/categories'),
  
  createCategory: (data: { name: string; slug?: string; description?: string }) =>
    request<{ data: Category }>('/categories', { 
      method: 'POST', 
      body: JSON.stringify(data) 
    }),
  
  updateCategory: (id: string, data: Partial<{ name: string; slug: string; description: string }>) =>
    request<{ data: Category }>(`/categories/${id}`, { 
      method: 'PUT', 
      body: JSON.stringify(data) 
    }),
  
  deleteCategory: (id: string) =>
    request<{ success: boolean; message: string }>(`/categories/${id}`, { 
      method: 'DELETE' 
    }),

  // Tags
  getTags: () => 
    request<{ data: Tag[] }>('/tags'),
  
  createTag: (data: { name: string; slug?: string }) =>
    request<{ data: Tag }>('/tags', { 
      method: 'POST', 
      body: JSON.stringify(data) 
    }),
  
  updateTag: (id: string, data: Partial<{ name: string; slug: string }>) =>
    request<{ data: Tag }>(`/tags/${id}`, { 
      method: 'PUT', 
      body: JSON.stringify(data) 
    }),
  
  deleteTag: (id: string) =>
    request<{ success: boolean; message: string }>(`/tags/${id}`, { 
      method: 'DELETE' 
    }),

  // FAQs
  getFAQs: (pageId?: string) => {
    const params = pageId ? `?page_id=${pageId}` : '';
    return request<{ data: FAQ[] }>(`/faqs${params}`);
  },
  
  createFAQ: (data: FAQInput) =>
    request<{ data: FAQ }>('/faqs', { 
      method: 'POST', 
      body: JSON.stringify(data) 
    }),
  
  updateFAQ: (id: string, data: Partial<FAQInput>) =>
    request<{ data: FAQ }>(`/faqs/${id}`, { 
      method: 'PUT', 
      body: JSON.stringify(data) 
    }),
  
  deleteFAQ: (id: string) =>
    request<{ success: boolean; message: string }>(`/faqs/${id}`, { 
      method: 'DELETE' 
    }),

  // Homepage
  getHomePageSections: () => 
    request<{ data: HomePageSection[] }>('/homepage'),
  
  updateHomePageSection: (id: string, data: Partial<HomePageSectionInput>) =>
    request<{ data: HomePageSection }>(`/homepage/${id}`, { 
      method: 'PUT', 
      body: JSON.stringify(data) 
    }),
  
  createHomePageSection: (data: HomePageSectionInput) =>
    request<{ data: HomePageSection }>('/homepage', { 
      method: 'POST', 
      body: JSON.stringify(data) 
    }),
  
  deleteHomePageSection: (id: string) =>
    request<{ success: boolean; message: string }>(`/homepage/${id}`, { 
      method: 'DELETE' 
    }),
  
  reorderHomePageSections: (orderedIds: string[]) =>
    request<{ success: boolean }>('/homepage/reorder', { 
      method: 'PUT', 
      body: JSON.stringify({ orderedIds }) 
    }),

  // Styles
  getStyles: () => 
    request<{ data: SiteStyle }>('/styles'),
  
  updateStyles: (data: Partial<SiteStyle>) =>
    request<{ data: SiteStyle }>('/styles', { 
      method: 'PUT', 
      body: JSON.stringify(data) 
    }),

  // Navigation
  getNavigation: () => 
    request<{ data: NavItem[] }>('/navigation'),
  
  updateNavigation: (items: NavItem[]) =>
    request<{ data: NavItem[] }>('/navigation', { 
      method: 'PUT', 
      body: JSON.stringify({ items }) 
    }),

  // Settings
  getSettings: () => 
    request<{ data: SiteSettings }>('/settings'),
  
  updateSettings: (data: Partial<SiteSettings>) =>
    request<{ data: SiteSettings }>('/settings', { 
      method: 'PUT', 
      body: JSON.stringify(data) 
    }),

  // Media
  getMedia: () => 
    request<{ data: MediaItem[] }>('/media'),
  
  getMediaById: (id: string) =>
    request<{ data: MediaItem }>(`/media/${id}`),
  
  uploadMedia: (file: File, altText?: string) => {
    const formData = new FormData();
    formData.append('file', file);
    if (altText) formData.append('alt_text', altText);
    
    const token = localStorage.getItem('cms_auth_token');
    return fetch(`${API_BASE}/media/upload`, {
      method: 'POST',
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: formData,
    }).then(res => {
      if (!res.ok) throw new Error('Upload failed');
      return res.json();
    });
  },
  
  uploadMediaBase64: (data: string, filename: string, mimeType: string, altText?: string) =>
    request<{ data: MediaItem }>('/media/upload', {
      method: 'POST',
      body: JSON.stringify({
        data,
        filename,
        mime_type: mimeType,
        alt_text: altText,
      }),
    }),
  
  updateMedia: (id: string, data: { alt_text?: string }) =>
    request<{ data: MediaItem }>(`/media/${id}`, { 
      method: 'PUT', 
      body: JSON.stringify(data) 
    }),
  
  deleteMedia: (id: string) =>
    request<{ success: boolean; message: string }>(`/media/${id}`, { 
      method: 'DELETE' 
    }),

  // Redirects
  getRedirects: () => 
    request<{ data: Redirect[] }>('/redirects'),
  
  createRedirect: (data: { from_path: string; to_path: string; type?: number; active?: boolean }) =>
    request<{ data: Redirect }>('/redirects', { 
      method: 'POST', 
      body: JSON.stringify(data) 
    }),
  
  updateRedirect: (id: string, data: Partial<{ from_path: string; to_path: string; type: number; active: boolean }>) =>
    request<{ data: Redirect }>(`/redirects/${id}`, { 
      method: 'PUT', 
      body: JSON.stringify(data) 
    }),
  
  deleteRedirect: (id: string) =>
    request<{ success: boolean; message: string }>(`/redirects/${id}`, { 
      method: 'DELETE' 
    }),

  // Auth
  login: (email: string, password: string) =>
    request<AuthResponse>('/auth', {
      method: 'POST',
      body: JSON.stringify({ action: 'login', email, password }),
    }),
  
  verifyToken: (token: string) =>
    request<VerifyResponse>('/auth', {
      method: 'POST',
      body: JSON.stringify({ action: 'verify', token }),
    }),

  // Seed
  seed: () =>
    request<{ success: boolean; message: string }>('/seed', {
      method: 'POST',
    }),
};
