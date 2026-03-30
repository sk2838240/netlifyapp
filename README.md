# Netlify CMS - Professional Content Management System

A full-featured, WordPress-like CMS that runs entirely on Netlify for free. Built with React, TypeScript, and modern web technologies.

## ✨ Features

### Content Management
- **Pages, Blog Posts, Press Releases** - Full CRUD with rich text editor
- **SEO Tools** - Meta title, description, keywords, OG tags, JSON-LD schema
- **Categories & Tags** - Full taxonomy management
- **FAQ Management** - Create, edit, and display FAQs on any page
- **Homepage Editor** - Section-based editing with drag-and-drop ordering
- **Media Library** - Upload, organize, and manage images/videos/PDFs
- **Content Scheduling** - Schedule posts for future publication
- **URL Redirects** - Manage 301/302 redirects

### Design & Customization
- **Style Customizer** - Live preview for colors, fonts, sizes
- **Navigation Editor** - Customize header menu links
- **Site Settings** - Logo, favicon, social links, analytics, custom CSS/HTML
- **Responsive Design** - Mobile-first, works on all devices

### Technical
- **100% Free** - Uses Netlify Identity + Netlify Blobs (free tier)
- **Fast Performance** - Serverless architecture, CDN-delivered
- **SEO Optimized** - Automatic sitemap generation, meta tags
- **Secure** - JWT authentication, input validation, CORS protection
- **Multi-tenant Ready** - Deploy for different clients

## 🚀 Quick Start

### Prerequisites
- Node.js 20+
- Netlify CLI (`npm install -g netlify-cli`)

### Local Development

```bash
# Clone the repository
git clone https://github.com/YOUR_USERNAME/YOUR_REPO.git
cd YOUR_REPO

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Edit .env with your credentials

# Start development server
npm run dev
```

### Access the Application

- **Public Site**: http://localhost:5173
- **Admin Panel**: http://localhost:5173/admin
- **API Endpoints**: http://localhost:8888/api

### Default Login

- **Email**: admin@cms.local
- **Password**: admin123

**⚠️ Change these credentials before deploying to production!**

## 📚 Documentation

For complete setup, deployment, and configuration instructions, see **[SETUP.md](SETUP.md)**.

### Quick Links

