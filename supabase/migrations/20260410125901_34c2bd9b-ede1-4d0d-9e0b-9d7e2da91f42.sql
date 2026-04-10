CREATE TABLE public.instagram_credentials (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  access_token TEXT NOT NULL,
  instagram_account_id TEXT NOT NULL,
  facebook_user_id TEXT,
  token_expires_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS - no public policies means only service_role can access
ALTER TABLE public.instagram_credentials ENABLE ROW LEVEL SECURITY;

-- Trigger for updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_instagram_credentials_updated_at
  BEFORE UPDATE ON public.instagram_credentials
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();