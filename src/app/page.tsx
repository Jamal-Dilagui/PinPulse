"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { WinningAccountBanner } from "@/components/dashboard/winning-account-banner";
import { MetricWinnerGrid } from "@/components/dashboard/metric-winner-grid";
import { KpiSummaryGrid } from "@/components/dashboard/kpi-summary-grid";
import { PerformanceChart } from "@/components/dashboard/performance-chart";
import { AccountsTable } from "@/components/dashboard/accounts-table";
import { TopPins } from "@/components/dashboard/top-pins";
import { SettingsDialog } from "@/components/settings/settings-dialog";
import { PrivacyDialog } from "@/components/settings/privacy-dialog";
import { Shield } from "lucide-react";
import { useDashboardStore } from "@/lib/store/use-dashboard";
import { useSettingsStore } from "@/lib/store/use-settings";

export default function Home() {
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [privacyOpen, setPrivacyOpen] = useState(false);
  const data = useDashboardStore((s) => s.data);
  const isLoading = useDashboardStore((s) => s.isLoading);
  const refresh = useDashboardStore((s) => s.refresh);
  const datePreset = useDashboardStore((s) => s.datePreset);
  const accounts = useSettingsStore((s) => s.accounts);
  const isConfigured = useSettingsStore((s) => s.isConfigured());

  // Initial load + refresh on date preset / accounts change
  useEffect(() => {
    refresh(accounts);
  }, [refresh, accounts, datePreset]);

  // First-run prompt
  useEffect(() => {
    if (!isConfigured) {
      const t = setTimeout(() => setSettingsOpen(true), 1200);
      return () => clearTimeout(t);
    }
  }, [isConfigured]);

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <DashboardHeader onOpenSettings={() => setSettingsOpen(true)} />

      <main className="flex-1 mx-auto w-full max-w-[1400px] px-4 sm:px-6 lg:px-8 py-5 sm:py-6 space-y-5 sm:space-y-6">
        {/* Section: Winning account */}
        <section className="animate-fade-up">
          <WinningAccountBanner data={data} />
        </section>

        {/* Section: Per-metric winners */}
        <section className="animate-fade-up" style={{ animationDelay: "60ms" }}>
          <SectionHeading
            title="Today's Metric Winners"
            subtitle="Best performing account per metric · the winning account is crowned by Outbound Clicks"
          />
          <div className="mt-3">
            <MetricWinnerGrid data={data} />
          </div>
        </section>

        {/* Section: KPI summary */}
        <section className="animate-fade-up" style={{ animationDelay: "120ms" }}>
          <SectionHeading
            title="Today's Totals"
            subtitle="Aggregate performance across all linked accounts"
          />
          <div className="mt-3">
            <KpiSummaryGrid data={data} />
          </div>
        </section>

        {/* Section: Performance chart */}
        <section className="animate-fade-up" style={{ animationDelay: "180ms" }}>
          <PerformanceChart data={data} />
        </section>

        {/* Section: Accounts table + Top pins */}
        <section
          className="grid grid-cols-1 xl:grid-cols-5 gap-5 sm:gap-6 animate-fade-up"
          style={{ animationDelay: "240ms" }}
        >
          <div className="xl:col-span-3">
            <AccountsTable data={data} />
          </div>
          <div className="xl:col-span-2">
            <TopPins data={data} />
          </div>
        </section>
      </main>

      <footer className="mt-auto border-t border-border/70 bg-card/40">
        <div className="mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-8 py-4 flex flex-col sm:flex-row items-center justify-between gap-2 text-[11px] text-muted-foreground">
          <div className="flex items-center gap-1.5">
            <span className="font-medium text-foreground">PinPulse</span>
            <span>·</span>
            <span>Pinterest Analytics Dashboard</span>
          </div>
          <div className="flex items-center gap-3 flex-wrap justify-center">
            {data && (
              <span>
                Range: {data.dateRange.from} → {data.dateRange.to}
              </span>
            )}
            <span className="hidden sm:inline">·</span>
            <span>
              {data?.accounts.length ?? 0} account
              {(data?.accounts.length ?? 0) === 1 ? "" : "s"} tracked
            </span>
            <span className="hidden sm:inline">·</span>
            <button
              onClick={() => setPrivacyOpen(true)}
              className="inline-flex items-center gap-1 font-medium text-foreground hover:text-primary transition-colors"
            >
              <Shield className="h-3 w-3" />
              Confidentialité
            </button>
          </div>
        </div>
      </footer>

      <SettingsDialog open={settingsOpen} onOpenChange={setSettingsOpen} />
      <PrivacyDialog open={privacyOpen} onOpenChange={setPrivacyOpen} />

      {/* Loading overlay (subtle) */}
      {isLoading && !data && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 grid place-items-center bg-background/60 backdrop-blur-sm"
        >
          <div className="flex flex-col items-center gap-2">
            <div className="h-8 w-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
            <div className="text-sm text-muted-foreground">
              Loading analytics…
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}

function SectionHeading({
  title,
  subtitle,
}: {
  title: string;
  subtitle?: string;
}) {
  return (
    <div>
      <h2 className="text-base font-semibold text-foreground tracking-tight">
        {title}
      </h2>
      {subtitle && (
        <p className="text-xs text-muted-foreground mt-0.5">{subtitle}</p>
      )}
    </div>
  );
}
