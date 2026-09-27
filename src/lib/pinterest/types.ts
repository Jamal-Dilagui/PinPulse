// Pinterest Analytics Types

export type MetricKey =
  | "impressions"
  | "saves"
  | "outboundClicks"
  | "reacts";

export interface MetricMeta {
  key: MetricKey;
  label: string;
  shortLabel: string;
  description: string;
  color: string; // hex
  twText: string;
  twBg: string;
  twBorder: string;
  icon: string; // lucide name resolved downstream
}

export interface PinterestAccount {
  id: string;
  username: string;
  displayName: string;
  avatarColor: string; // gradient seed color
  avatarInitials: string;
  followers: number;
  boards: number;
  pins: number;
  isLinked: boolean;
}

export interface DailyMetricPoint {
  date: string; // ISO date (yyyy-mm-dd)
  impressions: number;
  saves: number;
  outboundClicks: number;
  reacts: number;
}

export interface AccountAnalytics {
  accountId: string;
  username: string;
  displayName: string;
  avatarColor: string;
  avatarInitials: string;
  daily: DailyMetricPoint[];
  totals: {
    impressions: number;
    saves: number;
    outboundClicks: number;
    reacts: number;
  };
  // day-over-day change on the latest day vs the day before
  change: {
    impressions: number; // percentage e.g. 12.4 or -3.2
    saves: number;
    outboundClicks: number;
    reacts: number;
  };
}

export interface TopPin {
  id: string;
  accountId: string;
  username: string;
  title: string;
  imageUrl: string;
  impressions: number;
  saves: number;
  outboundClicks: number;
  reacts: number;
  url: string;
}

export interface DashboardData {
  dateRange: { from: string; to: string };
  accounts: AccountAnalytics[];
  topPins: TopPin[];
  generatedAt: string;
}

export interface PinterestSettings {
  apiKey: string;
  apiSecret: string;
  appId: string;
  accounts: PinterestAccount[];
  refreshInterval: number; // seconds
  isLiveMode: boolean; // true = use real API, false = mock data
  defaultDateRangeDays: number;
}

export const METRICS: MetricMeta[] = [
  {
    key: "impressions",
    label: "Impressions",
    shortLabel: "Impressions",
    description: "Number of times your Pins were on screen",
    color: "#E60023", // Pinterest red
    twText: "text-rose-600",
    twBg: "bg-rose-50",
    twBorder: "border-rose-200",
    icon: "Eye",
  },
  {
    key: "saves",
    label: "Saves",
    shortLabel: "Saves",
    description: "Times people saved your Pins to their boards",
    color: "#F59E0B",
    twText: "text-amber-600",
    twBg: "bg-amber-50",
    twBorder: "border-amber-200",
    icon: "Bookmark",
  },
  {
    key: "outboundClicks",
    label: "Outbound Clicks",
    shortLabel: "Outbound",
    description: "Clicks that left Pinterest to your site",
    color: "#10B981",
    twText: "text-emerald-600",
    twBg: "bg-emerald-50",
    twBorder: "border-emerald-200",
    icon: "MousePointerClick",
  },
  {
    key: "reacts",
    label: "Reacts",
    shortLabel: "Reacts",
    description: "Reactions (cheers, etc.) on your Pins",
    color: "#8B5CF6",
    twText: "text-violet-600",
    twBg: "bg-violet-50",
    twBorder: "border-violet-200",
    icon: "Heart",
  },
];

export const METRIC_MAP: Record<MetricKey, MetricMeta> = METRICS.reduce(
  (acc, m) => {
    acc[m.key] = m;
    return acc;
  },
  {} as Record<MetricKey, MetricMeta>
);

// The metric used to crown the overall winning account of the day.
export const WINNING_METRIC: MetricKey = "outboundClicks";
