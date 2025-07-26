// supabase/functions/_shared/cors.ts
export const corsHeaders = {
    "Access-Control-Allow-Origin": "*", // Change to your domain for production
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  };
  