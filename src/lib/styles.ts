import { SiteStyle } from '../types';

export const defaultStyles: SiteStyle = {
  primary_color: '#2563eb',
  secondary_color: '#7c3aed',
  accent_color: '#f59e0b',
  background_color: '#ffffff',
  text_color: '#1f2937',
  heading_font: 'Inter',
  body_font: 'Roboto',
  heading_size_h1: '3rem',
  heading_size_h2: '2.25rem',
  heading_size_h3: '1.5rem',
  paragraph_size: '1rem',
  paragraph_line_height: '1.75',
  faq_heading_size: '1.125rem',
  faq_content_size: '0.95rem',
  link_color: '#2563eb',
  link_hover_color: '#1d4ed8',
  button_color: '#2563eb',
  button_text_color: '#ffffff',
  border_radius: '0.5rem',
  card_shadow: '0 1px 3px rgba(0,0,0,0.1)',
  header_background: '#ffffff',
  header_text_color: '#1f2937',
  footer_background: '#f9fafb',
  footer_text_color: '#6b7280',
};

export function generateCSSVariables(styles: SiteStyle): string {
  return `
    :root {
      --primary-color: ${styles.primary_color};
      --secondary-color: ${styles.secondary_color};
      --accent-color: ${styles.accent_color};
      --bg-color: ${styles.background_color};
      --text-color: ${styles.text_color};
      --heading-font: '${styles.heading_font}', sans-serif;
      --body-font: '${styles.body_font}', sans-serif;
      --h1-size: ${styles.heading_size_h1};
      --h2-size: ${styles.heading_size_h2};
      --h3-size: ${styles.heading_size_h3};
      --paragraph-size: ${styles.paragraph_size};
      --paragraph-line-height: ${styles.paragraph_line_height};
      --faq-heading-size: ${styles.faq_heading_size};
      --faq-content-size: ${styles.faq_content_size};
      --link-color: ${styles.link_color};
      --link-hover-color: ${styles.link_hover_color};
      --button-color: ${styles.button_color};
      --button-text-color: ${styles.button_text_color};
      --border-radius: ${styles.border_radius};
      --card-shadow: ${styles.card_shadow};
      --header-bg: ${styles.header_background};
      --header-text: ${styles.header_text_color};
      --footer-bg: ${styles.footer_background};
      --footer-text: ${styles.footer_text_color};
    }
  `;
}
