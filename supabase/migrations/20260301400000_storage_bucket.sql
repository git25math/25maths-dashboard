-- Create public storage bucket for teaching files (PDFs, docs, etc.)
insert into storage.buckets (id, name, public)
values ('teaching-files', 'teaching-files', true)
on conflict (id) do nothing;

-- Allow anonymous users to read files
create policy "Public read access"
  on storage.objects for select
  using (bucket_id = 'teaching-files');

-- Allow anonymous users to upload files
create policy "Public upload access"
  on storage.objects for insert
  with check (bucket_id = 'teaching-files');

-- Allow anonymous users to delete their uploads
create policy "Public delete access"
  on storage.objects for delete
  using (bucket_id = 'teaching-files');
