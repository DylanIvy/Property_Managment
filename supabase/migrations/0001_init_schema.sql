-- ============ profiles ============
-- auth.users is managed by Supabase Auth and isn't directly writable by app
-- code, so mirror the fields the app needs in a public profiles table keyed
-- on auth.users.id, populated by a trigger on signup.
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  name text,
  email text,
  phone text,
  role text not null check (role in ('owner', 'staff')),
  created_at timestamptz not null default now()
);

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, name, email, phone, role)
  values (
    new.id,
    new.raw_user_meta_data ->> 'name',
    new.email,
    new.raw_user_meta_data ->> 'phone',
    coalesce(new.raw_user_meta_data ->> 'role', 'owner')
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ============ properties ============
create table public.properties (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references public.profiles(id) on delete cascade,
  name text not null,
  address text,
  created_at timestamptz not null default now()
);

-- ============ property_staff (join table) ============
create table public.property_staff (
  id uuid primary key default gen_random_uuid(),
  property_id uuid not null references public.properties(id) on delete cascade,
  staff_id uuid not null references public.profiles(id) on delete cascade,
  service_type text,
  notes text,
  created_at timestamptz not null default now(),
  unique (property_id, staff_id)
);

-- ============ tasks ============
create table public.tasks (
  id uuid primary key default gen_random_uuid(),
  property_id uuid not null references public.properties(id) on delete cascade,
  title text not null,
  description text,
  assigned_staff_id uuid references public.profiles(id),
  status text not null default 'open' check (status in ('open', 'done')),
  recurring boolean not null default false,
  due_date date,
  photo_proof_url text,
  created_at timestamptz not null default now()
);

-- ============ messages ============
-- Schema included now for completeness; UI/feature work lands in a later session.
create table public.messages (
  id uuid primary key default gen_random_uuid(),
  property_id uuid not null references public.properties(id) on delete cascade,
  sender_id uuid not null references public.profiles(id),
  recipient_id uuid references public.profiles(id),
  content text,
  attachment_url text,
  created_at timestamptz not null default now(),
  read_at timestamptz
);
