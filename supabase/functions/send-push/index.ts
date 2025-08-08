import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.0.0";

serve(async (req) => {
  const { user_id, title, body, data } = await req.json();

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  );

  // Fetch Expo push tokens for this user
  const { data: rows, error } = await supabase
    .from('user_devices')
    .select('expo_push_token')
    .eq('user_id', user_id);

  if (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }

  const tokens = rows?.map((r: any) => r.expo_push_token) ?? [];

  if (tokens.length === 0) {
    return new Response(JSON.stringify({ message: 'No device tokens' }), { status: 200 });
  }

  // Build Expo push messages
  const messages = tokens.map((token: string) => ({
    to: token,
    sound: 'default',
    title,
    body,
    data,
  }));

  const expoRes = await fetch('https://exp.host/--/api/v2/push/send', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(messages),
  });

  const expoData = await expoRes.json();

  return new Response(JSON.stringify({ sent: true, expo: expoData }), { status: 200 });
});
