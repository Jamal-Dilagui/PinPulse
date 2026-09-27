"use client";

import { motion } from "framer-motion";
import { RefreshCw, Settings, Sparkles, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useDashboardStore, DateRangePreset } from "@/lib/store/use-dashboard";
import { useSettingsStore } from "@/lib/store/use-settings";
import { useMemo } from "react";

interface DashboardHeaderProps {
  onOpenSettings: () => void;
}

const PRESETS: { value: DateRangePreset; label: string }[] = [
  { value: "7d", label: "Last 7 days" },
  { value: "14d", label: "Last 14 days" },
  { value: "30d", label: "Last 30 days" },
  { value: "90d", label: "Last 90 days" },
];

export function DashboardHeader({ onOpenSettings }: DashboardHeaderProps) {
  const { datePreset, setDatePreset, refresh, isLoading, lastUpdated } =
    useDashboardStore();
  const accounts = useSettingsStore((s) => s.accounts);
  const isLiveMode = useSettingsStore((s) => s.isLiveMode);
  const isConfigured = useSettingsStore((s) => s.isConfigured());

  const now = useMemo(() => {
    if (!lastUpdated) return "";
    return new Date(lastUpdated).toLocaleTimeString();
  }, [lastUpdated]);

  const handleRefresh = () => refresh(accounts);

  return (
    <header className="sticky top-0 z-30 border-b border-border/70 bg-background/80 backdrop-blur-xl">
      <div className="mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between gap-3">
          {/* Logo */}
          <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-2.5"
          >
            <div className="relative grid h-9 w-9 place-items-center rounded-xl bg-primary text-primary-foreground shadow-sm">
              <Sparkles className="h-5 w-5" />
            </div>
            <div className="leading-tight">
              <div className="text-base font-semibold tracking-tight">
                PinPulse
              </div>
              <div className="text-[11px] text-muted-foreground hidden sm:block">
                Pinterest Analytics Dashboard
              </div>
            </div>
          </motion.div>

          {/* Center controls */}
          <div className="hidden md:flex items-center gap-2">
            <Select
              value={datePreset}
              onValueChange={(v) => setDatePreset(v as DateRangePreset)}
            >
              <SelectTrigger className="w-[160px] h-9 bg-card">
                <SelectValue placeholder="Date range" />
              </SelectTrigger>
              <SelectContent>
                {PRESETS.map((p) => (
                  <SelectItem key={p.value} value={p.value}>
                    {p.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Badge
              variant="outline"
              className={`h-9 px-3 gap-1.5 rounded-lg ${
                isLiveMode
                  ? "border-emerald-200 bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:border-emerald-900 dark:text-emerald-300"
                  : "border-amber-200 bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:border-amber-900 dark:text-amber-300"
              }`}
            >
              <span className="relative flex h-2 w-2">
                <span
                  className={`absolute inline-flex h-full w-full rounded-full opacity-75 ${
                    isLiveMode
                      ? "animate-ping bg-emerald-400"
                      : "bg-amber-400"
                  }`}
                />
                <span
                  className={`relative inline-flex h-2 w-2 rounded-full ${
                    isLiveMode ? "bg-emerald-500" : "bg-amber-500"
                  }`}
                />
              </span>
              {isLiveMode ? "Live API" : "Demo Data"}
            </Badge>
          </div>

          {/* Right controls */}
          <div className="flex items-center gap-2">
            {now && (
              <div className="hidden lg:flex items-center gap-1.5 text-xs text-muted-foreground pr-2">
                <TrendingUp className="h-3.5 w-3.5" />
                Updated {now}
              </div>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefresh}
              disabled={isLoading}
              className="h-9 gap-1.5"
            >
              <RefreshCw
                className={`h-3.5 w-3.5 ${isLoading ? "animate-spin" : ""}`}
              />
              <span className="hidden sm:inline">Refresh</span>
            </Button>
            <Button
              size="sm"
              onClick={onOpenSettings}
              className="h-9 gap-1.5"
              variant={isConfigured ? "default" : "secondary"}
            >
              <Settings className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Settings</span>
              {!isConfigured && (
                <span className="ml-1 inline-flex h-1.5 w-1.5 rounded-full bg-amber-500" />
              )}
            </Button>
          </div>
        </div>

        {/* Mobile date range row */}
        <div className="md:hidden pb-3 flex items-center gap-2">
          <Select
            value={datePreset}
            onValueChange={(v) => setDatePreset(v as DateRangePreset)}
          >
            <SelectTrigger className="w-[160px] h-9 bg-card">
              <SelectValue placeholder="Date range" />
            </SelectTrigger>
            <SelectContent>
              {PRESETS.map((p) => (
                <SelectItem key={p.value} value={p.value}>
                  {p.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
    </header>
  );
}
