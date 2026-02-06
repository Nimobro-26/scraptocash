import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface PriceRequest {
  categories: string[];
  weight: number;
}

interface PriceResponse {
  estimatedPrice: number;
  confidenceScore: number;
}

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Validate request method
    if (req.method !== 'POST') {
      return new Response(
        JSON.stringify({ error: 'Method not allowed' }),
        { status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get auth token from header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Missing authorization header' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Create Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } }
    });

    // Verify user is authenticated
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Parse and validate request body
    const body: PriceRequest = await req.json();
    
    // Validate categories
    const validCategories = ['paper', 'plastic', 'metal', 'ewaste'];
    if (!body.categories || !Array.isArray(body.categories) || body.categories.length === 0) {
      return new Response(
        JSON.stringify({ error: 'At least one category is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    for (const cat of body.categories) {
      if (!validCategories.includes(cat)) {
        return new Response(
          JSON.stringify({ error: `Invalid category: ${cat}` }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    }

    // Validate weight
    if (typeof body.weight !== 'number' || body.weight < 1 || body.weight > 50) {
      return new Response(
        JSON.stringify({ error: 'Weight must be between 1 and 50 kg' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Call database function to calculate price (server-side logic)
    const { data, error } = await supabase.rpc('calculate_scrap_price', {
      p_categories: body.categories,
      p_weight_kg: body.weight
    });

    if (error) {
      console.error('Price calculation error:', error);
      return new Response(
        JSON.stringify({ error: 'Failed to calculate price' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const result = data[0];
    const response: PriceResponse = {
      estimatedPrice: Number(result.estimated_price),
      confidenceScore: result.confidence_score
    };

    return new Response(
      JSON.stringify(response),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Unexpected error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
