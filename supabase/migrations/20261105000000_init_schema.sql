-- ==============================================================================
-- Kaveron Agency - Database Schema & Row-Level Security (RLS)
-- Supabase Migration: 20261105000000_init_schema.sql
-- ==============================================================================

-- 1. PROFILES TABLE (User roles linked to Supabase auth.users)
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  role text not null default 'user' check (role in ('admin', 'user')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Enable RLS on profiles
alter table public.profiles enable row level security;

-- Helper security definer function to check if the current user is an admin
create or replace function public.is_admin()
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select coalesce(
    (
      select role = 'admin'
      from public.profiles
      where id = auth.uid()
    ),
    false
  );
$$;

-- Profiles RLS Policies
drop policy if exists "Users can view own profile" on public.profiles;
create policy "Users can view own profile"
  on public.profiles
  for select
  using (auth.uid() = id);

drop policy if exists "Admins can view and manage all profiles" on public.profiles;
create policy "Admins can view and manage all profiles"
  on public.profiles
  for all
  using (public.is_admin())
  with check (public.is_admin());

-- Automatic profile creation trigger when a user is created in auth.users
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, role)
  values (new.id, 'user')
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();


-- 2. LEADS TABLE (Inquiries from contact form & chatbot)
create table if not exists public.leads (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  name text not null check (char_length(trim(name)) >= 1 and char_length(name) <= 120),
  email text not null check (
    char_length(email) <= 255 and
    email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'
  ),
  phone text check (phone is null or char_length(phone) <= 50),
  service_type text not null check (char_length(service_type) <= 100),
  budget text check (budget is null or char_length(budget) <= 50),
  message text not null check (char_length(trim(message)) >= 1 and char_length(message) <= 5000),
  source text not null default 'contact_form' check (source in ('contact_form', 'chatbot')),
  selected_plan text check (selected_plan is null or char_length(selected_plan) <= 50),
  status text not null default 'new' check (status in ('new', 'contacted', 'closed')),
  notes text check (notes is null or char_length(notes) <= 10000),
  language text not null default 'en' check (language in ('en', 'ar')),
  ip_hash text
);

-- Enable RLS on leads
alter table public.leads enable row level security;

-- Indexes for performance
create index if not exists idx_leads_created_at on public.leads (created_at desc);
create index if not exists idx_leads_status on public.leads (status);
create index if not exists idx_leads_ip_hash_created_at on public.leads (ip_hash, created_at desc);

-- Leads RLS Policies:
-- Anonymous (public) has NO direct access. Writes are performed by Edge Functions with service_role.
-- Admins have full access (SELECT, UPDATE, DELETE, INSERT).
drop policy if exists "Admins have full access to leads" on public.leads;
create policy "Admins have full access to leads"
  on public.leads
  for all
  using (public.is_admin())
  with check (public.is_admin());


-- 3. CHAT SESSIONS TABLE
create table if not exists public.chat_sessions (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  language text check (language is null or language in ('en', 'ar')),
  messages jsonb not null default '[]'::jsonb,
  lead_id uuid references public.leads(id) on delete set null
);

-- Enable RLS on chat_sessions
alter table public.chat_sessions enable row level security;

create index if not exists idx_chat_sessions_created_at on public.chat_sessions (created_at desc);
create index if not exists idx_chat_sessions_lead_id on public.chat_sessions (lead_id);

-- Chat sessions RLS: Admins only. Anonymous writes/reads handled via Edge Function with service_role.
drop policy if exists "Admins have full access to chat_sessions" on public.chat_sessions;
create policy "Admins have full access to chat_sessions"
  on public.chat_sessions
  for all
  using (public.is_admin())
  with check (public.is_admin());


-- 4. KNOWLEDGE BASE TABLE
create table if not exists public.knowledge_base (
  id uuid primary key default gen_random_uuid(),
  topic text not null check (char_length(topic) <= 100),
  question_en text not null,
  question_ar text not null,
  answer_en text not null,
  answer_ar text not null,
  keywords text[] not null default '{}'::text[],
  active boolean not null default true,
  updated_at timestamptz not null default now()
);

-- Enable RLS on knowledge_base
alter table public.knowledge_base enable row level security;

-- Knowledge base RLS: Admins full access. No public read (Edge function reads with service_role).
drop policy if exists "Admins have full access to knowledge_base" on public.knowledge_base;
create policy "Admins have full access to knowledge_base"
  on public.knowledge_base
  for all
  using (public.is_admin())
  with check (public.is_admin());


-- 5. UNANSWERED QUESTIONS TABLE
create table if not exists public.unanswered_questions (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  question text not null check (char_length(question) <= 2000),
  language text check (language is null or language in ('en', 'ar')),
  session_id uuid,
  status text not null default 'new' check (status in ('new', 'added_to_kb'))
);

-- Enable RLS on unanswered_questions
alter table public.unanswered_questions enable row level security;

create index if not exists idx_unanswered_questions_created_at on public.unanswered_questions (created_at desc);
create index if not exists idx_unanswered_questions_status on public.unanswered_questions (status);

-- Unanswered questions RLS: Admins full access. No public direct access.
drop policy if exists "Admins have full access to unanswered_questions" on public.unanswered_questions;
create policy "Admins have full access to unanswered_questions"
  on public.unanswered_questions
  for all
  using (public.is_admin())
  with check (public.is_admin());

