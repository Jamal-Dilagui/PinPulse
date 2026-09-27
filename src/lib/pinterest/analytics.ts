import {
  AccountAnalytics,
  DashboardData,
  MetricKey,
  WINNING_METRIC,
} from "./types";

export function formatNumber(n: number): string {
  if (n === 0) return "0";
  if (Math.abs(n) >= 1_000_000) {
    return (n / 1_000_000).toFixed(n % 1_000_000 === 0 ? 0 : 1) + "M";
  }
  if (Math.abs(n) >= 1_000) {
    return (n / 1_000).toFixed(n % 1_000 === 0 ? 0 : 1) + "K";
  }
  return n.toString();
}

export function formatFullNumber(n: number): string {
  return n.toLocaleString("en-US");
}

export function formatPct(n: number): string {
  const sign = n >= 0 ? "+" : "";
  return `${sign}${n.toFixed(1)}%`;
}

export interface MetricWinner {
  metric: MetricKey;
  account: AccountAnalytics;
  value: number;
  change: number;
}

// Returns the account that won the latest day on the given metric.
export function getDailyWinner(
  data: DashboardData | null,
  metric: MetricKey
): MetricWinner | null {
  if (!data || data.accounts.length === 0) return null;
  let best: MetricWinner | null = null;
  for (const acc of data.accounts) {
    const last = acc.daily[acc.daily.length - 1];
    if (!last) continue;
    const value = last[metric];
    if (!best || value > best.value) {
      best = {
        metric,
        account: acc,
        value,
        change: acc.change[metric],
      };
    }
  }
  return best;
}

export function getOverallWinner(
  data: DashboardData | null
): MetricWinner | null {
  return getDailyWinner(data, WINNING_METRIC);
}

// Today's totals across all accounts for a metric
export function getDailyTotals(data: DashboardData | null) {
  if (!data || data.accounts.length === 0) {
    return {
      impressions: 0,
      saves: 0,
      outboundClicks: 0,
      reacts: 0,
      change: {
        impressions: 0,
        saves: 0,
        outboundClicks: 0,
        reacts: 0,
      },
    };
  }
  const last = data.accounts[0].daily.length - 1;
  const prev = last - 1;

  const totals = { impressions: 0, saves: 0, outboundClicks: 0, reacts: 0 };
  const prevTotals = {
    impressions: 0,
    saves: 0,
    outboundClicks: 0,
    reacts: 0,
  };

  for (const acc of data.accounts) {
    if (acc.daily[last]) {
      totals.impressions += acc.daily[last].impressions;
      totals.saves += acc.daily[last].saves;
      totals.outboundClicks += acc.daily[last].outboundClicks;
      totals.reacts += acc.daily[last].reacts;
    }
    if (prev >= 0 && acc.daily[prev]) {
      prevTotals.impressions += acc.daily[prev].impressions;
      prevTotals.saves += acc.daily[prev].saves;
      prevTotals.outboundClicks += acc.daily[prev].outboundClicks;
      prevTotals.reacts += acc.daily[prev].reacts;
    }
  }

  const pct = (a: number, b: number) =>
    b === 0 ? (a > 0 ? 100 : 0) : ((a - b) / b) * 100;

  return {
    ...totals,
    change: {
      impressions: pct(totals.impressions, prevTotals.impressions),
      saves: pct(totals.saves, prevTotals.saves),
      outboundClicks: pct(totals.outboundClicks, prevTotals.outboundClicks),
      reacts: pct(totals.reacts, prevTotals.reacts),
    },
  };
}

// Build a chart-ready series for a metric across all accounts (per-day totals).
export function getMetricTimeSeries(
  data: DashboardData | null,
  metric: MetricKey
) {
  if (!data || data.accounts.length === 0) return [];
  const days = data.accounts[0].daily.length;
  const series: Array<{ date: string } & Record<string, number | string>> = [];
  for (let i = 0; i < days; i++) {
    const date = data.accounts[0].daily[i].date;
    const row: { date: string } & Record<string, number | string> = { date };
    for (const acc of data.accounts) {
      row[acc.username] = acc.daily[i][metric];
    }
    series.push(row);
  }
  return series;
}

export function getAccountRanking(
  data: DashboardData | null,
  metric: MetricKey
) {
  if (!data) return [];
  return [...data.accounts]
    .map((acc) => {
      const total = acc.totals[metric];
      const last = acc.daily[acc.daily.length - 1]?.[metric] ?? 0;
      return { account: acc, total, last, change: acc.change[metric] };
    })
    .sort((a, b) => b.total - a.total);
}
