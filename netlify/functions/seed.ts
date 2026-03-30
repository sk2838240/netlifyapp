import type { Context } from '@netlify/functions';
import { getStore } from '@netlify/blobs';

const store = getStore('cms-data');

function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).substring(2, 9);
}

function generateSlug(title: string): string {
  return title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

async function getData(key: string): Promise<any[]> {
  const data = await store.get(key, { type: 'json' });
  return data || [];
}

async function setData(key: string, data: any[]) {
  await store.set(key, JSON.stringify(data));
}

export default async (req: Request, context: Context) => {
  const headers = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  };

  if (req.method === 'OPTIONS') return new Response(null, { status: 204, headers });

  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ message: 'Use POST to seed demo data' }), { status: 405, headers });
  }

  try {
    const now = new Date().toISOString();
    const yesterday = new Date(Date.now() - 86400000).toISOString();
    const lastWeek = new Date(Date.now() - 7 * 86400000).toISOString();

    // Categories
    const categories = [
      { id: generateId(), name: 'Technology', slug: 'technology', description: 'Tech news and tutorials', created_at: now },
      { id: generateId(), name: 'Design', slug: 'design', description: 'UI/UX and graphic design', created_at: now },
      { id: generateId(), name: 'Business', slug: 'business', description: 'Business strategy and growth', created_at: now },
      { id: generateId(), name: 'Marketing', slug: 'marketing', description: 'Digital marketing tips', created_at: now },
    ];
    await setData('categories', categories);

    // Tags
    const tags = [
      { id: generateId(), name: 'React', slug: 'react', created_at: now },
      { id: generateId(), name: 'TypeScript', slug: 'typescript', created_at: now },
      { id: generateId(), name: 'Tailwind CSS', slug: 'tailwind-css', created_at: now },
      { id: generateId(), name: 'Netlify', slug: 'netlify', created_at: now },
      { id: generateId(), name: 'Performance', slug: 'performance', created_at: now },
      { id: generateId(), name: 'SEO', slug: 'seo', created_at: now },
      { id: generateId(), name: 'Accessibility', slug: 'accessibility', created_at: now },
      { id: generateId(), name: 'Serverless', slug: 'serverless', created_at: now },
    ];
    await setData('tags', tags);

    // Blog posts
    const blogPosts = [
      {
        id: generateId(), type: 'blog', title: 'Getting Started with Modern Web Development',
        slug: 'getting-started-modern-web-dev',
        image: 'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=800&h=400&fit=crop',
        body: '<h2>The Modern Web Stack</h2><p>Modern web development has evolved significantly. With tools like React, TypeScript, and serverless platforms, building fast and scalable applications has never been easier.</p><h3>Key Technologies</h3><ul><li><strong>React 18</strong> - For building dynamic user interfaces</li><li><strong>TypeScript</strong> - For type-safe code</li><li><strong>Tailwind CSS</strong> - For rapid UI development</li><li><strong>Netlify</strong> - For seamless deployment</li></ul><p>By combining these technologies, you can create production-ready applications in record time. The key is to start small and iterate quickly.</p><blockquote>Good code is its own best documentation. - Steve McConnell</blockquote><p>Focus on writing clean, maintainable code that others can understand and build upon.</p>',
        excerpt: 'Learn how to set up a modern web development environment with React, TypeScript, and Tailwind CSS for building production-ready applications.',
        metadata: { description: 'A comprehensive guide to modern web development', keywords: ['react', 'typescript', 'web-dev'], seo: { meta_title: 'Getting Started with Modern Web Development', meta_description: 'Learn the fundamentals of modern web development with React, TypeScript, and Tailwind CSS.', h1: 'Getting Started with Modern Web Development' } },
        categories: ['Technology'], tags: ['React', 'TypeScript', 'Tailwind CSS'], status: 'published', author: 'Admin', featured: true,
        created_at: lastWeek, updated_at: yesterday,
      },
      {
        id: generateId(), type: 'blog', title: 'Building Serverless APIs with Netlify Functions',
        slug: 'building-serverless-apis-netlify',
        image: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=800&h=400&fit=crop',
        body: '<h2>Why Serverless?</h2><p>Serverless architecture allows you to build and run applications without managing infrastructure. Netlify Functions makes this incredibly simple.</p><h3>Benefits</h3><ul><li>Zero server management</li><li>Automatic scaling</li><li>Pay only for what you use</li><li>Built-in CI/CD</li></ul><p>With Netlify Functions, you can create API endpoints that scale automatically and integrate seamlessly with your frontend.</p><p>The development experience is smooth - write your functions in TypeScript, test locally with the Netlify CLI, and deploy with a simple git push.</p>',
        excerpt: 'Discover how to build scalable APIs using Netlify Functions with TypeScript, including authentication and database integration.',
        metadata: { description: 'A deep dive into serverless APIs', keywords: ['serverless', 'api', 'netlify'], seo: { meta_title: 'Building Serverless APIs with Netlify Functions', meta_description: 'Learn to build scalable serverless APIs using Netlify Functions.', h1: 'Building Serverless APIs' } },
        categories: ['Technology'], tags: ['Netlify', 'Serverless', 'TypeScript'], status: 'published', author: 'Admin', featured: false,
        created_at: yesterday, updated_at: now,
      },
      {
        id: generateId(), type: 'blog', title: '10 Tips for Better SEO in 2025',
        slug: '10-tips-better-seo-2025',
        image: 'https://images.unsplash.com/photo-1432888498266-38ffec3eaf0a?w=800&h=400&fit=crop',
        body: '<h2>SEO Best Practices</h2><p>Search Engine Optimization continues to evolve. Here are the top strategies for improving your search rankings in 2025.</p><ol><li><strong>Core Web Vitals</strong> - Optimize for LCP, FID, and CLS</li><li><strong>Mobile-First</strong> - Design for mobile before desktop</li><li><strong>Quality Content</strong> - Create valuable, original content</li><li><strong>Structured Data</strong> - Use schema markup</li><li><strong>Internal Linking</strong> - Build a strong link architecture</li></ol><p>Focus on providing genuine value to your users. Search engines reward content that truly helps people solve their problems.</p>',
        excerpt: 'Improve your search rankings with these proven SEO strategies for 2025.',
        metadata: { description: 'SEO tips for better rankings', keywords: ['seo', 'marketing'], seo: { meta_title: '10 Tips for Better SEO in 2025', meta_description: 'Boost your search rankings with these 10 proven SEO strategies.', h1: '10 Tips for Better SEO' } },
        categories: ['Marketing'], tags: ['SEO'], status: 'published', author: 'Admin', featured: false,
        created_at: now, updated_at: now,
      },
    ];
    await setData('content', blogPosts);

    // Homepage sections
    const homepageSections = [
      {
        id: generateId(), type: 'hero', title: 'Build Beautiful Websites Faster',
        subtitle: 'Welcome to Our Platform',
        content: '<p>A modern content management system with blazing-fast performance, intuitive editing tools, and beautiful design out of the box.</p>',
        button_text: 'Get Started', button_url: '/blog', button_color: '#2563eb',
        background_color: 'linear-gradient(135deg, #eff6ff 0%, #ffffff 50%, #f5f3ff 100%)',
        text_color: '#1f2937', order: 0, visible: true,
      },
      {
        id: generateId(), type: 'features', title: 'Everything You Need', subtitle: 'Features',
        content: '<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:1.5rem;"><div><h3>Fast Performance</h3><p>Optimized for speed with serverless architecture.</p></div><div><h3>Easy Editing</h3><p>Intuitive content editor with live preview.</p></div><div><h3>SEO Ready</h3><p>Built-in SEO tools and sitemap generation.</p></div></div>',
        background_color: '#f9fafb', text_color: '#1f2937', order: 1, visible: true,
      },
      {
        id: generateId(), type: 'cta', title: 'Ready to Launch Your Site?', subtitle: 'Get Started Today',
        content: '<p>Join thousands of creators and teams using our platform to build amazing websites.</p>',
        button_text: 'Start Building', button_url: '/admin', button_color: '#7c3aed',
        background_color: '#1f2937', text_color: '#ffffff', order: 2, visible: true,
      },
    ];
    await setData('homepage_sections', homepageSections);

    // FAQs
    const faqs = [
      { id: generateId(), question: 'What is this CMS platform?', answer: 'This is a modern content management system built with React, TypeScript, and Netlify. It provides a fast, secure, and easy-to-use interface for managing website content including pages, blog posts, and press releases.', category: 'General', order: 0, created_at: now },
      { id: generateId(), question: 'How do I add new content?', answer: 'Navigate to the admin dashboard and click "New Content". You can create pages, blog posts, or press releases with a rich text editor, set categories and tags, add featured images, and configure SEO settings.', category: 'General', order: 1, created_at: now },
      { id: generateId(), question: 'Can I customize the design?', answer: 'Yes! Go to the Styles section in the admin panel to customize colors, fonts, sizes, and more. Changes are applied in real-time so you can see exactly how your site will look.', category: 'Design', order: 2, created_at: now },
      { id: generateId(), question: 'Is this platform free?', answer: 'The platform runs on Netlify\'s free tier which includes hosting, serverless functions, and blob storage. You can run a full-featured CMS at no cost for personal projects and small sites.', category: 'Pricing', order: 3, created_at: now },
      { id: generateId(), question: 'How do I deploy updates?', answer: 'Simply push your code changes to GitHub. Netlify automatically detects the changes and rebuilds your site. Deployments typically complete in under 2 minutes.', category: 'Technical', order: 4, created_at: now },
    ];
    await setData('faqs', faqs);

    // Navigation
    const navItems = [
      { id: generateId(), label: 'Home', url: '/', order: 0, target: '_self' },
      { id: generateId(), label: 'Blog', url: '/blog', order: 1, target: '_self' },
      { id: generateId(), label: 'Press', url: '/press', order: 2, target: '_self' },
      { id: generateId(), label: 'About', url: '/page/about', order: 3, target: '_self' },
    ];
    await setData('navigation', navItems);

    // Settings
    const settings = {
      site_name: 'Acme CMS',
      site_tagline: 'Modern Content Management',
      logo_url: '',
      favicon_url: '',
      footer_text: `© ${new Date().getFullYear()} Acme CMS. All Rights Reserved.`,
      social_links: {
        twitter: 'https://twitter.com',
        github: 'https://github.com',
        linkedin: 'https://linkedin.com',
      },
      analytics_id: '',
      custom_css: '',
      custom_head: '',
      custom_footer: '',
    };
    await setData('settings', settings);

    // Site styles
    const styles = {
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
      paragraph_size: '1.0625rem',
      paragraph_line_height: '1.8',
      faq_heading_size: '1.0625rem',
      faq_content_size: '0.9375rem',
      link_color: '#2563eb',
      link_hover_color: '#1d4ed8',
      button_color: '#2563eb',
      button_text_color: '#ffffff',
      border_radius: '0.75rem',
      card_shadow: '0 4px 6px -1px rgba(0,0,0,0.07)',
      header_background: 'rgba(255,255,255,0.95)',
      header_text_color: '#1f2937',
      footer_background: '#1f2937',
      footer_text_color: '#d1d5db',
    };
    await setData('styles', styles);

    return new Response(JSON.stringify({
      success: true,
      message: 'Demo data seeded successfully!',
      data: {
        categories: categories.length,
        tags: tags.length,
        blogPosts: blogPosts.length,
        homepageSections: homepageSections.length,
        faqs: faqs.length,
        navItems: navItems.length,
      }
    }), { status: 200, headers });

  } catch (e: any) {
    return new Response(JSON.stringify({ message: e.message }), { status: 500, headers });
  }
};
