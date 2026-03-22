export function handleSupabaseError(error: unknown, operation: string, path: string) {
  const message = error instanceof Error ? error.message : String(error);
  console.error(`Supabase Error [${operation}] ${path}:`, message);
}
