import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface TransactionRequest {
  categories: string[];
  weight: number;
  location: string;
  pickupDate: string;
  pickupTime: string;
  pickupType: 'pickup' | 'dropoff';
  paymentMethod: 'upi' | 'cash';
  otp?: string; // Required for UPI payments
}

interface TransactionResponse {
  transactionId: string;
  estimatedPrice: number;
  status: string;
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

    // Create Supabase client with service role for transaction creation
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')!;
    
    // User client for auth verification
    const userClient = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } }
    });

    // Verify user is authenticated
    const { data: { user }, error: authError } = await userClient.auth.getUser();
    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Parse and validate request body
    const body: TransactionRequest = await req.json();
    
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

    // Validate location
    if (!body.location || typeof body.location !== 'string' || body.location.length < 5 || body.location.length > 200) {
      return new Response(
        JSON.stringify({ error: 'Location must be between 5 and 200 characters' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Validate pickup date
    const pickupDate = new Date(body.pickupDate);
    if (isNaN(pickupDate.getTime())) {
      return new Response(
        JSON.stringify({ error: 'Invalid pickup date' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Validate pickup time
    if (!body.pickupTime || typeof body.pickupTime !== 'string') {
      return new Response(
        JSON.stringify({ error: 'Pickup time is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Validate pickup type
    if (!['pickup', 'dropoff'].includes(body.pickupType)) {
      return new Response(
        JSON.stringify({ error: 'Invalid pickup type' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Validate payment method
    if (!['upi', 'cash'].includes(body.paymentMethod)) {
      return new Response(
        JSON.stringify({ error: 'Invalid payment method' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // For UPI payments, validate OTP (simulated server-side verification)
    if (body.paymentMethod === 'upi') {
      if (!body.otp || !/^\d{4}$/.test(body.otp)) {
        return new Response(
          JSON.stringify({ error: 'Valid 4-digit OTP is required for UPI payments' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      // In a real app, this would verify against an OTP service
      // For demo, we accept any valid 4-digit OTP
    }

    // Use service role client for database operations
    const adminClient = createClient(supabaseUrl, supabaseServiceKey);

    // Calculate price server-side
    const { data: priceData, error: priceError } = await adminClient.rpc('calculate_scrap_price', {
      p_categories: body.categories,
      p_weight_kg: body.weight
    });

    if (priceError || !priceData || priceData.length === 0) {
      console.error('Price calculation error:', priceError);
      return new Response(
        JSON.stringify({ error: 'Failed to calculate price' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const priceResult = priceData[0];

    // Generate secure transaction ID server-side
    const prefix = body.paymentMethod === 'upi' ? 'TXN' : 'COD';
    const { data: txnIdData, error: txnIdError } = await adminClient.rpc('generate_transaction_id', {
      p_prefix: prefix
    });

    if (txnIdError || !txnIdData) {
      console.error('Transaction ID generation error:', txnIdError);
      return new Response(
        JSON.stringify({ error: 'Failed to generate transaction ID' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Insert transaction record
    const { data: transaction, error: insertError } = await adminClient
      .from('transactions')
      .insert({
        user_id: user.id,
        transaction_id: txnIdData,
        categories: body.categories,
        weight_kg: body.weight,
        location: body.location,
        estimated_price: priceResult.estimated_price,
        confidence_score: priceResult.confidence_score,
        pickup_date: body.pickupDate,
        pickup_time: body.pickupTime,
        pickup_type: body.pickupType,
        payment_method: body.paymentMethod,
        status: 'confirmed'
      })
      .select()
      .single();

    if (insertError) {
      console.error('Transaction insert error:', insertError);
      return new Response(
        JSON.stringify({ error: 'Failed to create transaction' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const response: TransactionResponse = {
      transactionId: transaction.transaction_id,
      estimatedPrice: Number(transaction.estimated_price),
      status: transaction.status
    };

    return new Response(
      JSON.stringify(response),
      { status: 201, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Unexpected error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
