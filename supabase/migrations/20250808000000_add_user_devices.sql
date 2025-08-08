-- Migration to create user_devices table and RLS policies for notifications
create table if not exists user_devices (
  id uuid not null primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id),
  expo_push_token text not null unique,
  created_at timestamptz not null default now()
);

-- Create notifications table if it does not exist
create table if not exists notifications (
  id uuid not null primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id),
  type text not null,
  metadata jsonb default '{}'::jsonb,
  read boolean default false,
  created_at timestamptz not null default now()
);

-- Enable row level security on user_devices
alter table user_devices enable row level security;

-- Policies for user_devices
create policy "Allow select own device tokens" on user_devices
for select
using (auth.uid() = user_id);

create policy "Allow insert own device tokens" on user_devices
for insert
with check (auth.uid() = user_id);

create policy "Allow delete own device tokens" on user_devices
for delete
using (auth.uid() = user_id);

-- Enable row level security on notifications
alter table notifications enable row level security;

-- Policies for notifications
create policy "Allow select own notifications" on notifications
for select
using (auth.uid() = user_id);

create policy "Allow insert own notifications" on notifications
for insert
with check (auth.uid() = user_id);

create policy "Allow update read flag on own notifications" on notifications
for update
using (auth.uid() = user_id)
with check (auth.uid() = user_id);
