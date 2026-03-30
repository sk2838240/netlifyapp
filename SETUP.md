# Netlify CMS - Complete Setup & Deployment Guide

A professional, WordPress-like content management system built entirely on Netlify's free tier.

## 📋 Table of Contents

- [Features](#features)
- [Prerequisites](#prerequisites)
- [Local Development](#local-development)
- [Environment Variables](#environment-variables)
- [Deploy to Netlify](#deploy-to-netlify)
- [Post-Deployment Setup](#post-deployment-setup)
- [Custom Domain Setup](#custom-domain-setup)
- [Security Best Practices](#security-best-practices)
- [Troubleshooting](#troubleshooting)
- [Architecture](#architecture)
- [API Documentation](#api-documentation)

---

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

---

## 📦 Prerequisites

- **Node.js 20+** - [Download](https://nodejs.org/)
- **Git** - [Download](https://git-scm.com/)
- **Netlify Account** - [Sign up free](https://app.netlify.com)
- **Netlify CLI** (optional, for local development):
  ```bash
  npm install -g netlify-cli
  ```

---

## 🚀 Local Development

### 1. Clone the Repository

```bash
git clone https://github.com/YOUR_USERNAME/YOUR_REPO.git
cd YOUR_REPO
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Set Up Environment Variables

Create a `.env` file in the root directory:

```env
# Admin Credentials (CHANGE THESE!)
ADMIN_EMAIL=admin@yourdomain.com
ADMIN_PASSWORD=your-secure-password-here

# JWT Secret (generate a random string)
JWT_SECRET=your-super-secret-jwt-key-min-32-chars

# Allowed Origins (for CORS)
ALLOWED_ORIGIN=http://localhost:8888

# Optional: External Services
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
```

**Generate a secure JWT secret:**
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### 4. Start Development Server

```bash
# Start both frontend and functions
npm run dev

# Or start them separately
npm run dev          # Frontend only (port 5173)
npm run dev:functions  # Functions only (port 8888)
```

### 5. Access the Application

- **Public Site**: http://localhost:5173
- **Admin Panel**: http://localhost:5173/admin
- **API Endpoints**: http://localhost:8888/api

### 6. Seed Demo Data (Optional)

```bash
curl -X POST http://localhost:8888/api/seed
```

This creates sample categories, tags, blog posts, homepage sections, FAQs, and navigation.

---

## 🔐 Environment Variables

### Required Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `ADMIN_EMAIL` | Admin login email | `admin@yourdomain.com` |
| `ADMIN_PASSWORD` | Admin login password | `SecurePass123!` |
| `JWT_SECRET` | Secret for JWT signing (min 32 chars) | `a1b2c3d4e5f6...` |
| `ALLOWED_ORIGIN` | Allowed CORS origin | `https://your-site.netlify.app` |

### Optional Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `CLOUDINARY_CLOUD_NAME` | Cloudinary cloud name | - |
| `CLOUDINARY_API_KEY` | Cloudinary API key | - |
| `CLOUDINARY_API_SECRET` | Cloudinary API secret | - |

### Setting Variables in Netlify

1. Go to **Site settings** → **Build & deploy** → **Environment**
2. Click **Edit variables**
3. Add each variable with its value
4. Click **Save**
5. Redeploy your site

**⚠️ IMPORTANT**: Never commit `.env` file to Git! It's already in `.gitignore`.

---

## 🌐 Deploy to Netlify

### Option 1: Deploy with Netlify CLI (Recommended)

```bash
# Login to Netlify
netlify login

# Initialize new site
netlify init

# Follow the prompts:
# - Create & configure a new site
# - Team: Select your team
# - Site name: Enter a unique name (or leave blank for random)
# - Build command: npm install && npm run build
# - Publish directory: dist

# Set environment variables
netlify env:set ADMIN_EMAIL "admin@yourdomain.com"
netlify env:set ADMIN_PASSWORD "your-secure-password"
netlify env:set JWT_SECRET "your-jwt-secret"
netlify env:set ALLOWED_ORIGIN "https://your-site.netlify.app"

# Deploy
netlify deploy --prod
```

### Option 2: Deploy via Netlify Dashboard

1. **Push to GitHub**:
   ```bash
   git add .
   git commit -m "Initial commit"
   git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git
   git push -u origin main
   ```

2. **Import to Netlify**:
   - Go to [app.netlify.com](https://app.netlify.com)
   - Click **"Add new site"** → **"Import an existing project"**
   - Click **"Deploy with GitHub"**
   - Authorize Netlify to access your GitHub
   - Select your repository

3. **Configure Build Settings**:
   - Netlify will auto-detect `netlify.toml`
   - Verify these settings:
     - **Build command**: `npm install && npm run build`
     - **Publish directory**: `dist`
     - **Functions directory**: `netlify/functions`

4. **Set Environment Variables**:
   - Go to **Site settings** → **Build & deploy** → **Environment**
   - Add all required variables (see table above)

5. **Deploy**:
   - Click **"Deploy site"**
   - Wait 1-3 minutes for build to complete

---

## 🔧 Post-Deployment Setup

### 1. Access Your Site

- **Public site**: `https://your-site-name.netlify.app`
- **Admin panel**: `https://your-site-name.netlify.app/admin`

### 2. Login to Admin

Use the credentials you set in environment variables:
- Email: Your `ADMIN_EMAIL`
- Password: Your `ADMIN_PASSWORD`

### 3. Seed Initial Data

If you didn't seed locally, you can seed on Netlify:

```bash
curl -X POST https://your-site-name.netlify.app/api/seed
```

Or use the admin panel to create content manually.

### 4. Configure Site Settings

1. Go to **Admin** → **Settings**
2. Update:
   - Site name and tagline
   - Logo and favicon
   - Social links
   - Footer text
   - Analytics ID (Google Analytics)
   - Custom CSS/HTML

### 5. Customize Styles

1. Go to **Admin** → **Styles**
2. Customize:
   - Primary/secondary/accent colors
   - Heading and body fonts
   - Font sizes
   - Link colors
   - Button styles
   - Border radius
   - Shadows

### 6. Set Up Navigation

1. Go to **Admin** → **Navigation**
2. Add/modify menu items
3. Set URLs and order

### 7. Create Content

1. Go to **Admin** → **Content**
2. Click **"New Content"**
3. Choose type (Page, Blog, Press)
4. Fill in details and publish

---

## 🌍 Custom Domain Setup

### 1. Add Custom Domain in Netlify

1. Go to **Site settings** → **Domain management**
2. Click **"Add a domain alias"**
3. Enter your domain (e.g., `www.yourdomain.com`)
4. Click **"Verify"**

### 2. Update DNS Records

**For Apex Domain (yourdomain.com):**
```
Type: A
Name: @
Value: 75.2.60.5
```

**For Subdomain (www.yourdomain.com):**
```
Type: CNAME
Name: www
Value: your-site-name.netlify.app
```

### 3. Enable HTTPS

Netlify automatically provisions SSL certificates via Let's Encrypt.

1. Go to **Site settings** → **Domain management** → **HTTPS**
2. Click **"Verify DNS configuration"**
3. Wait for certificate provisioning (usually 5-10 minutes)

### 4. Update Environment Variables

Update `ALLOWED_ORIGIN` to your custom domain:
```
ALLOWED_ORIGIN=https://www.yourdomain.com
```

### 5. Force HTTPS

Add to `netlify.toml`:
```toml
[[redirects]]
  from = "http://yourdomain.com/*"
  to = "https://www.yourdomain.com/:splat"
  status = 301
  force = true
```

---

## 🔒 Security Best Practices

### 1. Change Default Credentials Immediately

**Never use the default credentials in production!**

```bash
# Generate a strong password
node -e "console.log(require('crypto').randomBytes(16).toString('hex'))"
```

### 2. Use Strong JWT Secret

```bash
# Generate a secure JWT secret
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### 3. Enable Netlify Identity (Optional)

For more robust authentication:

1. Go to **Site settings** → **Identity**
2. Click **"Enable Identity"**
3. Configure registration preferences
4. Update `auth.ts` to use Netlify Identity

### 4. Set Up Branch Deploys

1. Go to **Site settings** → **Build & deploy** → **Deploy contexts**
2. Enable **"Branch deploys"**
3. Set branch to `develop`
4. Test changes on `develop.your-site.netlify.app` before merging to `main`

### 5. Enable Deploy Notifications

1. Go to **Site settings** → **Build & deploy** → **Deploy notifications**
2. Add notifications for:
   - Deploy succeeded
   - Deploy failed
   - Form submissions

### 6. Regular Backups

Export your data regularly:

```bash
# Backup all data
curl -X GET https://your-site.netlify.app/api/content > content-backup.json
curl -X GET https://your-site.netlify.app/api/categories > categories-backup.json
curl -X GET https://your-site.netlify.app/api/tags > tags-backup.json
```

---

## 🐛 Troubleshooting

### Build Fails

**Check the deploy log:**
1. Go to **Deploys** → **[latest deploy]**
2. Look for error messages

**Common issues:**
- Missing dependencies: Run `npm install` locally
- TypeScript errors: Run `npm run build` locally
- Node version: Ensure Node.js 20+ is set in **Site settings** → **Build & deploy** → **Environment**

### Functions Not Working

**Check function logs:**
1. Go to **Functions** tab in Netlify dashboard
2. Click on a function to see logs

**Common issues:**
- Missing environment variables
- CORS errors: Check `ALLOWED_ORIGIN` setting
- Timeout: Functions have 10-second timeout on free tier

### Site Shows 404 on Refresh

The `[[redirects]]` rule in `netlify.toml` handles SPA routing. Ensure this is present:

```toml
[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

### Admin Login Not Working

1. Check browser console for API errors
2. Verify environment variables are set correctly
3. Check function logs in Netlify dashboard
4. Ensure `JWT_SECRET` is at least 32 characters

### Media Upload Fails

1. Check file size (max 100MB per file on free tier)
2. Verify file type is supported (images, videos, PDFs)
3. Check function logs for errors

### Styles Not Applying

1. Clear browser cache
2. Check if styles are saved in admin panel
3. Verify API endpoint `/api/styles` is working

---

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
├── SETUP.md                  # This file
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

### Data Flow

1. **Frontend** → API request to `/api/*`
2. **Netlify Redirect** → Routes to `/.netlify/functions/*`
3. **Function** → Processes request, reads/writes to Netlify Blobs
4. **Response** → Returns JSON to frontend
5. **Frontend** → Updates UI with data

### Authentication Flow

1. User submits login form
2. Frontend sends POST to `/api/auth` with `{ action: 'login', email, password }`
3. Function validates credentials
4. Function generates JWT token
5. Frontend stores token in `localStorage`
6. Frontend includes token in `Authorization: Bearer <token>` header
7. Functions verify token before processing requests

---

## 📡 API Documentation

### Authentication

#### POST /api/auth
Login to get JWT token.

**Request:**
```json
{
  "action": "login",
  "email": "admin@cms.local",
  "password": "admin123"
}
```

**Response:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "1",
    "email": "admin@cms.local",
    "name": "Admin",
    "role": "admin"
  }
}
```

#### POST /api/auth
Verify JWT token.

**Request:**
```json
{
  "action": "verify",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Response:**
```json
{
  "valid": true,
  "user": {
    "id": "1",
    "email": "admin@cms.local",
    "name": "Admin",
    "role": "admin"
  }
}
```

### Content

#### GET /api/content
Get all content (optional filter by type).

**Query Parameters:**
- `type` - Filter by type: `blog`, `press`, `page`

**Response:**
```json
{
  "data": [
    {
      "id": "abc123",
      "type": "blog",
      "title": "My Blog Post",
      "slug": "my-blog-post",
      "body": "<p>Content here...</p>",
      "excerpt": "Short description",
      "image": "https://...",
      "metadata": {
        "seo": {
          "meta_title": "SEO Title",
          "meta_description": "SEO description"
        }
      },
      "categories": ["Technology"],
      "tags": ["React", "TypeScript"],
      "status": "published",
      "author": "Admin",
      "featured": false,
      "created_at": "2024-01-01T00:00:00.000Z",
      "updated_at": "2024-01-01T00:00:00.000Z"
    }
  ]
}
```

#### GET /api/content/:slug
Get content by slug.

**Response:**
```json
{
  "data": {
    "id": "abc123",
    "type": "blog",
    "title": "My Blog Post",
    "slug": "my-blog-post",
    ...
  }
}
```

#### POST /api/content
Create new content (requires auth).

**Request:**
```json
{
  "type": "blog",
  "title": "New Post",
  "slug": "new-post",
  "body": "<p>Content</p>",
  "status": "draft"
}
```

#### PUT /api/content/:id
Update content (requires auth).

#### DELETE /api/content/:id
Delete content (requires auth).

### Categories

#### GET /api/categories
Get all categories.

#### POST /api/categories
Create category (requires auth).

#### PUT /api/categories/:id
Update category (requires auth).

#### DELETE /api/categories/:id
Delete category (requires auth).

### Tags

#### GET /api/tags
Get all tags.

#### POST /api/tags
Create tag (requires auth).

#### PUT /api/tags/:id
Update tag (requires auth).

#### DELETE /api/tags/:id
Delete tag (requires auth).

### FAQs

#### GET /api/faqs
Get all FAQs (optional filter by page).

**Query Parameters:**
- `page_id` - Filter by page ID

#### POST /api/faqs
Create FAQ (requires auth).

#### PUT /api/faqs/:id
Update FAQ (requires auth).

#### DELETE /api/faqs/:id
Delete FAQ (requires auth).

### Homepage

#### GET /api/homepage
Get homepage sections.

#### POST /api/homepage
Create homepage section (requires auth).

#### PUT /api/homepage/:id
Update homepage section (requires auth).

#### DELETE /api/homepage/:id
Delete homepage section (requires auth).

#### PUT /api/homepage/reorder
Reorder homepage sections (requires auth).

**Request:**
```json
{
  "orderedIds": ["id1", "id2", "id3"]
}
```

### Media

#### GET /api/media
Get all media files.

#### GET /api/media/:id
Get single media file.

#### POST /api/media/upload
Upload media file (requires auth).

**Request (multipart/form-data):**
```
file: <binary>
alt_text: "Image description"
```

**Request (JSON with base64):**
```json
{
  "data": "base64-encoded-data",
  "filename": "image.jpg",
  "mime_type": "image/jpeg",
  "alt_text": "Image description"
}
```

#### PUT /api/media/:id
Update media metadata (requires auth).

#### DELETE /api/media/:id
Delete media file (requires auth).

### Navigation

#### GET /api/navigation
Get navigation items.

#### PUT /api/navigation
Update navigation items (requires auth).

**Request:**
```json
{
  "items": [
    {
      "label": "Home",
      "url": "/",
      "order": 0,
      "target": "_self"
    }
  ]
}
```

### Settings

#### GET /api/settings
Get site settings.

#### PUT /api/settings
Update site settings (requires auth).

### Styles

#### GET /api/styles
Get site styles.

#### PUT /api/styles
Update site styles (requires auth).

### Redirects

#### GET /api/redirects
Get all redirects.

#### POST /api/redirects
Create redirect (requires auth).

#### PUT /api/redirects/:id
Update redirect (requires auth).

#### DELETE /api/redirects/:id
Delete redirect (requires auth).

### Sitemap

#### GET /api/sitemap
Get sitemap XML.

### Seed

#### POST /api/seed
Seed demo data.

---

## 📞 Support

### Common Questions

**Q: Can I use this for free?**
A: Yes! Netlify's free tier includes:
- 100GB bandwidth/month
- 125K function requests/month
- 1GB blob storage

**Q: How do I add more admin users?**
A: Currently, only one admin user is supported. To add more, modify `netlify/functions/auth.ts`.

**Q: Can I use a real database?**
A: Yes, you can replace Netlify Blobs with:
- Supabase (PostgreSQL)
- PlanetScale (MySQL)
- MongoDB Atlas
- Firebase Firestore

**Q: How do I backup my data?**
A: Use the API to export data:
```bash
curl https://your-site.netlify.app/api/content > backup.json
```

**Q: Can I use this commercially?**
A: Yes, this project is MIT licensed.

---

## 🎯 Next Steps

1. **Deploy your site** following the instructions above
2. **Change default credentials** immediately
3. **Customize styles** to match your brand
4. **Create your content** using the admin panel
5. **Set up custom domain** for professional appearance
6. **Enable analytics** to track visitors
7. **Set up backups** to protect your data

---

## 📄 License

MIT License - feel free to use this project for personal or commercial purposes.

---

## 🙏 Credits

Built with:
- [React](https://react.dev/)
- [TypeScript](https://www.typescriptlang.org/)
- [Vite](https://vitejs.dev/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Netlify](https://www.netlify.com/)
- [Framer Motion](https://www.framer.com/motion/)
- [Lucide Icons](https://lucide.dev/)
