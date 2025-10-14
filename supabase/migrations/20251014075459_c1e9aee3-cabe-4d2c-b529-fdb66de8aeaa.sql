-- Tabela para armazenar tokens de API para integrações externas (n8n, etc)
CREATE TABLE public.api_tokens (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  token text NOT NULL UNIQUE,
  name text NOT NULL,
  description text,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  last_used_at timestamp with time zone,
  created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL
);

-- Enable RLS
ALTER TABLE public.api_tokens ENABLE ROW LEVEL SECURITY;

-- Apenas admins podem gerenciar tokens
CREATE POLICY "Only authenticated users can view tokens"
  ON public.api_tokens
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Only authenticated users can create tokens"
  ON public.api_tokens
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Only authenticated users can update tokens"
  ON public.api_tokens
  FOR UPDATE
  TO authenticated
  USING (true);

CREATE POLICY "Only authenticated users can delete tokens"
  ON public.api_tokens
  FOR DELETE
  TO authenticated
  USING (true);

-- Criar índice para busca rápida por token
CREATE INDEX idx_api_tokens_token ON public.api_tokens(token) WHERE is_active = true;

-- Função helper para validar token
CREATE OR REPLACE FUNCTION public.validate_api_token(token_value text)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  token_id uuid;
BEGIN
  -- Busca e atualiza last_used_at
  UPDATE public.api_tokens
  SET last_used_at = now()
  WHERE token = token_value
    AND is_active = true
  RETURNING id INTO token_id;
  
  RETURN token_id;
END;
$$;