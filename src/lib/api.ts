import { supabase } from "@/integrations/supabase/client";

export interface PriceCalculationRequest {
  categories: string[];
  weight: number;
}

export interface PriceCalculationResponse {
  estimatedPrice: number;
  confidenceScore: number;
}

export interface CreateTransactionRequest {
  categories: string[];
  weight: number;
  location: string;
  pickupDate: string;
  pickupTime: string;
  pickupType: 'pickup' | 'dropoff';
  paymentMethod: 'upi' | 'cash';
  otp?: string;
}

export interface CreateTransactionResponse {
  transactionId: string;
  estimatedPrice: number;
  status: string;
}

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;

/**
 * Calculate scrap price using server-side logic
 * Prevents client-side price manipulation
 */
export async function calculatePrice(request: PriceCalculationRequest): Promise<PriceCalculationResponse> {
  const { data: { session } } = await supabase.auth.getSession();
  
  if (!session) {
    throw new Error('User must be authenticated');
  }

  const response = await fetch(`${SUPABASE_URL}/functions/v1/calculate-price`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${session.access_token}`,
    },
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to calculate price');
  }

  return response.json();
}

/**
 * Create a transaction with server-side validation
 * All business logic is executed server-side
 */
export async function createTransaction(request: CreateTransactionRequest): Promise<CreateTransactionResponse> {
  const { data: { session } } = await supabase.auth.getSession();
  
  if (!session) {
    throw new Error('User must be authenticated');
  }

  const response = await fetch(`${SUPABASE_URL}/functions/v1/create-transaction`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${session.access_token}`,
    },
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to create transaction');
  }

  return response.json();
}

/**
 * Fetch user's transactions from the database
 */
export async function getUserTransactions() {
  const { data, error } = await supabase
    .from('transactions')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  return data;
}

/**
 * Get a specific transaction by ID
 */
export async function getTransaction(transactionId: string) {
  const { data, error } = await supabase
    .from('transactions')
    .select('*')
    .eq('transaction_id', transactionId)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  return data;
}
