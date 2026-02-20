-- Supabase SQL migration: analysis_results table
-- Run this in the Supabase SQL Editor (https://supabase.com/dashboard → SQL Editor)

create table if not exists public.analysis_results (
    id          uuid default gen_random_uuid() primary key,
    user_id     uuid references auth.users(id) on delete cascade not null,
    status      text default 'completed',
    results_data jsonb,
    raw_response jsonb,
    drugs_analyzed text[],
    created_at  timestamptz default now()
);

-- Index for fast user-scoped queries
create index if not exists idx_analysis_results_user_id
    on public.analysis_results (user_id);

-- RLS: users can only read/insert their own rows
alter table public.analysis_results enable row level security;

create policy "Users can view own analyses"
    on public.analysis_results for select
    using (auth.uid() = user_id);

create policy "Users can insert own analyses"
    on public.analysis_results for insert
    with check (auth.uid() = user_id);
