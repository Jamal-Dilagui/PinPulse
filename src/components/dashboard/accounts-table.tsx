"use client";

import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  Crown,
  TrendingUp,
  TrendingDown,
  ChevronDown,
  ChevronUp,
  Trophy,
} from "lucide-react";
import {
  DashboardData,
  METRICS,
  MetricKey,
  WINNING_METRIC,
} from "@/lib/pinterest/types";
import {
  getAccountRanking,
  formatFullNumber,
  formatPct,
} from "@/lib/pinterest/analytics";
import { cn } from "@/lib/utils";

interface AccountsTableProps {
  data: DashboardData | null;
}

type SortMetric = MetricKey;

export function AccountsTable({ data }: AccountsTableProps) {
  const [sortMetric, setSortMetric] = useState<SortMetric>(WINNING_METRIC);
  const [asc, setAsc] = useState(false);

  const ranking = useMemo(
    () => getAccountRanking(data, sortMetric),
    [data, sortMetric]
  );

  const sorted = useMemo(() => {
    const arr = [...ranking];
    arr.sort((a, b) => (asc ? a.total - b.total : b.total - a.total));
    return arr;
  }, [ranking, asc]);

  const toggleSort = (m: SortMetric) => {
    if (sortMetric === m) {
      setAsc((v) => !v);
    } else {
      setSortMetric(m);
      setAsc(false);
    }
  };

  const max = sorted[0]?.total ?? 1;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="rounded-2xl border border-border bg-card shadow-sm overflow-hidden"
    >
      <div className="flex items-center justify-between p-4 sm:p-5 border-b border-border">
        <div>
          <h3 className="text-base font-semibold text-foreground flex items-center gap-2">
            <Trophy className="h-4 w-4 text-primary" />
            Account Leaderboard
          </h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            Click any metric column to sort · crowned by{" "}
            <span className="font-medium text-primary">outbound clicks</span>
          </p>
        </div>
      </div>

      <div className="overflow-x-auto scrollbar-thin">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-muted/40 text-left text-[11px] uppercase tracking-wider text-muted-foreground">
              <th className="px-4 py-2.5 font-medium">#</th>
              <th className="px-4 py-2.5 font-medium">Account</th>
              {METRICS.map((m) => (
                <th
                  key={m.key}
                  className="px-4 py-2.5 font-medium cursor-pointer select-none hover:text-foreground"
                  onClick={() => toggleSort(m.key as SortMetric)}
                >
                  <div className="flex items-center gap-1">
                    <span style={{ color: sortMetric === m.key ? m.color : undefined }}>
                      {m.shortLabel}
                    </span>
                    {sortMetric === m.key &&
                      (asc ? (
                        <ChevronUp className="h-3 w-3" />
                      ) : (
                        <ChevronDown className="h-3 w-3" />
                      ))}
                  </div>
                </th>
              ))}
              <th className="px-4 py-2.5 font-medium text-right">Δ Today</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {sorted.map((row, idx) => {
              const isWinner = idx === 0 && sortMetric === WINNING_METRIC;
              const meta = METRICS.find((m) => m.key === sortMetric)!;
              const isUp = row.change >= 0;
              const widthPct = Math.max(4, Math.round((row.total / max) * 100));

              return (
                <tr
                  key={row.account.accountId}
                  className={cn(
                    "transition-colors hover:bg-muted/30",
                    isWinner && "bg-primary/5"
                  )}
                >
                  <td className="px-4 py-3 align-middle">
                    <div className="flex items-center gap-1.5">
                      <span className="text-sm font-semibold text-muted-foreground">
                        {idx + 1}
                      </span>
                      {isWinner && (
                        <Crown className="h-3.5 w-3.5 text-primary" />
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3 align-middle">
                    <div className="flex items-center gap-2.5">
                      <div
                        className="grid h-8 w-8 shrink-0 place-items-center rounded-full text-[11px] font-semibold text-white"
                        style={{
                          background: `linear-gradient(135deg, ${row.account.avatarColor}, ${row.account.avatarColor}cc)`,
                        }}
                      >
                        {row.account.avatarInitials}
                      </div>
                      <div className="min-w-0">
                        <div className="truncate font-medium text-foreground">
                          {row.account.displayName}
                        </div>
                        <div className="truncate text-[11px] text-muted-foreground">
                          @{row.account.username}
                        </div>
                      </div>
                    </div>
                  </td>
                  {METRICS.map((m) => {
                    const value = row.account.totals[m.key as MetricKey];
                    const isSorted = m.key === sortMetric;
                    return (
                      <td
                        key={m.key}
                        className={cn(
                          "px-4 py-3 align-middle",
                          isSorted && "bg-muted/20"
                        )}
                      >
                        <div className="flex flex-col gap-1">
                          <span className="text-sm font-medium text-foreground">
                            {formatFullNumber(value)}
                          </span>
                          {isSorted && (
                            <div className="h-1 w-full max-w-[80px] rounded-full bg-muted overflow-hidden">
                              <div
                                className="h-full rounded-full"
                                style={{
                                  width: `${widthPct}%`,
                                  backgroundColor: meta.color,
                                }}
                              />
                            </div>
                          )}
                        </div>
                      </td>
                    );
                  })}
                  <td className="px-4 py-3 align-middle text-right">
                    <span
                      className={cn(
                        "inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-xs font-medium",
                        isUp
                          ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300"
                          : "bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300"
                      )}
                    >
                      {isUp ? (
                        <TrendingUp className="h-3 w-3" />
                      ) : (
                        <TrendingDown className="h-3 w-3" />
                      )}
                      {formatPct(row.change)}
                    </span>
                  </td>
                </tr>
              );
            })}
            {sorted.length === 0 && (
              <tr>
                <td
                  colSpan={6}
                  className="px-4 py-8 text-center text-sm text-muted-foreground"
                >
                  No accounts yet — add one in Settings to see the leaderboard.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </motion.div>
  );
}
