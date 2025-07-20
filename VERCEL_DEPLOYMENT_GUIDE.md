# 🚀 Vercel Deployment Guide for Advance SOS Monorepo

## 📋 Overview

This guide will help you deploy your Advance SOS monorepo to Vercel successfully. The project consists of two Vite React applications:

- **info-web** (main website) → builds to `dist/`
- **admin-panel** (admin interface) → builds to `dist/admin/`

## ✅ Prerequisites

1. **Vercel Account**: Sign up at [vercel.com](https://vercel.com)
2. **Git Repository**: Your code should be in a Git repository (GitHub, GitLab, etc.)
3. **Environment Variables**: Prepare your environment variables

## 🔧 Step 1: Environment Variables Setup

### Required Environment Variables

You'll need to set these in your Vercel project settings:

```env
# Supabase Configuration
VITE_SUPABASE_URL=https://odkvcbnsimkhpmkllngo.supabase.co
VITE_SUPABASE_ANON_KEY=sb_publishable_TEqMgL9G9YLUxfcRpXvvtQ_WuhU82Hn

# Mapbox Configuration
VITE_MAPBOX_TOKEN=pk.eyJ1IjoiaHZtcCIsImEiOiJjbWN6MWk0OXQwdGM4MmtzMzZ4em5zNWFjIn0.bS5vNy8djudidIdQ6yYUdw

# App Configuration
VITE_APP_URL=https://your-vercel-domain.vercel.app

# Feature Flags
VITE_ENABLE_2FA=false
VITE_ENABLE_AUDIT_LOGS=true
VITE_ENABLE_MULTILANGUAGE=true
```

### How to Set Environment Variables in Vercel:

1. Go to your Vercel project dashboard
2. Navigate to **Settings** → **Environment Variables**
3. Add each variable with the exact names above
4. Set **Environment** to **Production** (and optionally **Preview** and **Development**)

## 🚀 Step 2: Deploy to Vercel

### Option A: Deploy via Vercel Dashboard (Recommended)

1. **Connect Repository**:
   - Go to [vercel.com/dashboard](https://vercel.com/dashboard)
   - Click **"New Project"**
   - Import your Git repository
   - Select the repository containing your monorepo

2. **Configure Project Settings**:
   - **Framework Preset**: `Other`
   - **Root Directory**: `./` (leave empty for root)
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
   - **Install Command**: `npm install`

3. **Environment Variables**:
   - Add all the environment variables listed above
   - Make sure to set them for **Production** environment

4. **Deploy**:
   - Click **"Deploy"**
   - Wait for the build to complete

### Option B: Deploy via Vercel CLI

1. **Install Vercel CLI**:
   ```bash
   npm i -g vercel
   ```

2. **Login to Vercel**:
   ```bash
   vercel login
   ```

3. **Deploy**:
   ```bash
   vercel --prod
   ```

## 🔍 Step 3: Verify Deployment

After deployment, you should have:

- **Main Website**: `https://your-domain.vercel.app/`
- **Admin Panel**: `https://your-domain.vercel.app/admin`

### Test the Applications:

1. **Main Website**:
   - Visit your domain root
   - Should show the info website

2. **Admin Panel**:
   - Visit `/admin` on your domain
   - Should redirect to `/admin/login`
   - Login with:
     - Email: `advancesossystem@gmail.com`
     - Password: `admin2026`

## 🛠️ Troubleshooting

### ❌ Build Errors

**Error: "No Output Directory named 'public' found"**
- ✅ **Solution**: This is now fixed with the updated `vercel.json`
- The build output is correctly set to `dist`

**Error: "Module not found"**
- ✅ **Solution**: Make sure all dependencies are installed
- Check that `package.json` files exist in both `apps/info-web` and `apps/admin-panel`

**Error: "Environment variables not found"**
- ✅ **Solution**: 
  1. Verify all environment variables are set in Vercel
  2. Make sure they start with `VITE_`
  3. Check that they're set for the **Production** environment

### ❌ Runtime Errors

**Error: "Supabase connection failed"**
- ✅ **Solution**: 
  1. Check `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`
  2. Verify Supabase project is active
  3. Check RLS policies in Supabase

**Error: "Mapbox not loading"**
- ✅ **Solution**:
  1. Verify `VITE_MAPBOX_TOKEN` is correct
  2. Check token permissions in Mapbox dashboard
  3. Ensure token allows your domain

### ❌ Routing Issues

**Error: "404 on admin routes"**
- ✅ **Solution**: The `vercel.json` rewrites should handle this
- If issues persist, check that the build output structure is correct

## 📁 Expected Build Output Structure

After successful build, your `dist` folder should look like:

```
dist/
├── index.html          # Main website
├── assets/             # Main website assets
├── admin/
│   ├── index.html      # Admin panel
│   └── assets/         # Admin panel assets
└── ...
```

## 🔄 Continuous Deployment

Once set up, Vercel will automatically:

1. **Deploy on Push**: Every push to your main branch triggers a deployment
2. **Preview Deployments**: Pull requests get preview deployments
3. **Rollback**: Easy rollback to previous deployments

## 📊 Monitoring

### Vercel Analytics:
- **Performance**: Monitor Core Web Vitals
- **Errors**: Track JavaScript errors
- **Usage**: Monitor bandwidth and function calls

### Custom Monitoring:
- Set up Supabase monitoring for database performance
- Monitor Mapbox usage and costs
- Track admin panel usage patterns

## 🔒 Security Considerations

1. **Environment Variables**: Never commit sensitive keys to Git
2. **CORS**: Configure Supabase CORS settings for your Vercel domain
3. **Rate Limiting**: Consider implementing rate limiting for admin routes
4. **SSL**: Vercel provides automatic SSL certificates

## 📞 Support

If you encounter issues:

1. **Check Vercel Build Logs**: Detailed error information
2. **Vercel Documentation**: [vercel.com/docs](https://vercel.com/docs)
3. **Community**: [github.com/vercel/vercel/discussions](https://github.com/vercel/vercel/discussions)

---

**Last Updated**: December 2024  
**Version**: 2.0.0 