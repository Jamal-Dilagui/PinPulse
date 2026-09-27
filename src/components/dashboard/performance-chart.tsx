"use client";

import { useMemo, useState } from "react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  Line,
  LineChart,
} from "recharts";
import { motion } from "framer-motion";
import { BarChart3, LineChart as LineIcon } from "lucide-react";
import {
  DashboardData,
  METRICS,
  MetricKey,
} from "@/lib/pinterest/types";
import { getMetricTimeSeries, formatNumber } from "@/lib/pinterest/analytics";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface PerformanceChartProps {
  data: DashboardData | null;
}

type ChartMode = "area" | "line";

export function PerformanceChart({ data }: PerformanceChartProps) {
  const [mode, setMode] = useState<ChartMode>("area");
  const [metric, setMetric] = useState<MetricKey>("outboundClicks");

  const series = useMemo(
    () => getMetricTimeSeries(data, metric),
    [data, metric]
  );

  const accountColors = useMemo(() => {
    const map: Record<string, string> = {};
    data?.accounts.forEach((a, i) => {
      map[a.username] = a.avatarColor || `hsl(${i * 60}, 70%, 50%)`;
    });
    return map;
  }, [data]);

  const meta = METRICS.find((m) => m.key === metric)!;

  const formatDate = (iso: string) => {
    const d = new Date(iso + "T00:00:00Z");
    return d.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      timeZone: "UTC",
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="rounded-2xl border border-border bg-card p-4 sm:p-5 shadow-sm"
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
        <div>
          <h3 className="text-base font-semibold text-foreground flex items-center gap-2">
            <BarChart3 className="h-4 w-4 text-primary" />
            Account Performance
          </h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            Compare {meta.label.toLowerCase()} across all accounts over time
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Metric pills */}
          <div className="flex items-center gap-0.5 rounded-lg border border-border bg-muted/40 p-0.5">
            {METRICS.map((m) => (
              <button
                key={m.key}
                onClick={() => setMetric(m.key)}
                className={cn(
                  "rounded-md px-2.5 py-1 text-xs font-medium transition-all",
                  metric === m.key
                    ? "bg-card text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                )}
                style={
                  metric === m.key
                    ? { borderBottom: `2px solid ${m.color}` }
                    : undefined
                }
              >
                {m.shortLabel}
              </button>
            ))}
          </div>

          {/* Chart mode toggle */}
          <div className="flex items-center gap-0.5 rounded-lg border border-border bg-muted/40 p-0.5">
            <Button
              size="sm"
              variant={mode === "area" ? "secondary" : "ghost"}
              className="h-7 px-2 text-xs"
              onClick={() => setMode("area")}
            >
              <BarChart3 className="h-3.5 w-3.5" />
            </Button>
            <Button
              size="sm"
              variant={mode === "line" ? "secondary" : "ghost"}
              className="h-7 px-2 text-xs"
              onClick={() => setMode("line")}
            >
              <LineIcon className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
      </div>

      {/* Chart */}
      <div className="h-[320px] w-full">
        {series.length === 0 ? (
          <div className="grid h-full place-items-center text-sm text-muted-foreground">
            No data to display
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            {mode === "area" ? (
              <AreaChart
                data={series}
                margin={{ top: 8, right: 8, left: -8, bottom: 0 }}
              >
                <defs>
                  {data?.accounts.map((a) => (
                    <linearGradient
                      key={a.username}
                      id={`grad-${a.username.replace(/[^a-z0-9]/gi, "")}`}
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop
                        offset="5%"
                        stopColor={accountColors[a.username]}
                        stopOpacity={0.35}
                      />
                      <stop
                        offset="95%"
                        stopColor={accountColors[a.username]}
                        stopOpacity={0.02}
                      />
                    </linearGradient>
                  ))}
                </defs>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="oklch(0.92 0.005 240)"
                  vertical={false}
                />
                <XAxis
                  dataKey="date"
                  tickFormatter={formatDate}
                  tick={{ fontSize: 11, fill: "oklch(0.55 0.01 240)" }}
                  tickLine={false}
                  axisLine={false}
                  minTickGap={32}
                />
                <YAxis
                  tickFormatter={(v) => formatNumber(Number(v))}
                  tick={{ fontSize: 11, fill: "oklch(0.55 0.01 240)" }}
                  tickLine={false}
                  axisLine={false}
                  width={48}
                />
                <Tooltip
                  content={({ active, payload, label }) => {
                    if (!active || !payload || payload.length === 0) return null;
                    const total = payload.reduce(
                      (s, p) => s + (Number(p.value) || 0),
                      0
                    );
                    return (
                      <div className="rounded-lg border border-border bg-popover/95 backdrop-blur p-3 shadow-lg">
                        <div className="text-[11px] font-medium text-muted-foreground mb-1.5">
                          {formatDate(String(label))}
                        </div>
                        <div className="space-y-1">
                          {payload
                            .slice()
                            .sort((a, b) => Number(b.value) - Number(a.value))
                            .map((p) => (
                              <div
                                key={String(p.dataKey)}
                                className="flex items-center gap-2 text-xs"
                              >
                                <span
                                  className="h-2 w-2 rounded-full"
                                  style={{ backgroundColor: p.color }}
                                />
                                <span className="text-muted-foreground truncate max-w-[120px]">
                                  {p.dataKey}
                                </span>
                                <span className="ml-auto font-medium text-foreground">
                                  {formatNumber(Number(p.value))}
                                </span>
                              </div>
                            ))}
                        </div>
                        <div className="mt-2 pt-2 border-t border-border flex justify-between text-xs">
                          <span className="text-muted-foreground">Total</span>
                          <span className="font-semibold text-foreground">
                            {formatNumber(total)}
                          </span>
                        </div>
                      </div>
                    );
                  }}
                />
                <Legend
                  iconType="circle"
                  iconSize={8}
                  wrapperStyle={{ fontSize: 11, paddingTop: 8 }}
                />
                {data?.accounts.map((a) => (
                  <Area
                    key={a.username}
                    type="monotone"
                    dataKey={a.username}
                    stroke={accountColors[a.username]}
                    strokeWidth={2}
                    fill={`url(#grad-${a.username.replace(/[^a-z0-9]/gi, "")})`}
                    dot={false}
                    activeDot={{ r: 4, strokeWidth: 0 }}
                    stackId={mode === "area" ? "1" : undefined}
                  />
                ))}
              </AreaChart>
            ) : (
              <LineChart
                data={series}
                margin={{ top: 8, right: 8, left: -8, bottom: 0 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="oklch(0.92 0.005 240)"
                  vertical={false}
                />
                <XAxis
                  dataKey="date"
                  tickFormatter={formatDate}
                  tick={{ fontSize: 11, fill: "oklch(0.55 0.01 240)" }}
                  tickLine={false}
                  axisLine={false}
                  minTickGap={32}
                />
                <YAxis
                  tickFormatter={(v) => formatNumber(Number(v))}
                  tick={{ fontSize: 11, fill: "oklch(0.55 0.01 240)" }}
                  tickLine={false}
                  axisLine={false}
                  width={48}
                />
                <Tooltip
                  content={({ active, payload, label }) => {
                    if (!active || !payload || payload.length === 0) return null;
                    const total = payload.reduce(
                      (s, p) => s + (Number(p.value) || 0),
                      0
                    );
                    return (
                      <div className="rounded-lg border border-border bg-popover/95 backdrop-blur p-3 shadow-lg">
                        <div className="text-[11px] font-medium text-muted-foreground mb-1.5">
                          {formatDate(String(label))}
                        </div>
                        <div className="space-y-1">
                          {payload
                            .slice()
                            .sort((a, b) => Number(b.value) - Number(a.value))
                            .map((p) => (
                              <div
                                key={String(p.dataKey)}
                                className="flex items-center gap-2 text-xs"
                              >
                                <span
                                  className="h-2 w-2 rounded-full"
                                  style={{ backgroundColor: p.color }}
                                />
                                <span className="text-muted-foreground truncate max-w-[120px]">
                                  {p.dataKey}
                                </span>
                                <span className="ml-auto font-medium text-foreground">
                                  {formatNumber(Number(p.value))}
                                </span>
                              </div>
                            ))}
                        </div>
                        <div className="mt-2 pt-2 border-t border-border flex justify-between text-xs">
                          <span className="text-muted-foreground">Total</span>
                          <span className="font-semibold text-foreground">
                            {formatNumber(total)}
                          </span>
                        </div>
                      </div>
                    );
                  }}
                />
                <Legend
                  iconType="circle"
                  iconSize={8}
                  wrapperStyle={{ fontSize: 11, paddingTop: 8 }}
                />
                {data?.accounts.map((a) => (
                  <Line
                    key={a.username}
                    type="monotone"
                    dataKey={a.username}
                    stroke={accountColors[a.username]}
                    strokeWidth={2}
                    dot={false}
                    activeDot={{ r: 4, strokeWidth: 0 }}
                  />
                ))}
              </LineChart>
            )}
          </ResponsiveContainer>
        )}
      </div>
    </motion.div>
  );
}
