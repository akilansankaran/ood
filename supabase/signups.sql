create table if not exists public.signups (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(trim(name)) between 1 and 120),
  email text not null check (email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$'),
  created_at timestamptz not null default now(),
  unique (email)
);

alter table public.signups enable row level security;
grant usage on schema public to anon, authenticated;
grant insert on public.signups to anon, authenticated;

drop policy if exists "public can insert signups" on public.signups;
create policy "public can insert signups"
  on public.signups
  for insert
  to anon, authenticated, public
  with check (true);
