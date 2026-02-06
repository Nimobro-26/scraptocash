-- Create enum for scrap categories
CREATE TYPE public.scrap_category AS ENUM ('paper', 'plastic', 'metal', 'ewaste');

-- Create enum for payment methods
CREATE TYPE public.payment_method AS ENUM ('upi', 'cash');

-- Create enum for transaction status
CREATE TYPE public.transaction_status AS ENUM ('pending', 'confirmed', 'completed', 'cancelled');

-- Create transactions table to store all scrap transactions
CREATE TABLE public.transactions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  transaction_id TEXT NOT NULL UNIQUE,
  categories scrap_category[] NOT NULL,
  weight_kg DECIMAL(5,2) NOT NULL CHECK (weight_kg >= 1 AND weight_kg <= 50),
  location TEXT NOT NULL,
  estimated_price DECIMAL(10,2) NOT NULL CHECK (estimated_price >= 0),
  confidence_score INTEGER NOT NULL CHECK (confidence_score >= 0 AND confidence_score <= 100),
  pickup_date DATE NOT NULL,
  pickup_time TEXT NOT NULL,
  pickup_type TEXT NOT NULL DEFAULT 'pickup' CHECK (pickup_type IN ('pickup', 'dropoff')),
  payment_method payment_method NOT NULL,
  status transaction_status NOT NULL DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;

-- RLS Policies for transactions table
CREATE POLICY "Users can view their own transactions"
ON public.transactions
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own transactions"
ON public.transactions
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own pending transactions"
ON public.transactions
FOR UPDATE
USING (auth.uid() = user_id AND status = 'pending');

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_transactions_updated_at
BEFORE UPDATE ON public.transactions
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create server-side price calculation function
CREATE OR REPLACE FUNCTION public.calculate_scrap_price(
  p_categories scrap_category[],
  p_weight_kg DECIMAL
)
RETURNS TABLE (
  estimated_price DECIMAL,
  confidence_score INTEGER
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_total_price DECIMAL := 0;
  v_category scrap_category;
  v_price_per_kg DECIMAL;
  v_category_count INTEGER;
  v_random_factor DECIMAL;
BEGIN
  -- Validate inputs
  IF p_weight_kg < 1 OR p_weight_kg > 50 THEN
    RAISE EXCEPTION 'Weight must be between 1 and 50 kg';
  END IF;
  
  IF array_length(p_categories, 1) IS NULL OR array_length(p_categories, 1) = 0 THEN
    RAISE EXCEPTION 'At least one category must be selected';
  END IF;
  
  v_category_count := array_length(p_categories, 1);
  
  -- Calculate price based on categories
  FOREACH v_category IN ARRAY p_categories
  LOOP
    CASE v_category
      WHEN 'paper' THEN v_price_per_kg := 15;
      WHEN 'plastic' THEN v_price_per_kg := 12;
      WHEN 'metal' THEN v_price_per_kg := 35;
      WHEN 'ewaste' THEN v_price_per_kg := 120;
    END CASE;
    
    v_total_price := v_total_price + (v_price_per_kg * (p_weight_kg / v_category_count));
  END LOOP;
  
  -- Add controlled randomness (0.9 to 1.1 factor)
  v_random_factor := 0.9 + (random() * 0.2);
  v_total_price := ROUND(v_total_price * v_random_factor);
  
  RETURN QUERY SELECT 
    v_total_price,
    (75 + floor(random() * 20 + 1))::INTEGER;
END;
$$;

-- Create function to generate secure transaction ID
CREATE OR REPLACE FUNCTION public.generate_transaction_id(p_prefix TEXT DEFAULT 'TXN')
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN p_prefix || UPPER(encode(gen_random_bytes(8), 'hex'));
END;
$$;