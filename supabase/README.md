# Supabase Setup

## Apply Migration

In the Supabase dashboard:
1. Go to SQL Editor
2. Paste and run `migrations/001_leads_table.sql`

Or with Supabase CLI:
```bash
supabase db push
```

## RLS Policies

- Anonymous users can INSERT (assessment submissions)
- Service role has full access (advisor queries via `/api/leads`)

## Environment Variables Required

Set in `.env.local` and Vercel project settings:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
