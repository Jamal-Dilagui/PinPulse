"use client";

import { motion } from "framer-motion";
import { Crown, MousePointerClick, TrendingUp, TrendingDown } from "lucide-react";
import { DashboardData } from "@/lib/pinterest/types";
import { getOverallWinner, formatFullNumber, formatPct } from "@/lib/pinterest/analytics";
import { METRIC_MAP } from "@/lib/pinterest/types";

interface WinningAccountBannerProps {
  data: DashboardData | null;
}

export function WinningAccountBanner({ data }: WinningAccountBannerProps) {
  const winner = getOverallWinner(data);

  if (!winner) {
    return (
      <div className="rounded-2xl border border-dashed border-border bg-card/50 p-6 text-center text-sm text-muted-foreground">
        No data yet — add your Pinterest accounts in Settings to see today&apos;s
        winning account.
      </div>
    );
  }

  const metricMeta = METRIC_MAP[winner.metric];
  const isUp = winner.change >= 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12, scale: 0.99 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className="relative overflow-hidden rounded-2xl border border-primary/30 bg-gradient-to-br from-primary/10 via-card to-card p-5 sm:p-6 shadow-sm animate-win-pulse"
    >
      {/* Decorative blobs */}
      <div className="pointer-events-none absolute -top-12 -right-12 h-44 w-44 rounded-full bg-primary/10 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-16 -left-10 h-40 w-40 rounded-full bg-amber-300/15 blur-3xl" />

      <div className="relative flex flex-col lg:flex-row lg:items-center gap-5">
        {/* Crown + label */}
        <div className="flex items-start gap-4 lg:min-w-[280px]">
          <div className="relative grid h-14 w-14 shrink-0 place-items-center rounded-2xl bg-gradient-to-br from-amber-400 to-primary text-white shadow-md">
            <Crown className="h-7 w-7" />
            <span className="absolute -top-1 -right-1 grid h-5 w-5 place-items-center rounded-full bg-emerald-500 text-[10px] font-bold text-white ring-2 ring-background">
              1
            </span>
          </div>
          <div>
            <div className="text-[11px] font-medium uppercase tracking-wider text-primary/80">
              Winning Account Today
            </div>
            <div className="text-lg font-semibold text-foreground mt-0.5">
              {winner.account.displayName}
            </div>
            <div className="text-sm text-muted-foreground">
              @{winner.account.username}
            </div>
          </div>
        </div>

        {/* Avatar */}
        <div className="hidden sm:flex items-center lg:ml-2">
          <div
            className="grid h-12 w-12 place-items-center rounded-full text-white font-semibold text-sm shadow-sm ring-2 ring-background"
            style={{ background: `linear-gradient(135deg, ${winner.account.avatarColor}, ${winner.account.avatarColor}cc)` }}
          >
            {winner.account.avatarInitials}
          </div>
        </div>

        {/* Winning metric */}
        <div className="flex-1 grid grid-cols-2 sm:grid-cols-3 gap-3 lg:gap-4">
          <div className="rounded-xl bg-card/80 backdrop-blur p-3 border border-border/60">
            <div className="flex items-center gap-1.5 text-[11px] font-medium text-muted-foreground">
              <MousePointerClick className="h-3.5 w-3.5" style={{ color: metricMeta.color }} />
              Winning Metric
            </div>
            <div className="mt-1 text-lg font-semibold" style={{ color: metricMeta.color }}>
              {metricMeta.label}
            </div>
            <div className="text-xs text-muted-foreground">today&apos;s outbound clicks</div>
          </div>

          <div className="rounded-xl bg-card/80 backdrop-blur p-3 border border-border/60">
            <div className="text-[11px] font-medium text-muted-foreground">Today&apos;s Value</div>
            <div className="mt-1 text-lg font-semibold text-foreground">
              {formatFullNumber(winner.value)}
            </div>
            <div className={`mt-0.5 inline-flex items-center gap-1 text-xs font-medium ${isUp ? "text-emerald-600" : "text-rose-600"}`}>
              {isUp ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
              {formatPct(winner.change)}
            </div>
          </div>

          <div className="col-span-2 sm:col-span-1 rounded-xl bg-card/80 backdrop-blur p-3 border border-border/60">
            <div className="text-[11px] font-medium text-muted-foreground">Account Share</div>
            <div className="mt-1 text-lg font-semibold text-foreground">
              {data && data.accounts.length > 0
                ? `${Math.round(
                    (winner.value /
                      data.accounts.reduce(
                        (s, a) => s + (a.daily[a.daily.length - 1]?.outboundClicks ?? 0),
                        0
                      )) *
                        100
                  )}%`
                : "—"}
            </div>
            <div className="text-xs text-muted-foreground">of all outbound clicks</div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
