# How to Deploy This Project on Netlify

## Prerequisites

- A GitHub account with the repo: https://github.com/sk2838240/netlifyapp
- A Netlify account (free tier works): https://app.netlify.com

---

## Step 1: Create a New Site on Netlify

1. Go to https://app.netlify.com
2. Click **"Add new site"** → **"Import an existing project"**
3. Click **"Deploy with GitHub"**
4. Authorize Netlify to access your GitHub if prompted
5. Select the repository: **sk2838240/netlifyapp**

---

## Step 2: Configure Build Settings

Netlify will auto-detect the `netlify.toml` file. Verify these settings:

| Setting            | Value                          |
|--------------------|--------------------------------|
| **Build command**  | `npm install && npm run build` |
| **Publish directory** | `dist`                      |
| **Functions directory** | `netlify/functions`      |

If they are empty, enter them manually. Otherwise leave as-is.

---

## Step 3: Environment Variables

No environment variables are required. Do NOT add any environment variables on Netlify (such as `Email` or `Password`) — they are not used by this project and can cause build issues.

Default admin credentials (hardcoded in `netlify/functions/auth.ts`):

| Field    | Value                |
|----------|----------------------|
| Email    | `admin@cms.local`    |
| Password | `admin123`           |

> WARNING: These are default credentials. Change them in `netlify/functions/auth.ts` before going to production.

---

## Step 4: Deploy

1. Click **"Deploy site"**
2. Wait 1-3 minutes for the build to complete
3. Netlify will assign a random URL like: `https://your-site-name.netlify.app`

---

## Step 5: Access the Site

- **Public site**: `https://your-site-name.netlify.app`
- **Admin panel**: `https://your-site-name.netlify.app/admin`
- **Login with**: `admin@cms.local` / `admin123`

---

## Step 6 (Optional): Custom Domain

1. Go to **Site settings → Domain management**
2. Click **"Add a domain alias"**
3. Enter your custom domain
4. Update your domain's DNS records as instructed by Netlify

---

## Project Structure

```
├── netlify.toml              # Netlify configuration (build, redirects, functions)
├── netlify/functions/        # Serverless API functions
│   ├── auth.ts               # Authentication (login/verify)
│   ├── content.ts            # Blog/press content CRUD
│   ├── categories.ts         # Category management
│   ├── tags.ts               # Tag management
│   ├── faqs.ts               # FAQ management
│   ├── homepage.ts           # Homepage content
│   ├── media.ts              # Media library
│   ├── media-file.ts         # Media file serving
│   ├── navigation.ts         # Navigation menus
│   ├── settings.ts           # Site settings
│   ├── styles.ts             # Style customization
│   ├── redirects.ts          # URL redirects
│   ├── schedule.ts           # Content scheduling
│   ├── sitemap.ts            # Sitemap generation
│   └── optimize.ts           # Image optimization
├── src/                      # React frontend source
│   ├── pages/                # Site pages
│   ├── pages/admin/          # Admin panel pages
│   ├── components/           # Reusable components
│   ├── context/              # React context (Auth, Toast)
│   ├── hooks/                # Custom hooks
│   ├── lib/                  # Utility libraries
│   └── types/                # TypeScript types
└── package.json              # Dependencies and scripts
```

---

## Technology Stack

- **Frontend**: React 18, TypeScript, Vite, Tailwind CSS 4
- **Backend**: Netlify Functions (serverless)
- **Storage**: Netlify Blobs (built-in, no database setup needed)
- **Routing**: React Router DOM v6
- **Animations**: Framer Motion
- **Icons**: Lucide React

---

## Troubleshooting

### Build fails
- Check the deploy log in Netlify dashboard under **Deploys → [latest deploy]**
- Ensure Node.js version is 18+ (set in **Site settings → Build & deploy → Environment**)

### Functions not working
- Verify the functions directory is set to `netlify/functions`
- Check function logs in Netlify dashboard under **Functions** tab

### Site shows 404 on refresh
- The `[[redirects]]` rule in `netlify.toml` handles SPA routing
- Ensure the catch-all redirect `/* -> /index.html` is present (it is)

### Admin login not working
- Default credentials: `admin@cms.local` / `admin123`
- Check browser console for API errors
- Verify functions are deployed (check Netlify dashboard → Functions tab)
