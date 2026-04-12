import { useState, useEffect } from "react";
import { CheckCircle, Loader2, Key, Music } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

interface TikTokStatus {
  connected: boolean;
  tiktokUserId?: string;
  expiresAt?: string;
}

export function TikTokConnect() {
  const [status, setStatus] = useState<TikTokStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [showManual, setShowManual] = useState(false);
  const [token, setToken] = useState("");
  const [userId, setUserId] = useState("");
  const [saving, setSaving] = useState(false);

  const checkStatus = async () => {
    setLoading(true);
    try {
      // Check tiktok_credentials table via edge function or direct query
      // For now we'll use a simple approach - try to read from the save function
      const { data, error } = await supabase
        .from("tiktok_credentials" as any)
        .select("tiktok_user_id, token_expires_at")
        .limit(1)
        .maybeSingle();

      if (error || !data) {
        setStatus({ connected: false });
      } else {
        const d = data as any;
        const expired = d.token_expires_at ? new Date(d.token_expires_at) < new Date() : false;
        setStatus({
          connected: !expired,
          tiktokUserId: d.tiktok_user_id,
          expiresAt: d.token_expires_at,
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

  const handleSaveToken = async () => {
    if (!token.trim() || !userId.trim()) {
      toast({ title: "Missing fields", description: "Both token and TikTok User ID are required.", variant: "destructive" });
      return;
    }
    setSaving(true);
    try {
      const { data, error } = await supabase.functions.invoke("save-tiktok-token", {
        body: { accessToken: token.trim(), tiktokUserId: userId.trim() },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      toast({ title: "TikTok Connected! 🎵", description: "Token saved and verified." });
      setShowManual(false);
      setToken("");
      setUserId("");
      checkStatus();
    } catch (e) {
      toast({ title: "Failed to save", description: e instanceof Error ? e.message : "Unknown error", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center gap-2 text-xs text-muted-foreground font-mono">
        <Loader2 className="w-3 h-3 animate-spin" /> Checking TikTok...
      </div>
    );
  }

  if (status?.connected && !showManual) {
    return (
      <div className="flex items-center gap-2">
        <CheckCircle className="w-4 h-4 text-green-500" />
        <span className="text-xs font-mono text-muted-foreground">
          TikTok Connected
          {status.expiresAt && (
            <span className="ml-1 opacity-60">
              (expires {new Date(status.expiresAt).toLocaleDateString()})
            </span>
          )}
        </span>
        <Button onClick={() => setShowManual(true)} variant="ghost" size="sm" className="text-[10px] h-6 px-2 font-mono">
          Update Token
        </Button>
      </div>
    );
  }

  if (showManual || !status?.connected) {
    return (
      <div className="flex flex-col gap-2 w-full max-w-md">
        <div className="flex items-center gap-2">
          <Key className="w-3 h-3 text-muted-foreground" />
          <span className="text-xs font-mono text-muted-foreground">Paste TikTok credentials</span>
        </div>
        <Input
          placeholder="TikTok Access Token"
          value={token}
          onChange={(e) => setToken(e.target.value)}
          className="text-xs font-mono h-7"
          type="password"
        />
        <Input
          placeholder="TikTok Open ID / User ID"
          value={userId}
          onChange={(e) => setUserId(e.target.value)}
          className="text-xs font-mono h-7"
        />
        <div className="flex gap-2">
          <Button onClick={handleSaveToken} disabled={saving} size="sm" className="text-xs h-7 gap-1 font-mono">
            {saving ? <Loader2 className="w-3 h-3 animate-spin" /> : <Music className="w-3 h-3" />}
            {saving ? "Verifying..." : "Connect TikTok"}
          </Button>
          {status?.connected && (
            <Button onClick={() => setShowManual(false)} variant="ghost" size="sm" className="text-xs h-7 font-mono">
              Cancel
            </Button>
          )}
        </div>
      </div>
    );
  }

  return null;
}
