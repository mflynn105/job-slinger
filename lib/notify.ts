import { supabase } from './supabase';

export async function notify(
  userId: string,
  type: string,
  title: string,
  body: string,
  metadata: Record<string, any> = {}
) {
  // Insert notification row
  const { error: insertError } = await supabase
    .from('notifications')
    .insert({ user_id: userId, type, metadata, read: false });
  if (insertError) {
    console.error('Error inserting notification:', insertError);
  }

  // Invoke edge function to send push
  const { data, error: fnError } = await supabase.functions.invoke('send-push', {
    body: {
      user_id: userId,
      title,
      body,
      data: { type, ...metadata },
    },
  });
  if (fnError) {
    console.error('Error invoking send-push function:', fnError);
  }
  return data;
}