- [Local Development](SETUP.md#local-development)
- [Environment Variables](SETUP.md#environment-variables)
- [Deploy to Netlify](SETUP.md#deploy-to-netlify)
- [Post-Deployment Setup](SETUP.md#post-deployment-setup)
- [Custom Domain Setup](SETUP.md#custom-domain-setup)
- [Security Best Practices](SETUP.md#security-best-practices)
- [Troubleshooting](SETUP.md#troubleshooting)
- [API Documentation](SETUP.md#api-documentation)

## 🏗️ Architecture

### Technology Stack

- **Frontend**: React 18, TypeScript, Vite, Tailwind CSS 4
- **Backend**: Netlify Functions (serverless)
- **Storage**: Netlify Blobs (key-value store)
- **Auth**: JWT-based authentication
- **Routing**: React Router DOM v6
- **Animations**: Framer Motion
- **Icons**: Lucide React

### Project Structure

```
├── netlify.toml              # Netlify configuration
├── package.json              # Dependencies and scripts
├── vite.config.ts            # Vite configuration
├── tsconfig.json             # TypeScript configuration
├── SETUP.md                  # Complete setup guide
├── netlify/
│   └── functions/            # Serverless API endpoints
│       ├── auth.ts           # Authentication
│       ├── content.ts        # Blog/press content CRUD
│       ├── categories.ts     # Category management
│       ├── tags.ts           # Tag management
│       ├── faqs.ts           # FAQ management
│       ├── homepage.ts       # Homepage content
│       ├── media.ts          # Media library
│       ├── media-file.ts     # Media file serving
│       ├── navigation.ts     # Navigation menus
│       ├── settings.ts       # Site settings
│       ├── styles.ts         # Style customization
│       ├── redirects.ts      # URL redirects
│       ├── schedule.ts       # Content scheduling
│       ├── sitemap.ts        # Sitemap generation
│       └── optimize.ts       # Image optimization
├── src/
│   ├── App.tsx               # Main app component
│   ├── main.tsx              # Entry point
│   ├── index.css             # Global styles
│   ├── components/
│   │   ├── admin/            # Admin components
│   │   ├── site/             # Public site components
│   │   └── ui/               # Reusable UI components
│   ├── context/
│   │   ├── AuthContext.tsx    # Authentication context
│   │   └── ToastContext.tsx   # Toast notifications
│   ├── hooks/
│   │   ├── useApi.ts         # API hooks
│   │   └── useSiteStyles.ts  # Styles hook
│   ├── lib/
│   │   ├── api.ts            # API client
│   │   └── styles.ts         # Style utilities
│   ├── pages/
│   │   ├── HomePage.tsx      # Public homepage
│   │   ├── BlogListPage.tsx  # Blog listing
│   │   ├── BlogDetailPage.tsx # Blog detail
│   │   ├── PressListPage.tsx # Press listing
│   │   ├── PressDetailPage.tsx # Press detail
│   │   ├── StaticPage.tsx    # Static pages
│   │   ├── NotFoundPage.tsx  # 404 page
│   │   └── admin/            # Admin pages
│   └── types/
│       └── index.ts          # TypeScript types
└── public/
    └── favicon.svg           # Favicon
```

## 🔒 Security

This project includes several security improvements:

- **JWT Authentication** - Properly signed tokens with expiration
- **Password Hashing** - bcryptjs for secure password storage
- **Input Validation** - Zod schemas for all API endpoints
- **CORS Protection** - Configurable allowed origins
- **Environment Variables** - Sensitive data stored securely

See [Security Best Practices](SETUP.md#security-best-practices) for details.

## 🎨 Admin Panel

The admin panel features a modern, professional design:

- **Responsive Sidebar** - Collapsible navigation with smooth animations
- **Dark Theme Login** - Beautiful gradient background with glassmorphism
- **Breadcrumb Navigation** - Easy navigation between pages
- **Loading States** - Smooth loading indicators
- **Error Boundaries** - Graceful error handling
- **Toast Notifications** - User-friendly feedback

## 📡 API

All API endpoints are documented in [SETUP.md](SETUP.md#api-documentation).

### Quick API Reference

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/auth` | POST | Login/verify token |
| `/api/content` | GET/POST | List/create content |
| `/api/content/:id` | PUT/DELETE | Update/delete content |
| `/api/categories` | GET/POST | List/create categories |
| `/api/tags` | GET/POST | List/create tags |
| `/api/faqs` | GET/POST | List/create FAQs |
| `/api/homepage` | GET/PUT | Manage homepage sections |
| `/api/media` | GET/POST | List/upload media |
| `/api/navigation` | GET/PUT | Manage navigation |
| `/api/settings` | GET/PUT | Manage site settings |
| `/api/styles` | GET/PUT | Manage site styles |
| `/api/redirects` | GET/POST | Manage redirects |
| `/api/sitemap` | GET | Get sitemap XML |

## 🐛 Troubleshooting

Having issues? Check the [Troubleshooting Guide](SETUP.md#troubleshooting).

### Common Issues

- **Build fails** - Check Node.js version and dependencies
- **Functions not working** - Verify environment variables
- **Site shows 404** - Check redirect rules in netlify.toml
- **Admin login fails** - Verify credentials and JWT secret

## 📄 License

MIT License - feel free to use this project for personal or commercial purposes.

## 🙏 Credits

Built with:
- [React](https://react.dev/)
- [TypeScript](https://www.typescriptlang.org/)
- [Vite](https://vitejs.dev/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Netlify](https://www.netlify.com/)
- [Framer Motion](https://www.framer.com/motion/)
- [Lucide Icons](https://lucide.dev/)

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📞 Support

For questions or issues, please open an issue on GitHub or check the [SETUP.md](SETUP.md) documentation.
