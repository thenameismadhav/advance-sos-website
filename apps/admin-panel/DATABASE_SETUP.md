# 🗄️ Database Setup Guide

## ✅ **Single SQL File for Database Initialization**

**Use this file:** `supabase_schema.sql`

This is the **only** SQL file you need to run for complete database setup.

## 🚀 **Quick Setup Steps**

1. **Go to Supabase Dashboard**
   - Navigate to https://supabase.com/dashboard
   - Select your project

2. **Open SQL Editor**
   - Click on "SQL Editor" in the left sidebar

3. **Run the Schema**
   - Copy the entire contents of `supabase_schema.sql`
   - Paste it into the SQL Editor
   - Click "Run" to execute

## 📋 **What's Included in supabase_schema.sql**

✅ **Complete Database Schema**
- `users` - User profiles (extends Supabase auth)
- `sos_events` - Emergency events
- `helpers` - Available helpers
- `responders` - Emergency responders
- `hospitals` - Medical facilities
- `media` - Event media attachments
- `locations` - General location tracking

✅ **Custom Types**
- `emergency_type` - Medical, fire, police, other
- `sos_status` - Active, assigned, resolved, cancelled
- `helper_status` - Available, busy, offline
- `media_type` - Image, video, audio

✅ **Security & Performance**
- Row Level Security (RLS) policies
- Database indexes for performance
- Automatic timestamp triggers
- Helper functions for distance calculations

✅ **Sample Data**
- Sample hospitals for testing
- Ready-to-use emergency services data

## ⚠️ **Important Notes**

- **Only run this file once** - it's idempotent (safe to run multiple times)
- **No other SQL files needed** - this contains everything
- **Backup your data** if you have existing data before running

## 🔧 **Post-Setup**

After running the SQL:
1. Enable real-time subscriptions in Supabase dashboard
2. Configure authentication settings
3. Test the connection using the admin panel

## 📚 **Additional Documentation**

- `SUPABASE_MAPBOX_README.md` - Integration details
- `SUPABASE_MAPBOX_SETUP.md` - Complete setup guide
- `LOCATION_FEATURES.md` - Location features documentation 