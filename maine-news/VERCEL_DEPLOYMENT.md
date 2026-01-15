# Vercel Deployment Configuration

## Issue
Posts are not appearing on the deployed site because Vercel needs to know the correct root directory.

## Repository Structure
```
maine-news (GitHub repo root)
└── maine-news/  ← Next.js application directory
    ├── src/
    │   └── content/
    │       └── posts/  ← Keystatic content
    ├── package.json
    ├── next.config.ts
    └── vercel.json
```

## Required Vercel Configuration

### Option 1: Configure via Vercel Dashboard (RECOMMENDED)
1. Go to your project settings on Vercel (https://vercel.com/ezekiel11011/maine-news/settings)
2. Navigate to "General" settings
3. Find "Root Directory" setting
4. Set it to: `maine-news`
5. Click "Save"
6. Redeploy the project

### Option 2: Use vercel.json at Repo Root
If the dashboard configuration doesn't work, you can also create a `vercel.json` at the repository root:

```json
{
  "buildCommand": "cd maine-news && pnpm build",
  "installCommand": "cd maine-news && pnpm install",
  "outputDirectory": "maine-news/.next"
}
```

## Why This is Needed
- The GitHub repository root is `/`
- The Next.js application is in `/maine-news/`  
- Keystatic paths are `src/content/posts/*` (relative to `/maine-news/`)
- Without setting the root directory, Vercel looks for content at `/src/content/posts/` instead of `/maine-news/src/content/posts/`

## Verification
After setting the root directory and redeploying:
- Posts from Keystatic should appear on the home page
- Individual article pages should load correctly
- The admin panel should work for creating new database posts
