# 🚨 Advance SOS Admin Panel - Supabase + Mapbox Integration

This guide will help you set up the complete integration between your Admin Panel, Supabase, and Mapbox for real-time SOS event tracking.

## 📋 Prerequisites

- Supabase account and project
- Mapbox account and access token
- Node.js and npm/yarn installed
- Basic knowledge of React and TypeScript

## 🔧 Step 1: Environment Setup

Create a `.env.local` file in your project root with the following variables (this is the ONLY environment file you need):

```bash
VITE_SUPABASE_URL=https://odkvcbnsimkhpmkllngo.supabase.co
VITE_SUPABASE_PUBLISHABLE_DEFAULT_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9ka3ZjYm5zaW1raHBta2xsbmdvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTIyNTI2MzIsImV4cCI6MjA2NzgyODYzMn0.xHYXF_zuh_YpASkEfd55AtV_hjoEnh0j8RRiNaVL29k
VITE_MAPBOX_TOKEN=pk.eyJ1IjoiaHZtcCIsImEiOiJjbWN6MWk0OXQwdGM4MmtzMzZ4em5zNWFjIn0.bS5vNy8djudidIdQ6yYUdw
```

## 🗄️ Step 2: Supabase Database Setup

1. **Go to your Supabase Dashboard**
   - Navigate to https://supabase.com/dashboard
   - Select your project

2. **Run the SQL Schema**
   - Go to SQL Editor in your Supabase dashboard
   - Copy and paste the contents of `supabase_schema.sql`
   - Execute the script

3. **Enable Realtime**
   - Go to Database → Replication
   - Enable realtime for all tables:
     - `sos_events`
     - `helpers`
     - `responders`
     - `hospitals`
     - `media`
     - `locations`

4. **Set up Authentication**
   - Go to Authentication → Settings
   - Enable Email auth
   - Create an admin user:
     - Email: `admin@advancesos.com`
     - Password: `admin123`

## 🗺️ Step 3: Mapbox Configuration

1. **Get your Mapbox Access Token**
   - Go to https://account.mapbox.com/access-tokens/
   - Copy your default public token
   - Update it in `.env.local`

2. **Enable Required APIs**
   - Directions API (for route calculation)
   - Geocoding API (for address lookup)

## 🚀 Step 4: Run the Application

1. **Install dependencies**
```bash
npm install
```

2. **Start the development server**
```bash
npm run dev
```

3. **Access the Admin Panel**
   - Navigate to `http://localhost:5173/admin`
   - Login with: `admin@advancesos.com` / `admin123`

## 🎯 Features Implemented

### ✅ Authentication
- Secure admin login with email/password
- Session management with Supabase Auth
- Protected admin dashboard

### ✅ Real-time SOS Events
- Live SOS event feed from Supabase
- Real-time updates using Supabase subscriptions
- Event status tracking (active, assigned, resolved, cancelled)

### ✅ Mapbox Integration
- Interactive map with real-time markers
- Different marker colors for different entity types:
  - 🔴 Red: SOS Users
  - 🔵 Blue: Helpers
  - 🟢 Green: Responders
  - 🟡 Yellow: Hospitals

### ✅ Marker Filtering
- Toggle visibility for different marker types
- Side panel with filter controls
- Real-time statistics

### ✅ Route Calculation
- Automatic route calculation between responders and SOS users
- Distance and ETA display
- Visual route lines on the map

### ✅ Timeline & Media
- Event timeline tracking
- Media attachment support (images, videos, audio)
- Historical event viewing

### ✅ Admin Controls
- Secure dashboard access
- Real-time event management
- Helper and responder assignment

## 📊 Database Schema

### Tables Created:
- `users` - User profiles
- `sos_events` - Emergency events
- `helpers` - Available helpers
- `responders` - Emergency responders
- `hospitals` - Medical facilities
- `media` - Event media attachments
- `locations` - General location tracking

### Key Features:
- Row Level Security (RLS) enabled
- Real-time subscriptions
- Geospatial indexing
- Automatic timestamp updates

## 🔄 Real-time Features

The application uses Supabase's real-time subscriptions to provide:

1. **Live SOS Event Updates**
   - New events appear instantly
   - Status changes update in real-time
   - Event resolution tracking

2. **Helper/Responder Location Updates**
   - Real-time location tracking
   - Status changes (available/busy/offline)
   - Automatic route recalculation

3. **Media Attachments**
   - Real-time media uploads
   - Automatic media association with events

## 🛠️ Customization

### Adding New Marker Types
1. Update the `getMarkerColor` function in `AdminDashboard.tsx`
2. Add new filter toggles
3. Update the Supabase service functions

### Customizing Map Styles
1. Change the `mapStyle` prop in the Map component
2. Available styles: `mapbox://styles/mapbox/dark-v11`, `mapbox://styles/mapbox/streets-v12`, etc.

### Adding New Emergency Types
1. Update the `emergency_type` enum in the database
2. Modify the TypeScript interfaces
3. Update the UI components

## 🐛 Troubleshooting

### Common Issues:

1. **Authentication Errors**
   - Check your Supabase URL and keys
   - Ensure RLS policies are correctly set
   - Verify user exists in auth.users

2. **Map Not Loading**
   - Verify Mapbox token is valid
   - Check browser console for CORS errors
   - Ensure token has required permissions

3. **Real-time Not Working**
   - Enable realtime in Supabase dashboard
   - Check subscription setup in code
   - Verify table permissions

4. **Database Connection Issues**
   - Check Supabase project status
   - Verify SQL schema was executed correctly
   - Check RLS policies

## 📱 Mobile Responsiveness

The admin panel is fully responsive and works on:
- Desktop computers
- Tablets
- Mobile devices

## 🔒 Security Considerations

1. **Environment Variables**
   - `.env.local` is automatically ignored by Git (safe for secrets)
- Never commit API keys to version control
   - Use different keys for development/production

2. **Row Level Security**
   - All tables have RLS enabled
   - Policies restrict access appropriately

3. **Authentication**
   - Secure session management
   - Automatic token refresh

## 🚀 Deployment

### Vercel Deployment
1. Connect your GitHub repository
2. Add environment variables in Vercel dashboard
3. Deploy automatically

### Netlify Deployment
1. Connect your repository
2. Set build command: `npm run build`
3. Add environment variables

## 📞 Support

For issues or questions:
1. Check the troubleshooting section
2. Review Supabase and Mapbox documentation
3. Check browser console for errors

## 🔄 Next Steps

Potential enhancements:
- [ ] Push notifications
- [ ] Advanced analytics dashboard
- [ ] Mobile app integration
- [ ] AI-powered threat detection
- [ ] Multi-language support
- [ ] Advanced reporting features

---

**🎉 Congratulations!** Your Advance SOS Admin Panel is now fully integrated with Supabase and Mapbox for real-time emergency response management. 