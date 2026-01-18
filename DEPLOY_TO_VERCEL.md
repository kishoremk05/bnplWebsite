# Deploy to Vercel

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=YOUR_GITHUB_REPO_URL)

## Quick Start

1. **Push to GitHub** (if not already done)
2. **Import to Vercel** from your GitHub repository
3. **Add Environment Variables** (see below)
4. **Deploy!**

## Required Environment Variables

Add these in Vercel → Settings → Environment Variables:

```env
VITE_SUPABASE_PROJECT_ID=acfpgcvmxpkzjpolimzx
VITE_SUPABASE_URL=https://acfpgcvmxpkzjpolimzx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFjZnBnY3ZteHBrempwb2xpbXp4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjgyOTc2MTksImV4cCI6MjA4Mzg3MzYxOX0.-4Bvh8ni1kGD49kyJ5p_VSfr5Q34Rozk6JuWJyKu6iI
VITE_SUPABASE_PUBLISHABLE_KEY=sb_publishable_4xhfUD8JJwve45UjVbgBAQ_-dOqQ-5K
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_51S7vPn5higtYxg8XEl6TQEqEA1AqlkVJoWMJca50yHA7TrzBoW0cYuW4iHYV7Q9bOK9keeNh4GQqGDmO7mYywBTi00c5lVfLFd
```

## Build Settings

Vercel will auto-detect these, but verify:

- **Framework Preset:** Vite
- **Build Command:** `npm run build`
- **Output Directory:** `dist`
- **Install Command:** `npm install`

## After Deployment

1. Update Supabase Site URL with your Vercel deployment URL
2. Test all features thoroughly
3. See full deployment guide for details

## Documentation

- 📖 [Full Deployment Guide](./VERCEL_DEPLOYMENT_GUIDE.md)
- ✅ [Deployment Checklist](./DEPLOYMENT_CHECKLIST.md)
- 📚 [Main README](./README.md)

## Support

For deployment issues, check:
- [Vercel Documentation](https://vercel.com/docs)
- [Vite Deployment Guide](https://vitejs.dev/guide/static-deploy.html)
