-- Empathetic Encounters — Phase 2 schema.
-- Run once in the Supabase SQL editor (Dashboard → SQL Editor → New query).

create table public.profiles (
  id uuid primary key references auth.users on delete cascade,
  display_name text,
  role text,             -- optional: medical student / resident / physician / other / general learner
  training_level text,   -- optional free text
  visual_style text not null default 'basic',  -- see migrations/001; keep in sync with lib/visual-styles.ts
  created_at timestamptz not null default now()
);

create table public.attempts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users on delete cascade,
  case_id text not null,
  case_version int not null,
  mode text not null default 'deliberative' check (mode in ('deliberative', 'timed')),
  status text not null default 'in-progress' check (status in ('in-progress', 'completed', 'abandoned')),
  path jsonb not null default '[]'::jsonb,      -- [{nodeId, resolution, decisionMs, scenarioClockAfter, effectsApplied, branchReason}]
  state jsonb,                                  -- mid-run resume state; null once completed
  final_metrics jsonb,                          -- the eight metrics at completion
  outcome_summary text,
  reflections text,                             -- optional written reflection (Phase 7)
  parent_attempt_id uuid references public.attempts on delete set null,  -- branch replays (Phase 5)
  branch_node_id text,
  started_at timestamptz not null default now(),
  completed_at timestamptz
);

create index attempts_user_case_idx on public.attempts (user_id, case_id, status);
create index attempts_user_started_idx on public.attempts (user_id, started_at desc);

alter table public.profiles enable row level security;
alter table public.attempts enable row level security;

create policy "own profile" on public.profiles
  for all using (auth.uid() = id) with check (auth.uid() = id);

create policy "own attempts" on public.attempts
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Auto-create a profile row on signup.
create function public.handle_new_user() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, display_name)
  values (new.id, coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)));
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
