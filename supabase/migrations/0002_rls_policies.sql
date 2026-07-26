alter table public.profiles enable row level security;
alter table public.properties enable row level security;
alter table public.property_staff enable row level security;
alter table public.tasks enable row level security;
alter table public.messages enable row level security;

-- security definer helpers avoid recursive-policy issues when tasks/properties
-- policies need to check property_staff membership.
create or replace function public.is_staff_on_property(p_property_id uuid)
returns boolean
language sql
security definer
stable
set search_path = public
as $func$
  select exists (
    select 1 from public.property_staff ps
    where ps.property_id = p_property_id
      and ps.staff_id = auth.uid()
  );
$func$;

create or replace function public.is_owner_of_property(p_property_id uuid)
returns boolean
language sql
security definer
stable
set search_path = public
as $func$
  select exists (
    select 1 from public.properties p
    where p.id = p_property_id
      and p.owner_id = auth.uid()
  );
$func$;

-- ============ profiles ============
create policy "profiles_select" on public.profiles
  for select using (
    id = auth.uid()
    or exists (
      select 1 from public.property_staff ps
      join public.properties p on p.id = ps.property_id
      where ps.staff_id = profiles.id and p.owner_id = auth.uid()
    )
    or exists (
      select 1 from public.property_staff ps
      join public.properties p on p.id = ps.property_id
      where p.owner_id = profiles.id and ps.staff_id = auth.uid()
    )
  );

create policy "profiles_update_own" on public.profiles
  for update using (id = auth.uid());
-- No insert policy: rows are created only by the security-definer trigger.

-- ============ properties ============
create policy "properties_select" on public.properties
  for select using (
    owner_id = auth.uid()
    or public.is_staff_on_property(id)
  );

create policy "properties_insert_owner_only" on public.properties
  for insert with check (
    owner_id = auth.uid()
    and exists (select 1 from public.profiles pr where pr.id = auth.uid() and pr.role = 'owner')
  );

create policy "properties_update_own" on public.properties
  for update using (owner_id = auth.uid());

create policy "properties_delete_own" on public.properties
  for delete using (owner_id = auth.uid());

-- ============ property_staff ============
-- Owner sees rows for their own properties; staff sees their own membership
-- rows across every property regardless of who owns it.
create policy "property_staff_select" on public.property_staff
  for select using (
    public.is_owner_of_property(property_id)
    or staff_id = auth.uid()
  );

create policy "property_staff_insert_owner_only" on public.property_staff
  for insert with check (public.is_owner_of_property(property_id));

create policy "property_staff_update_owner_only" on public.property_staff
  for update using (public.is_owner_of_property(property_id));

create policy "property_staff_delete_owner_only" on public.property_staff
  for delete using (public.is_owner_of_property(property_id));

-- ============ tasks ============
-- Owner sees all tasks on their properties. Staff sees only tasks assigned to
-- them, and only on properties they're actually linked to (defense in depth).
create policy "tasks_select" on public.tasks
  for select using (
    public.is_owner_of_property(property_id)
    or (assigned_staff_id = auth.uid() and public.is_staff_on_property(property_id))
  );

create policy "tasks_insert_owner_only" on public.tasks
  for insert with check (public.is_owner_of_property(property_id));

create policy "tasks_update_owner" on public.tasks
  for update using (public.is_owner_of_property(property_id));

-- Staff can update (e.g. mark done) only their own assigned task on a property
-- they're linked to. Note RLS restricts rows, not columns — acceptable for a
-- prototype; tighten with a trigger or column grants later if needed.
create policy "tasks_update_staff_own" on public.tasks
  for update using (
    assigned_staff_id = auth.uid()
    and public.is_staff_on_property(property_id)
  );

-- ============ messages ============
-- Included for schema completeness; no UI built against this table yet.
create policy "messages_select" on public.messages
  for select using (
    (sender_id = auth.uid() or recipient_id = auth.uid())
    and (public.is_owner_of_property(property_id) or public.is_staff_on_property(property_id))
  );

create policy "messages_insert" on public.messages
  for insert with check (
    sender_id = auth.uid()
    and (public.is_owner_of_property(property_id) or public.is_staff_on_property(property_id))
  );
