import { useState, useEffect } from "react";
import { Instagram, CheckCircle, AlertCircle, Loader2, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

interface IgStatus {
  connected: boolean;
  expired?: boolean;
  igAccountId?: string;
  connectedAt?: string;
  expiresAt?: string;
}

export function InstagramConnect() {
  const [status, setStatus] = useState<IgStatus | null>(null);
  const [loading, setLoading] = useState(true);

  const checkStatus = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("instagram-status");
      if (error) throw error;
      setStatus(data as IgStatus);
    } catch {
      setStatus(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkStatus();

    // Check for OAuth redirect result
    const params = new URLSearchParams(window.location.search);
    const igStatus = params.get("ig_status");
    if (igStatus === "connected") {
      toast({ title: "Instagram Connected! 🎉", description: "Your Instagram account is now linked." });
      window.history.replaceState({}, "", window.location.pathname);
      checkStatus();
    } else if (igStatus === "error") {
      const reason = params.get("reason") || "Unknown error";
      toast({ title: "Connection Failed", description: reason, variant: "destructive" });
      window.history.replaceState({}, "", window.location.pathname);
    }
  }, []);

  const handleConnect = () => {
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    const redirectUri = `${supabaseUrl}/functions/v1/facebook-oauth-callback`;
    const appId = "1282009260538389"; // Public app ID, safe to include
    const scopes = "instagram_basic,instagram_content_publish,pages_show_list,pages_read_engagement";
    const authUrl = `https://www.facebook.com/v19.0/dialog/oauth?client_id=${appId}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=${scopes}&response_type=code`;
    window.location.href = authUrl;
  };

  if (loading) {
    return (
      <div className="flex items-center gap-2 text-xs text-muted-foreground font-mono">
        <Loader2 className="w-3 h-3 animate-spin" /> Checking Instagram...
      </div>
    );
  }

  if (status?.connected) {
    return (
      <div className="flex items-center gap-2">
        <CheckCircle className="w-4 h-4 text-green-500" />
        <span className="text-xs font-mono text-muted-foreground">
          IG Connected
          {status.expiresAt && (
            <span className="ml-1 opacity-60">
              (expires {new Date(status.expiresAt).toLocaleDateString()})
            </span>
          )}
        </span>
        <Button onClick={handleConnect} variant="ghost" size="sm" className="text-[10px] h-6 px-2 font-mono">
          Reconnect
        </Button>
      </div>
    );
  }

  if (status?.expired) {
    return (
      <div className="flex items-center gap-2">
        <AlertCircle className="w-4 h-4 text-destructive" />
        <span className="text-xs font-mono text-destructive">Token expired</span>
        <Button onClick={handleConnect} variant="outline" size="sm" className="text-xs h-7 gap-1 font-mono">
          <Instagram className="w-3 h-3" /> Reconnect
        </Button>
      </div>
    );
  }

  return (
    <Button onClick={handleConnect} variant="outline" size="sm" className="text-xs h-7 gap-2 font-mono">
      <Instagram className="w-3 h-3" /> Connect Instagram
    </Button>
  );
}
