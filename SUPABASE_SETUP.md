# ORB Lotto - Supabase Setup Guide

This guide will walk you through setting up Supabase for your ORB Lotto application.

## 1. Create a Supabase Project

1. Go to [Supabase](https://supabase.com/) and sign up or log in
2. Create a new project
3. Choose a name for your project (e.g., "orb-lotto")
4. Choose a secure password for your database
5. Select a region closest to your users
6. Wait for your project to be created (this may take a few minutes)

## 2. Get Your Supabase Credentials

1. Once your project is created, go to the Project Settings > API
2. Copy the `Project URL` and `anon public` key
3. Add these to your `.env.local` file:

```
NEXT_PUBLIC_SUPABASE_URL=your_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

> **Important**: The `SUPABASE_SERVICE_ROLE_KEY` is required for user creation and admin operations. This key has full access to your database, so keep it secure and never expose it to the client.

## 3. Setup Options

There are two ways to set up your database schema - with or without requiring Supabase Auth integration.

### Option A: Full Auth Integration (Recommended for Production)

Use this approach if you want full Supabase Auth integration. This requires users to have auth accounts, which enables features like:
- Row Level Security (RLS) based on authenticated users
- Password authentication
- OAuth providers
- Email verification

For this option, use the `20250409000000_initial_schema.sql` migration file.

### Option B: Simplified Schema without Auth (Development/MVP)

Use this approach for quick development or if you don't need full auth integration. This option:
- Removes the dependency on `auth.users` 
- Allows direct user creation without auth accounts
- Works better for testing and development

For this option, use the `20250410000000_remove_auth_dependency.sql` migration file.

## 4. Run Database Migrations

The migration files in the `supabase/migrations` directory define the database schema for ORB Lotto. There are several ways to apply these migrations:

### Option 1: Using the Supabase Dashboard

1. Go to your Supabase project dashboard
2. Navigate to the SQL Editor
3. Copy the contents of the appropriate migration file from the `supabase/migrations` directory
4. Paste and run the SQL

### Option 2: Using the Supabase CLI (More Advanced)

1. Install the Supabase CLI by following the [official guide](https://supabase.com/docs/guides/cli)
2. Link your project:

```bash
supabase login
supabase link --project-ref your_project_ref
```

3. Push your migrations:

```bash
supabase db push
```

## 5. Test the Setup

After completing the setup, you should be able to:

1. Connect to your Supabase project from the ORB Lotto application
2. See the tables created in the Supabase Dashboard under the "Table Editor" section
3. Connect with a wallet and see user data stored in the database

## Database Schema

The ORB Lotto database consists of the following tables:

### Users
- Stores user profiles linked to their wallet addresses
- In Option A, connected to the Supabase Auth system
- In Option B, standalone with UUIDs

### Ticket Types
- Defines the different types of lottery tickets available (Basic, Plus, Super, etc.)
- Includes price information

### Draws
- Stores information about lottery draws
- Includes draw dates, winning numbers, and prize pool amounts

### Tickets
- Records all tickets purchased by users
- Links to users, draws, and ticket types

### Transactions
- Tracks all financial transactions
- Includes ticket purchases and winnings

## Stored Procedures

The database includes the following stored procedures:

### purchase_tickets
- Handles the purchase of lottery tickets in a transaction
- Creates both ticket and transaction records atomically

### increment and increment_by
- Utility functions for incrementing values

## Security

The database uses Row Level Security (RLS) to ensure that:
- Users can only access their own data
- Public views are available for transparency

## Maintenance and Backups

Supabase automatically handles backups of your database. However, it's recommended to:
1. Regularly export important data
2. Monitor database size and performance
3. Set up alerts for any issues

## Troubleshooting

If you're having issues with Supabase integration, try these steps:

### Check Your Environment Variables

Run the provided script to verify your Supabase configuration:

```bash
npm run check-supabase
```

This will test your connection and identify common configuration issues.

### Common Issues and Solutions

1. **User data not being saved to the database**:
   - Ensure your `SUPABASE_SERVICE_ROLE_KEY` is correctly set in `.env.local`
   - Check that the auth user creation is working properly
   - If using Option A (with auth), verify the database schema matches what's expected
   - Consider switching to Option B (without auth) for easier development
   
2. **"Error: Failed to create auth user"**:
   - This typically means your service role key doesn't have the necessary permissions
   - Verify the key in your Supabase dashboard
   - Try generating a new service role key
   - Consider switching to Option B (without auth)

3. **"RLS policy violation"**:
   - Your Row Level Security policies may be too restrictive
   - Check the RLS policies in the Supabase dashboard
   - Use the service role key for admin operations

4. **Client-side state issues**:
   - Clear your browser's localStorage and cookies
   - Try the clean development server:
   ```bash
   npm run dev:clean
   ```

5. **Database schema mismatch**:
   - Verify all migrations have been applied correctly
   - Check the Supabase dashboard to confirm tables exist with correct structures

### Checking Logs

For detailed error information:
1. Check your browser console for client-side errors
2. Look at the server logs in your terminal
3. Review the Supabase logs in the dashboard under "Database" > "Logs"

## Getting Help

If you encounter any issues with the Supabase setup:
1. Check the Supabase documentation: https://supabase.com/docs
2. Join the Supabase Discord: https://discord.supabase.com
3. Review the migration files in the `supabase/migrations` directory 