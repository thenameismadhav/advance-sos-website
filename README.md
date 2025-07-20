# Advance SOS Monorepo

A monorepo containing both the public information website and admin panel for the Advance SOS emergency response platform.

## 🏗️ Project Structure

```
advance-sos-website/
├── apps/
│   ├── info-web/        → React/TS project (Public Info Site)
│   └── admin-panel/     → React/TS project (Admin Dashboard)
├── dist/                → Build output
│   ├── index.html       ← info-web build
│   └── admin/
│       └── index.html   ← admin-panel build
├── package.json         → Root with build scripts
├── vercel.json          → Vercel config for routing
└── .gitignore
```

## 🚀 Development

### Start Development Servers
```bash
npm run dev
```
This starts both apps concurrently:
- **Info Web**: http://localhost:8080
- **Admin Panel**: http://localhost:8081

### Individual Development
```bash
npm run dev:info-web    # Only info-web (port 8080)
npm run dev:admin-panel # Only admin-panel (port 8081)
```

## 🔗 Admin Panel Access

### From Info Web
The info-web site has admin buttons in the top navigation that link to the admin panel:

- **Development**: Opens admin panel in a new tab at `http://localhost:8081`
- **Production**: Navigates to `/admin` route (handled by Vercel routing)

### Direct Access
- **Development**: http://localhost:8081
- **Production**: https://yourdomain.com/admin

## 🏗️ Build & Deploy

### Build for Production
```bash
npm run build
```
Creates production builds in the `dist/` folder:
- `dist/index.html` - Info web
- `dist/admin/index.html` - Admin panel

### Vercel Deployment
The `vercel.json` configures routing:
- `/` → Info web
- `/admin` → Admin panel
- `/admin/*` → Admin panel assets

## 📝 Available Scripts

- `npm run dev` - Start both development servers
- `npm run build` - Build both apps for production
- `npm run clean` - Clean the dist directory
- `npm run dev:info-web` - Start info-web only
- `npm run dev:admin-panel` - Start admin-panel only
- `npm run build:info-web` - Build info-web only
- `npm run build:admin-panel` - Build admin-panel only

## 🎯 Features

- ✅ Monorepo setup with shared build configuration
- ✅ Separate development servers for each app
- ✅ Production builds with proper routing
- ✅ Admin panel linking from info-web
- ✅ Vercel deployment ready
- ✅ TypeScript support for both apps "# advance-sos-website" 
