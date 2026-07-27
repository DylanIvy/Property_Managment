alter table public.tasks
  add column recurrence_interval text
  check (recurrence_interval in ('daily', 'weekly', 'biweekly', 'monthly'));
