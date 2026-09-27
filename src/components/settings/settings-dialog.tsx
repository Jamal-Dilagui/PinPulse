"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import {
  KeyRound,
  UserPlus,
  Trash2,
  ExternalLink,
  CheckCircle2,
  AlertCircle,
  RefreshCcw,
  Eye,
  EyeOff,
  Info,
  Users,
  SlidersHorizontal,
} from "lucide-react";
import { useSettingsStore } from "@/lib/store/use-settings";
import { useDashboardStore } from "@/lib/store/use-dashboard";
import { PinterestAccount } from "@/lib/pinterest/types";

interface SettingsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function SettingsDialog({ open, onOpenChange }: SettingsDialogProps) {
  // remount the inner form each time the dialog opens so it re-initialises from
  // the latest persisted settings without needing setState-in-useEffect.
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl gap-0 p-0 overflow-hidden">
        {open ? <SettingsForm onDone={() => onOpenChange(false)} /> : null}
      </DialogContent>
    </Dialog>
  );
}

function SettingsForm({ onDone }: { onDone: () => void }) {
  const settings = useSettingsStore();
  const refresh = useDashboardStore((s) => s.refresh);

  const [tab, setTab] = useState("api");
  const [showSecret, setShowSecret] = useState(false);
  const [apiKey, setApiKey] = useState(settings.apiKey);
  const [apiSecret, setApiSecret] = useState(settings.apiSecret);
  const [appId, setAppId] = useState(settings.appId);
  const [liveMode, setLiveMode] = useState(settings.isLiveMode);
  const [refreshInterval, setRefreshInterval] = useState(
    String(settings.refreshInterval)
  );
  const [defaultDays, setDefaultDays] = useState(
    String(settings.defaultDateRangeDays)
  );
  const [newUsername, setNewUsername] = useState("");
  const [newDisplay, setNewDisplay] = useState("");

  const handleSaveApi = () => {
    if (liveMode && (!apiKey.trim() || !appId.trim())) {
      toast.error("Live API mode requires both API Key and App ID.");
      return;
    }
    settings.setApiKey(apiKey.trim());
    settings.setApiSecret(apiSecret.trim());
    settings.setAppId(appId.trim());
    settings.setLiveMode(liveMode);
    settings.setRefreshInterval(Number(refreshInterval) || 60);
    settings.setDefaultDateRangeDays(Number(defaultDays) || 30);
    toast.success("Settings saved.");
    refresh(settings.accounts);
    onDone();
  };

  const handleAddAccount = () => {
    const username = newUsername.trim().replace(/^@/, "");
    if (!username) {
      toast.error("Username is required.");
      return;
    }
    if (settings.accounts.some((a) => a.username === username)) {
      toast.error("This account already exists.");
      return;
    }
    const palette = ["#E60023", "#8B5CF6", "#10B981", "#F59E0B", "#0EA5E9", "#EC4899"];
    const color = palette[settings.accounts.length % palette.length];
    const initials = (newDisplay.trim() || username).slice(0, 2).toUpperCase();
    const account: PinterestAccount = {
      id: `acc_${Date.now()}`,
      username,
      displayName: newDisplay.trim() || username,
      avatarColor: color,
      avatarInitials: initials,
      followers: 0,
      boards: 0,
      pins: 0,
      isLinked: false,
    };
    settings.addAccount(account);
    setNewUsername("");
    setNewDisplay("");
    toast.success(`@${username} added.`);
    refresh([...settings.accounts, account]);
  };

  const handleRemove = (id: string, username: string) => {
    settings.removeAccount(id);
    toast.success(`@${username} removed.`);
    refresh(settings.accounts.filter((a) => a.id !== id));
  };

  const handleReset = () => {
    settings.reset();
    toast.info("Settings reset to demo defaults.");
    setTimeout(() => refresh(settings.accounts), 100);
  };

  return (
    <>
      <DialogHeader className="px-6 pt-6 pb-4 border-b border-border">
        <DialogTitle className="flex items-center gap-2 text-lg">
          <SlidersHorizontal className="h-5 w-5 text-primary" />
          Dashboard Settings
        </DialogTitle>
        <DialogDescription>
          Configure your Pinterest API credentials, manage accounts and tune
          refresh behaviour.
        </DialogDescription>
      </DialogHeader>

      <Tabs value={tab} onValueChange={setTab} className="w-full">
        <div className="px-6 pt-4">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="api" className="gap-1.5">
              <KeyRound className="h-3.5 w-3.5" /> API
            </TabsTrigger>
            <TabsTrigger value="accounts" className="gap-1.5">
              <Users className="h-3.5 w-3.5" /> Accounts
            </TabsTrigger>
            <TabsTrigger value="preferences" className="gap-1.5">
              <SlidersHorizontal className="h-3.5 w-3.5" /> Preferences
            </TabsTrigger>
          </TabsList>
        </div>

        {/* API TAB */}
        <TabsContent
          value="api"
          className="p-6 pt-4 space-y-4 m-0 max-h-[60vh] overflow-y-auto scrollbar-thin"
        >
          <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-xs text-amber-800 dark:bg-amber-950/30 dark:border-amber-900 dark:text-amber-200">
            <div className="flex items-start gap-2">
              <Info className="h-4 w-4 shrink-0 mt-0.5" />
              <div>
                <div className="font-medium mb-0.5">
                  How to get Pinterest API credentials
                </div>
                <div className="text-[11px] leading-relaxed">
                  1. Go to{" "}
                  <a
                    href="https://developers.pinterest.com/"
                    target="_blank"
                    rel="noreferrer noopener"
                    className="underline font-medium inline-flex items-center gap-0.5"
                  >
                    developers.pinterest.com{" "}
                    <ExternalLink className="h-3 w-3" />
                  </a>{" "}
                  and sign in.
                  <br />
                  2. Create an app — copy the <strong>App ID</strong>.
                  <br />
                  3. Generate an access token with scopes{" "}
                  <code className="rounded bg-amber-100 px-1 dark:bg-amber-900/50">
                    user_accounts:read
                  </code>{" "}
                  and{" "}
                  <code className="rounded bg-amber-100 px-1 dark:bg-amber-900/50">
                    pins:read
                  </code>
                  .
                  <br />
                  4. Paste the values below.
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="api-key" className="text-xs">
                Access Token / API Key
              </Label>
              <Input
                id="api-key"
                type="password"
                placeholder="pina_xxxxxxxx..."
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                className="font-mono text-xs"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="app-id" className="text-xs">
                App ID
              </Label>
              <Input
                id="app-id"
                placeholder="1234567"
                value={appId}
                onChange={(e) => setAppId(e.target.value)}
                className="font-mono text-xs"
              />
            </div>
            <div className="space-y-1.5 sm:col-span-2">
              <Label htmlFor="api-secret" className="text-xs">
                App Secret (optional)
              </Label>
              <div className="relative">
                <Input
                  id="api-secret"
                  type={showSecret ? "text" : "password"}
                  placeholder="App secret..."
                  value={apiSecret}
                  onChange={(e) => setApiSecret(e.target.value)}
                  className="font-mono text-xs pr-9"
                />
                <button
                  type="button"
                  onClick={() => setShowSecret((v) => !v)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showSecret ? (
                    <EyeOff className="h-3.5 w-3.5" />
                  ) : (
                    <Eye className="h-3.5 w-3.5" />
                  )}
                </button>
              </div>
            </div>
          </div>

          <Separator />

          <div className="flex items-start justify-between gap-3 rounded-lg border border-border p-3">
            <div>
              <div className="text-sm font-medium flex items-center gap-1.5">
                Live API mode
                {liveMode ? (
                  <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100 dark:bg-emerald-950/40 dark:text-emerald-300 text-[10px]">
                    Live
                  </Badge>
                ) : (
                  <Badge variant="outline" className="text-[10px]">
                    Demo
                  </Badge>
                )}
              </div>
              <div className="text-[11px] text-muted-foreground mt-0.5">
                {liveMode
                  ? "Dashboard pulls real data from Pinterest. Requires valid credentials."
                  : "Dashboard shows realistic demo data. Safe to explore."}
              </div>
            </div>
            <Switch checked={liveMode} onCheckedChange={setLiveMode} />
          </div>

          <div className="flex items-center gap-2 text-xs">
            {apiKey.trim() && appId.trim() ? (
              <span className="inline-flex items-center gap-1 text-emerald-600">
                <CheckCircle2 className="h-3.5 w-3.5" />
                Credentials provided
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 text-muted-foreground">
                <AlertCircle className="h-3.5 w-3.5" />
                No credentials yet — demo data will be used
              </span>
            )}
          </div>
        </TabsContent>

        {/* ACCOUNTS TAB */}
        <TabsContent
          value="accounts"
          className="p-6 pt-4 space-y-4 m-0 max-h-[60vh] overflow-y-auto scrollbar-thin"
        >
          <div className="rounded-lg border border-border p-3 space-y-3">
            <div className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
              <UserPlus className="h-3.5 w-3.5" /> Add Pinterest account
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-[1fr_1fr_auto] gap-2">
              <Input
                placeholder="@username"
                value={newUsername}
                onChange={(e) => setNewUsername(e.target.value)}
                className="text-sm"
              />
              <Input
                placeholder="Display name"
                value={newDisplay}
                onChange={(e) => setNewDisplay(e.target.value)}
                className="text-sm"
              />
              <Button onClick={handleAddAccount} size="sm" className="h-9">
                Add
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <div className="text-xs font-medium text-muted-foreground">
              Linked accounts ({settings.accounts.length})
            </div>
            {settings.accounts.length === 0 ? (
              <div className="rounded-lg border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
                No accounts yet. Add one above.
              </div>
            ) : (
              <div className="space-y-2">
                {settings.accounts.map((a) => (
                  <div
                    key={a.id}
                    className="flex items-center gap-3 rounded-lg border border-border p-2.5"
                  >
                    <div
                      className="grid h-9 w-9 shrink-0 place-items-center rounded-full text-xs font-semibold text-white"
                      style={{
                        background: `linear-gradient(135deg, ${a.avatarColor}, ${a.avatarColor}cc)`,
                      }}
                    >
                      {a.avatarInitials}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="text-sm font-medium truncate">
                        {a.displayName}
                      </div>
                      <div className="text-[11px] text-muted-foreground truncate">
                        @{a.username}
                        {a.isLinked && (
                          <span className="ml-1.5 text-emerald-600">
                            · linked
                          </span>
                        )}
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemove(a.id, a.username)}
                      className="h-8 text-muted-foreground hover:text-destructive"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </TabsContent>

        {/* PREFERENCES TAB */}
        <TabsContent
          value="preferences"
          className="p-6 pt-4 space-y-4 m-0 max-h-[60vh] overflow-y-auto scrollbar-thin"
        >
          <div className="space-y-1.5">
            <Label htmlFor="refresh" className="text-xs">
              Auto-refresh interval (seconds)
            </Label>
            <Select value={refreshInterval} onValueChange={setRefreshInterval}>
              <SelectTrigger id="refresh" className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="30">Every 30s</SelectItem>
                <SelectItem value="60">Every 1 min</SelectItem>
                <SelectItem value="300">Every 5 min</SelectItem>
                <SelectItem value="900">Every 15 min</SelectItem>
                <SelectItem value="0">Off (manual only)</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-[11px] text-muted-foreground">
              How often the dashboard fetches fresh data.
            </p>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="default-days" className="text-xs">
              Default date range (days)
            </Label>
            <Select value={defaultDays} onValueChange={setDefaultDays}>
              <SelectTrigger id="default-days" className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7">Last 7 days</SelectItem>
                <SelectItem value="14">Last 14 days</SelectItem>
                <SelectItem value="30">Last 30 days</SelectItem>
                <SelectItem value="90">Last 90 days</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-[11px] text-muted-foreground">
              Initial range loaded on dashboard open.
            </p>
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm font-medium">Reset to defaults</div>
              <div className="text-[11px] text-muted-foreground">
                Clears API key and restores demo accounts.
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleReset}
              className="gap-1.5"
            >
              <RefreshCcw className="h-3.5 w-3.5" />
              Reset
            </Button>
          </div>
        </TabsContent>
      </Tabs>

      <DialogFooter className="px-6 py-4 border-t border-border bg-muted/30">
        <Button variant="outline" onClick={onDone}>
          Cancel
        </Button>
        <Button onClick={handleSaveApi}>Save changes</Button>
      </DialogFooter>
    </>
  );
}
