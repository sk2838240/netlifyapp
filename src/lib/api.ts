const API_BASE = '/api';

async function request<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const token = localStorage.getItem('cms_auth_token');
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(options?.headers as Record<string, string> || {}),
  };

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Request failed' }));
    throw new Error(error.message || `HTTP ${response.status}`);
  }

  return response.json();
}

export const api = {
  // Content
  getContent: (type?: string) =>
    request<{ data: any[] }>(`/content${type ? `?type=${type}` : ''}`),
  getContentBySlug: (slug: string) =>
    request<{ data: any }>(`/content/${slug}`),
  createContent: (data: any) =>
    request<{ data: any }>('/content', { method: 'POST', body: JSON.stringify(data) }),
  updateContent: (id: string, data: any) =>
    request<{ data: any }>(`/content/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteContent: (id: string) =>
    request<{ success: boolean }>(`/content/${id}`, { method: 'DELETE' }),

  // Categories
  getCategories: () => request<{ data: any[] }>('/categories'),
  createCategory: (data: any) =>
    request<{ data: any }>('/categories', { method: 'POST', body: JSON.stringify(data) }),
  updateCategory: (id: string, data: any) =>
    request<{ data: any }>(`/categories/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteCategory: (id: string) =>
    request<{ success: boolean }>(`/categories/${id}`, { method: 'DELETE' }),

  // Tags
  getTags: () => request<{ data: any[] }>('/tags'),
  createTag: (data: any) =>
    request<{ data: any }>('/tags', { method: 'POST', body: JSON.stringify(data) }),
  updateTag: (id: string, data: any) =>
    request<{ data: any }>(`/tags/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteTag: (id: string) =>
    request<{ success: boolean }>(`/tags/${id}`, { method: 'DELETE' }),

  // FAQs
  getFAQs: (pageId?: string) =>
    request<{ data: any[] }>(`/faqs${pageId ? `?page_id=${pageId}` : ''}`),
  createFAQ: (data: any) =>
    request<{ data: any }>('/faqs', { method: 'POST', body: JSON.stringify(data) }),
  updateFAQ: (id: string, data: any) =>
    request<{ data: any }>(`/faqs/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteFAQ: (id: string) =>
    request<{ success: boolean }>(`/faqs/${id}`, { method: 'DELETE' }),

  // Homepage
  getHomePageSections: () => request<{ data: any[] }>('/homepage'),
  updateHomePageSection: (id: string, data: any) =>
    request<{ data: any }>(`/homepage/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  createHomePageSection: (data: any) =>
    request<{ data: any }>('/homepage', { method: 'POST', body: JSON.stringify(data) }),
  deleteHomePageSection: (id: string) =>
    request<{ success: boolean }>(`/homepage/${id}`, { method: 'DELETE' }),
  reorderHomePageSections: (orderedIds: string[]) =>
    request<{ success: boolean }>('/homepage/reorder', { method: 'PUT', body: JSON.stringify({ orderedIds }) }),

  // Styles
  getStyles: () => request<{ data: any }>('/styles'),
  updateStyles: (data: any) =>
    request<{ data: any }>('/styles', { method: 'PUT', body: JSON.stringify(data) }),

  // Navigation
  getNavigation: () => request<{ data: any[] }>('/navigation'),
  updateNavigation: (items: any[]) =>
    request<{ data: any[] }>('/navigation', { method: 'PUT', body: JSON.stringify({ items }) }),

  // Settings
  getSettings: () => request<{ data: any }>('/settings'),
  updateSettings: (data: any) =>
    request<{ data: any }>('/settings', { method: 'PUT', body: JSON.stringify(data) }),

  // Auth
  login: (email: string, password: string) =>
    request<{ token: string; user: any }>('/auth', {
      method: 'POST',
      body: JSON.stringify({ action: 'login', email, password }),
    }),
  verifyToken: (token: string) =>
    request<{ valid: boolean; user: any }>('/auth', {
      method: 'POST',
      body: JSON.stringify({ action: 'verify', token }),
    }),
};
