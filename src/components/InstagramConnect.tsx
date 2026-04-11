import { useState, useEffect } from "react";
import { Instagram, CheckCircle, AlertCircle, Loader2, Key } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
  const [showManual, setShowManual] = useState(false);
  const [token, setToken] = useState("");
  const [igId, setIgId] = useState("");
  const [saving, setSaving] = useState(false);

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

  const handleSaveToken = async () => {
    if (!token.trim() || !igId.trim()) {
      toast({ title: "Missing fields", description: "Both token and IG Account ID are required.", variant: "destructive" });
      return;
    }
    setSaving(true);
    try {
      const { data, error } = await supabase.functions.invoke("save-instagram-token", {
        body: { accessToken: token.trim(), igAccountId: igId.trim() },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      toast({ title: "Instagram Connected! 🎉", description: "Token saved and verified successfully." });
      setShowManual(false);
      setToken("");
      setIgId("");
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
        <Loader2 className="w-3 h-3 animate-spin" /> Checking Instagram...
      </div>
    );
  }

  if (status?.connected && !showManual) {
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
          <span className="text-xs font-mono text-muted-foreground">Paste Instagram credentials</span>
        </div>
        <Input
          placeholder="Page Access Token"
          value={token}
          onChange={(e) => setToken(e.target.value)}
          className="text-xs font-mono h-7"
          type="password"
        />
        <Input
          placeholder="IG Business Account ID"
          value={igId}
          onChange={(e) => setIgId(e.target.value)}
          className="text-xs font-mono h-7"
        />
        <div className="flex gap-2">
          <Button onClick={handleSaveToken} disabled={saving} size="sm" className="text-xs h-7 gap-1 font-mono">
            {saving ? <Loader2 className="w-3 h-3 animate-spin" /> : <Instagram className="w-3 h-3" />}
            {saving ? "Verifying..." : "Connect"}
          </Button>
          {(status?.connected) && (
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
