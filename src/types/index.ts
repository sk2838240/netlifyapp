export type ContentType = 'blog' | 'press' | 'page';
export type ContentStatus = 'draft' | 'published' | 'scheduled';

export interface SEOData {
  meta_title?: string;
  meta_description?: string;
  meta_keywords?: string[];
  og_title?: string;
  og_description?: string;
  og_image?: string;
  canonical_url?: string;
  robots?: string;
  schema?: string;
  h1?: string;
}

export interface ContentMetadata {
  description?: string;
  keywords?: string[];
  external_url?: string;
  seo?: SEOData;
  [key: string]: unknown;
}

export interface Content {
  id: string;
  type: ContentType;
  title: string;
  slug: string;
  image: string | null;
  body: string;
  excerpt?: string;
  metadata: ContentMetadata;
  categories: string[];
  tags: string[];
  status: ContentStatus;
  author?: string;
  featured?: boolean;
  scheduled_at?: string | null;
  created_at: string;
  updated_at: string;
}

export interface ContentInput {
  type: ContentType;
  title: string;
  slug: string;
  image?: string | null;
  body: string;
  excerpt?: string;
  metadata?: ContentMetadata;
  categories?: string[];
  tags?: string[];
  status?: ContentStatus;
  author?: string;
  featured?: boolean;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  parent_id?: string;
  created_at: string;
}

export interface Tag {
  id: string;
  name: string;
  slug: string;
  created_at: string;
}

export interface FAQ {
  id: string;
  question: string;
  answer: string;
  category?: string;
  order: number;
  page_id?: string;
  created_at: string;
}

export interface FAQInput {
  question: string;
  answer: string;
  category?: string;
  order?: number;
  page_id?: string;
}

export interface HomePageSection {
  id: string;
  type: 'hero' | 'about' | 'features' | 'testimonials' | 'cta' | 'faq' | 'custom';
  title: string;
  subtitle?: string;
  content: string;
  image?: string;
  background_color?: string;
  text_color?: string;
  button_text?: string;
  button_url?: string;
  button_color?: string;
  order: number;
  visible: boolean;
  settings?: Record<string, unknown>;
}

export interface HomePageSectionInput {
  type: 'hero' | 'about' | 'features' | 'testimonials' | 'cta' | 'faq' | 'custom';
  title: string;
  subtitle?: string;
  content: string;
  image?: string;
  background_color?: string;
  text_color?: string;
  button_text?: string;
  button_url?: string;
  button_color?: string;
  order?: number;
  visible?: boolean;
  settings?: Record<string, unknown>;
}

export interface SiteStyle {
  primary_color: string;
  secondary_color: string;
  accent_color: string;
  background_color: string;
  text_color: string;
  heading_font: string;
  body_font: string;
  heading_size_h1: string;
  heading_size_h2: string;
  heading_size_h3: string;
  paragraph_size: string;
  paragraph_line_height: string;
  faq_heading_size: string;
  faq_content_size: string;
  link_color: string;
  link_hover_color: string;
  button_color: string;
  button_text_color: string;
  border_radius: string;
  card_shadow: string;
  header_background: string;
  header_text_color: string;
  footer_background: string;
  footer_text_color: string;
}

export interface NavItem {
  id: string;
  label: string;
  url: string;
  order: number;
  parent_id?: string;
  target?: '_self' | '_blank';
  children?: NavItem[];
}

export interface SiteSettings {
  site_name: string;
  site_tagline: string;
  logo_url: string;
  favicon_url: string;
  footer_text: string;
  social_links: {
    facebook?: string;
    twitter?: string;
    instagram?: string;
    linkedin?: string;
    youtube?: string;
    github?: string;
  };
  analytics_id?: string;
  custom_css?: string;
  custom_head?: string;
  custom_footer?: string;
}

export interface MediaItem {
  id: string;
  filename: string;
  original_name?: string;
  url: string;
  alt_text?: string;
  mime_type: string;
  size: number;
  created_at: string;
}

export interface Redirect {
  id: string;
  from_path: string;
  to_path: string;
  type: number;
  active: boolean;
  hits: number;
  created_at: string;
}

// Pagination types
export interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: PaginationInfo;
}

// API Response types
export interface ApiResponse<T> {
  data: T;
  message?: string;
}

export interface ApiError {
  message: string;
  errors?: Array<{
    code: string;
    message: string;
    path: string[];
  }>;
}

// User types
export interface User {
  id: string;
  email: string;
  name: string;
  role: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface VerifyResponse {
  valid: boolean;
  user?: User;
  message?: string;
}
