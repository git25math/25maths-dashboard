import { requireSupabase } from '../lib/supabase';

export async function uploadFile(file: File): Promise<string> {
  const supabase = requireSupabase();
  const path = `${Date.now()}_${file.name}`;
  const { error } = await supabase.storage
    .from('teaching-files')
    .upload(path, file);
  if (error) throw error;
  const { data } = supabase.storage
    .from('teaching-files')
    .getPublicUrl(path);
  return data.publicUrl;
}
