# Netlify CMS - WordPress-like Content Management System

A full-featured, WordPress-like CMS that runs entirely on Netlify for free.

## Features

- **Content Management**: Pages, Blog Posts, Press Releases with full CRUD
- **SEO Fields**: Meta title, description, keywords, OG tags, JSON-LD schema for every page
- **Homepage Editor**: Section-based editing with drag-and-drop ordering
- **Style Customizer**: Live preview - change colors, fonts, sizes for headings, paragraphs, FAQs
- **Categories & Tags**: Full taxonomy management
- **FAQ Management**: Create, edit, and display FAQs on any page
- **Navigation Editor**: Customize header menu links
- **Site Settings**: Logo, favicon, social links, analytics, custom CSS/HTML
- **Multi-tenant Ready**: Deploy for different clients with unique configurations
- **100% Free**: Uses Netlify Identity + Netlify Blobs (free tier)

## Getting Started

### Prerequisites
- Node.js 20+
- Netlify CLI (`npm install -g netlify-cli`)

### Local Development
```bash
npm install
npm run dev
```

### Deploy to Netlify
1. Push this repo to GitHub
2. Connect it to Netlify
3. Build command: `npm install && npm run build`
4. Publish directory: `dist`

### Default Login
- Email: `admin@cms.local`
- Password: `admin123`

**Change these credentials in `netlify/functions/auth.ts` before deploying to production.**

## Architecture

- **Frontend**: React + Vite + Tailwind CSS
- **Backend**: Netlify Functions (serverless)
- **Storage**: Netlify Blobs (built-in key-value store)
- **Auth**: Token-based (Netlify Identity compatible)

## Project Structure

```
├── netlify/
│   └── functions/       # Serverless API endpoints
├── src/
│   ├── components/      # React components
│   ├── context/         # React context providers
│   ├── hooks/           # Custom React hooks
│   ├── lib/             # Utilities and API client
│   ├── pages/           # Page components
│   └── types/           # TypeScript definitions
├── netlify.toml         # Netlify configuration
└── package.json
```
