// supabase/functions/admin-get-users/index.ts
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

serve(async (req) => {
  // Create Supabase client with service role key
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  );

  // Get the current user session (JWT)
  const authHeader = req.headers.get('Authorization');
  const token = authHeader?.replace('Bearer ', '');

  if (!token) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
  }

  // Verify the JWT token and get the user info
  const {
    data: { user },
    error
  } = await supabase.auth.getUser(token);

  if (error || !user || user.role !== 'authenticated') {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
  }

  // You can add more logic here to check if the user is an admin
  // For now, we just allow all authenticated users (you can restrict it by user email if needed)

  const { data, error: usersError } = await supabase.from('users').select('id, email, status');

  if (usersError) {
    return new Response(JSON.stringify({ error: usersError.message }), { status: 400 });
  }

  return new Response(JSON.stringify({ users: data }), {
    headers: { 'Content-Type': 'application/json' }
  });
});
