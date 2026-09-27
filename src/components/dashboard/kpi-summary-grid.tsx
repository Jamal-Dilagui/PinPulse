"use client";

import { motion } from "framer-motion";
import {
  Eye,
  Bookmark,
  MousePointerClick,
  Heart,
  TrendingUp,
  TrendingDown,
} from "lucide-react";
import { DashboardData, METRICS, MetricKey } from "@/lib/pinterest/types";
import {
  getDailyTotals,
  formatFullNumber,
  formatPct,
} from "@/lib/pinterest/analytics";

const ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  Eye,
  Bookmark,
  MousePointerClick,
  Heart,
};

interface KpiSummaryGridProps {
  data: DashboardData | null;
}

export function KpiSummaryGrid({ data }: KpiSummaryGridProps) {
  const totals = getDailyTotals(data);

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
      {METRICS.map((metric, idx) => {
        const Icon = ICONS[metric.icon] ?? Eye;
        const value = totals[metric.key as MetricKey];
        const change = totals.change[metric.key as MetricKey];
        const isUp = change >= 0;

        return (
          <motion.div
            key={metric.key}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: 0.03 * idx }}
            className="rounded-xl border border-border bg-card p-3.5 shadow-sm"
          >
            <div className="flex items-center justify-between">
              <div
                className="grid h-8 w-8 place-items-center rounded-lg"
                style={{ backgroundColor: `${metric.color}1a` }}
              >
                <Icon className="h-4 w-4" style={{ color: metric.color }} />
              </div>
              <span
                className={`inline-flex items-center gap-0.5 text-[11px] font-medium ${
                  isUp ? "text-emerald-600" : "text-rose-600"
                }`}
              >
                {isUp ? (
                  <TrendingUp className="h-3 w-3" />
                ) : (
                  <TrendingDown className="h-3 w-3" />
                )}
                {formatPct(change)}
              </span>
            </div>
            <div className="mt-2.5">
              <div className="text-[11px] text-muted-foreground">
                {metric.label} · today
              </div>
              <div className="text-xl font-semibold tracking-tight text-foreground">
                {formatFullNumber(value)}
              </div>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}
