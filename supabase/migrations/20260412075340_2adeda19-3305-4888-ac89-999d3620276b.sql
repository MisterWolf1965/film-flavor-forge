CREATE TABLE public.tiktok_credentials (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  access_token TEXT NOT NULL,
  tiktok_user_id TEXT NOT NULL,
  token_expires_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.tiktok_credentials ENABLE ROW LEVEL SECURITY;

CREATE TRIGGER update_tiktok_credentials_updated_at
  BEFORE UPDATE ON public.tiktok_credentials
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();