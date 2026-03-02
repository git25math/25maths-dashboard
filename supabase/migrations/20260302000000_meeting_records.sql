-- Meeting Records table
create table if not exists meeting_records (
  id text primary key,
  title text not null,
  date text not null,
  duration int default 0,
  transcript text default '',
  ai_summary jsonb default '{}',
  category text not null default 'other',
  participants jsonb default '[]',
  status text not null default 'draft',
  created_at text not null default (now()::text)
);

-- RLS (anon full access, consistent with other tables)
alter table meeting_records enable row level security;

create policy "Allow anon select on meeting_records"
  on meeting_records for select to anon using (true);

create policy "Allow anon insert on meeting_records"
  on meeting_records for insert to anon with check (true);

create policy "Allow anon update on meeting_records"
  on meeting_records for update to anon using (true) with check (true);

create policy "Allow anon delete on meeting_records"
  on meeting_records for delete to anon using (true);
