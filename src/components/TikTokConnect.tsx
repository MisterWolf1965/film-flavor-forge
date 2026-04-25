import { useState, useEffect } from "react";
import { CheckCircle, Loader2, Music, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { invokeSecureFunction } from "@/integrations/supabase/secureInvoke";
import { toast } from "@/hooks/use-toast";

interface TikTokStatus {
  connected: boolean;
  tiktokUserId?: string;
  expiresAt?: string;
}

const TIKTOK_CLIENT_KEY = import.meta.env.VITE_TIKTOK_CLIENT_KEY || "sbaw38iz0q3h0sm8ga";

export function TikTokConnect() {
  const [status, setStatus] = useState<TikTokStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [showCodeInput, setShowCodeInput] = useState(false);
  const [authCode, setAuthCode] = useState("");
  const [saving, setSaving] = useState(false);

  const checkStatus = async () => {
    setLoading(true);
    try {
      const { data, error } = await invokeSecureFunction<{
        connected: boolean;
        tiktokUserId?: string;
        expiresAt?: string;
      }>("tiktok-status");
      if (error || !data) {
        setStatus({ connected: false });
      } else {
        setStatus({
          connected: data.connected,
          tiktokUserId: data.tiktokUserId,
          expiresAt: data.expiresAt,
        });
      }
    } catch {
      setStatus({ connected: false });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkStatus();
  }, []);

  // Fixed redirect URI — must match TikTok Developer Portal exactly
  const redirectUri = import.meta.env.VITE_TIKTOK_REDIRECT_URI || `${window.location.origin}/auth/callback`;
  const tiktokAuthUrl = `https://www.tiktok.com/v2/auth/authorize/?client_key=${TIKTOK_CLIENT_KEY}&scope=user.info.basic,video.upload,video.publish&response_type=code&redirect_uri=${encodeURIComponent(redirectUri)}&state=tiktok_auth`;

  // Check URL for auth code on mount
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const code = params.get("code");
    const state = params.get("state");
    if (code && state === "tiktok_auth") {
      // Clean URL
      window.history.replaceState({}, "", window.location.pathname);
      handleExchangeCode(code);
    }
  }, []);

  const handleExchangeCode = async (code: string) => {
    setSaving(true);
    try {
      const { data, error } = await invokeSecureFunction<{
        error?: string;
        displayName?: string;
      }>("tiktok-oauth-callback", { body: { code, redirectUri } });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      toast({ title: "TikTok Connected! 🎵", description: `Logged in as ${data.displayName || "TikTok user"}` });
      setShowCodeInput(false);
      setAuthCode("");
      checkStatus();
    } catch (e) {
      toast({
        title: "Failed to connect TikTok",
        description: e instanceof Error ? e.message : "Unknown error",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleManualCodeSubmit = async () => {
    if (!authCode.trim()) {
      toast({
        title: "Missing code",
        description: "Paste the authorization code from TikTok.",
        variant: "destructive",
      });
      return;
    }
    await handleExchangeCode(authCode.trim());
  };

  if (loading) {
    return (
      <div className="flex items-center gap-2 text-xs text-muted-foreground font-mono">
        <Loader2 className="w-3 h-3 animate-spin" /> Checking TikTok...
      </div>
    );
  }

  if (saving) {
    return (
      <div className="flex items-center gap-2 text-xs text-muted-foreground font-mono">
        <Loader2 className="w-3 h-3 animate-spin" /> Connecting TikTok...
      </div>
    );
  }

  if (status?.connected && !showCodeInput) {
    return (
      <div className="flex items-center gap-2">
        <CheckCircle className="w-4 h-4 text-green-500" />
        <span className="text-xs font-mono text-muted-foreground">
          TikTok Connected
          {status.expiresAt && (
            <span className="ml-1 opacity-60">(expires {new Date(status.expiresAt).toLocaleDateString()})</span>
          )}
        </span>
        <Button
          onClick={() => setShowCodeInput(true)}
          variant="ghost"
          size="sm"
          className="text-[10px] h-6 px-2 font-mono"
        >
          Reconnect
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2 w-full max-w-md">
      <div className="flex items-center gap-2">
        <Music className="w-3 h-3 text-muted-foreground" />
        <span className="text-xs font-mono text-muted-foreground">Connect TikTok via OAuth</span>
      </div>

      <a
        href={tiktokAuthUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-1.5 text-xs font-mono text-primary hover:underline"
      >
        <ExternalLink className="w-3 h-3" />
        1. Authorize on TikTok
      </a>

      <p className="text-[10px] font-mono text-muted-foreground">
        2. After authorizing, you'll be redirected back automatically. If not, paste the code from the URL below:
      </p>

      <Input
        placeholder="Paste authorization code here (if not auto-detected)"
        value={authCode}
        onChange={(e) => setAuthCode(e.target.value)}
        className="text-xs font-mono h-7"
      />

      <div className="flex gap-2">
        <Button onClick={handleManualCodeSubmit} disabled={saving} size="sm" className="text-xs h-7 gap-1 font-mono">
          {saving ? <Loader2 className="w-3 h-3 animate-spin" /> : <Music className="w-3 h-3" />}
          {saving ? "Connecting..." : "Connect TikTok"}
        </Button>
        {status?.connected && (
          <Button onClick={() => setShowCodeInput(false)} variant="ghost" size="sm" className="text-xs h-7 font-mono">
            Cancel
          </Button>
        )}
      </div>
    </div>
  );
}
