"use client";

import { motion } from "framer-motion";
import {
  Eye,
  Bookmark,
  MousePointerClick,
  Heart,
  TrendingUp,
  TrendingDown,
  Crown,
} from "lucide-react";
import {
  DashboardData,
  METRICS,
  MetricKey,
  WINNING_METRIC,
} from "@/lib/pinterest/types";
import {
  getDailyWinner,
  formatFullNumber,
  formatPct,
} from "@/lib/pinterest/analytics";

const ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  Eye,
  Bookmark,
  MousePointerClick,
  Heart,
};

interface MetricWinnerGridProps {
  data: DashboardData | null;
}

export function MetricWinnerGrid({ data }: MetricWinnerGridProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
      {METRICS.map((metric, idx) => {
        const winner = getDailyWinner(data, metric.key as MetricKey);
        const Icon = ICONS[metric.icon] ?? Eye;
        const isOverallWinner = metric.key === WINNING_METRIC;
        const isUp = winner ? winner.change >= 0 : true;

        return (
          <motion.div
            key={metric.key}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.05 * idx }}
            className={`group relative rounded-xl border bg-card p-4 shadow-sm transition-all hover:shadow-md ${
              isOverallWinner
                ? "border-primary/40 ring-1 ring-primary/20"
                : "border-border hover:border-foreground/15"
            }`}
          >
            {/* Top row: icon + label */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div
                  className="grid h-9 w-9 place-items-center rounded-lg"
                  style={{ backgroundColor: `${metric.color}1a` }}
                >
                  <Icon className="h-4.5 w-4.5" style={{ color: metric.color }} />
                </div>
                <div>
                  <div className="text-sm font-medium text-foreground">
                    {metric.label}
                  </div>
                  <div className="text-[11px] text-muted-foreground">
                    Today&apos;s winner
                  </div>
                </div>
              </div>
              {isOverallWinner && (
                <div className="flex items-center gap-1 rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-semibold text-primary">
                  <Crown className="h-3 w-3" />
                  Main
                </div>
              )}
            </div>

            {/* Winner account */}
            {winner ? (
              <>
                <div className="mt-4 flex items-center gap-2.5">
                  <div
                    className="grid h-8 w-8 place-items-center rounded-full text-[11px] font-semibold text-white"
                    style={{
                      background: `linear-gradient(135deg, ${winner.account.avatarColor}, ${winner.account.avatarColor}cc)`,
                    }}
                  >
                    {winner.account.avatarInitials}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-sm font-medium text-foreground">
                      {winner.account.displayName}
                    </div>
                    <div className="truncate text-[11px] text-muted-foreground">
                      @{winner.account.username}
                    </div>
                  </div>
                </div>

                {/* Value + change */}
                <div className="mt-3 flex items-end justify-between">
                  <div>
                    <div
                      className="text-xl font-semibold"
                      style={{ color: metric.color }}
                    >
                      {formatFullNumber(winner.value)}
                    </div>
                    <div className="text-[10px] text-muted-foreground">
                      {metric.shortLabel.toLowerCase()} today
                    </div>
                  </div>
                  <div
                    className={`inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-xs font-medium ${
                      isUp
                        ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300"
                        : "bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300"
                    }`}
                  >
                    {isUp ? (
                      <TrendingUp className="h-3 w-3" />
                    ) : (
                      <TrendingDown className="h-3 w-3" />
                    )}
                    {formatPct(winner.change)}
                  </div>
                </div>
              </>
            ) : (
              <div className="mt-6 text-sm text-muted-foreground">
                No data yet
              </div>
            )}
          </motion.div>
        );
      })}
    </div>
  );
}
