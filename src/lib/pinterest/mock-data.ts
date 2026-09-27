import {
  AccountAnalytics,
  DailyMetricPoint,
  DashboardData,
  PinterestAccount,
  PinterestSettings,
  TopPin,
} from "./types";

// Deterministic pseudo-random generator (mulberry32) so the same day always
// produces the same numbers, even across page reloads.
function mulberry32(seed: number) {
  return function () {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = seed;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function hashString(str: string): number {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

const DEFAULT_ACCOUNTS: PinterestAccount[] = [
  {
    id: "acc_1",
    username: "wanderlust_morocco",
    displayName: "Wanderlust Morocco",
    avatarColor: "#E60023",
    avatarInitials: "WM",
    followers: 18420,
    boards: 24,
    pins: 1280,
    isLinked: true,
  },
  {
    id: "acc_2",
    username: "atelier_zineb",
    displayName: "Atelier Zineb",
    avatarColor: "#8B5CF6",
    avatarInitials: "AZ",
    followers: 9870,
    boards: 18,
    pins: 740,
    isLinked: true,
  },
  {
    id: "acc_3",
    username: "tasty_kitchen_ma",
    displayName: "Tasty Kitchen MA",
    avatarColor: "#10B981",
    avatarInitials: "TK",
    followers: 24310,
    boards: 32,
    pins: 2105,
    isLinked: true,
  },
  {
    id: "acc_4",
    username: "moroccan_decor",
    displayName: "Moroccan Decor",
    avatarColor: "#F59E0B",
    avatarInitials: "MD",
    followers: 14260,
    boards: 21,
    pins: 980,
    isLinked: true,
  },
  {
    id: "acc_5",
    username: "tech_novate",
    displayName: "Tech Novate",
    avatarColor: "#0EA5E9",
    avatarInitials: "TN",
    followers: 7120,
    boards: 12,
    pins: 540,
    isLinked: true,
  },
];

const DEFAULT_SETTINGS: PinterestSettings = {
  apiKey: "",
  apiSecret: "",
  appId: "",
  accounts: DEFAULT_ACCOUNTS,
  refreshInterval: 60,
  isLiveMode: false,
  defaultDateRangeDays: 30,
};

export function getDefaultSettings(): PinterestSettings {
  return { ...DEFAULT_SETTINGS, accounts: [...DEFAULT_ACCOUNTS] };
}

export function getDefaultAccounts(): PinterestAccount[] {
  return DEFAULT_ACCOUNTS.map((a) => ({ ...a }));
}

// Base scale per account — keeps each account visibly different on the chart.
const ACCOUNT_SCALE: Record<
  string,
  { impressions: number; saves: number; outboundClicks: number; reacts: number }
> = {
  acc_1: { impressions: 18000, saves: 920, outboundClicks: 540, reacts: 410 },
  acc_2: { impressions: 12000, saves: 1100, outboundClicks: 720, reacts: 380 },
  acc_3: { impressions: 24000, saves: 1340, outboundClicks: 1080, reacts: 620 },
  acc_4: { impressions: 15500, saves: 760, outboundClicks: 430, reacts: 290 },
  acc_5: { impressions: 8400, saves: 520, outboundClicks: 910, reacts: 240 },
};

function isoDate(d: Date): string {
  return d.toISOString().split("T")[0];
}

function generateDailyForAccount(
  account: PinterestAccount,
  from: Date,
  to: Date
): DailyMetricPoint[] {
  const scale = ACCOUNT_SCALE[account.id] ?? ACCOUNT_SCALE.acc_1;
  const seed = hashString(account.id);
  const rng = mulberry32(seed);
  const points: DailyMetricPoint[] = [];

  const cursor = new Date(from);
  while (cursor <= to) {
    const daySeed = hashString(account.id + isoDate(cursor));
    const dayRng = mulberry32(daySeed);

    // weekly seasonality — weekends lift metrics
    const dow = cursor.getUTCDay();
    const weekendBoost = dow === 0 || dow === 6 ? 1.18 : 1.0;

    // slow upward trend influenced by day index
    const totalDays = Math.max(
      1,
      Math.round((to.getTime() - from.getTime()) / 86400000)
    );
    const dayIndex = Math.round(
      (cursor.getTime() - from.getTime()) / 86400000
    );
    const trend = 1 + (dayIndex / totalDays) * 0.25;

    // account-specific noise so each metric moves a little differently
    const noise = 0.85 + dayRng() * 0.4;
    const noise2 = 0.8 + dayRng() * 0.5;
    const noise3 = 0.82 + dayRng() * 0.45;
    const noise4 = 0.78 + dayRng() * 0.55;

    const impressions = Math.round(
      scale.impressions * weekendBoost * trend * noise
    );
    const saves = Math.round(scale.saves * weekendBoost * trend * noise2);
    const outboundClicks = Math.round(
      scale.outboundClicks * weekendBoost * trend * noise3
    );
    const reacts = Math.round(scale.reacts * weekendBoost * trend * noise4);

    points.push({
      date: isoDate(cursor),
      impressions,
      saves,
      outboundClicks,
      reacts,
    });

    cursor.setUTCDate(cursor.getUTCDate() + 1);
    // suppress rng unused warning
    void rng;
  }

  return points;
}

function pctChange(today: number, yesterday: number): number {
  if (yesterday === 0) return today > 0 ? 100 : 0;
  return ((today - yesterday) / yesterday) * 100;
}

function buildAccountAnalytics(
  account: PinterestAccount,
  from: Date,
  to: Date
): AccountAnalytics {
  const daily = generateDailyForAccount(account, from, to);
  const totals = daily.reduce(
    (acc, p) => {
      acc.impressions += p.impressions;
      acc.saves += p.saves;
      acc.outboundClicks += p.outboundClicks;
      acc.reacts += p.reacts;
      return acc;
    },
    { impressions: 0, saves: 0, outboundClicks: 0, reacts: 0 }
  );

  const last = daily[daily.length - 1];
  const prev = daily[daily.length - 2] ?? last;
  const change = {
    impressions: pctChange(last.impressions, prev.impressions),
    saves: pctChange(last.saves, prev.saves),
    outboundClicks: pctChange(last.outboundClicks, prev.outboundClicks),
    reacts: pctChange(last.reacts, prev.reacts),
  };

  return {
    accountId: account.id,
    username: account.username,
    displayName: account.displayName,
    avatarColor: account.avatarColor,
    avatarInitials: account.avatarInitials,
    daily,
    totals,
    change,
  };
}

const TOP_PIN_TITLES = [
  "10 Hidden Gems in Chefchaouen",
  "Modern Moroccan Living Room Ideas",
  "Tagine Recipes You Need to Try",
  "Riad Interior Inspiration",
  "Berber Rug Styling Tips",
  "Marrakech Travel Bucket List",
  "Zellige Tile Patterns",
  "Pastilla Step-by-Step Recipe",
  "Atlas Mountains Hiking Guide",
  "Mint Tea Ceremony Setup",
  "Handmade Leather Poufs Decor",
  "Festival au Désert Highlights",
];

const TOP_PIN_IMAGES = [
  "https://images.unsplash.com/photo-1539020140153-e479b8c22e70?w=400",
  "https://images.unsplash.com/photo-1505691938895-1758d7feb511?w=400",
  "https://images.unsplash.com/photo-1518791841217-8f162f1e1131?w=400",
  "https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=400",
  "https://images.unsplash.com/photo-1481277542470-605612bd2d55?w=400",
  "https://images.unsplash.com/photo-1461988320302-91bde64fc8a4?w=400",
  "https://images.unsplash.com/photo-1502672023488-1cbeddede3a4?w=400",
  "https://images.unsplash.com/photo-1490644914289-0d481ec28852?w=400",
];

function buildTopPins(
  accounts: PinterestAccount[],
  from: Date,
  to: Date
): TopPin[] {
  const pins: TopPin[] = [];
  const rng = mulberry32(hashString("top-pins-" + isoDate(from) + isoDate(to)));

  const pool = [...accounts, ...accounts]; // duplicate so we can sample more
  for (let i = 0; i < 6; i++) {
    const acc = pool[Math.floor(rng() * pool.length)];
    const scale = ACCOUNT_SCALE[acc.id] ?? ACCOUNT_SCALE.acc_1;
    pins.push({
      id: `pin_${i + 1}_${acc.id}`,
      accountId: acc.id,
      username: acc.username,
      title: TOP_PIN_TITLES[i % TOP_PIN_TITLES.length],
      imageUrl: TOP_PIN_IMAGES[i % TOP_PIN_IMAGES.length],
      impressions: Math.round(scale.impressions * (1.4 + rng() * 0.8)),
      saves: Math.round(scale.saves * (1.6 + rng() * 1.2)),
      outboundClicks: Math.round(scale.outboundClicks * (1.8 + rng() * 1.4)),
      reacts: Math.round(scale.reacts * (1.4 + rng() * 1.0)),
      url: "#",
    });
  }

  // sort by outbound clicks desc — matches the "winning metric" theme
  return pins.sort((a, b) => b.outboundClicks - a.outboundClicks);
}

export function generateDashboardData(
  accounts: PinterestAccount[],
  from: Date,
  to: Date
): DashboardData {
  const accAnalytics = accounts.map((a) =>
    buildAccountAnalytics(a, from, to)
  );
  const topPins = buildTopPins(accounts, from, to);
  return {
    dateRange: { from: isoDate(from), to: isoDate(to) },
    accounts: accAnalytics,
    topPins,
    generatedAt: new Date().toISOString(),
  };
}
