"use client";

import { create } from "zustand";
import { DashboardData, MetricKey, PinterestAccount } from "@/lib/pinterest/types";
import { generateDashboardData } from "@/lib/pinterest/mock-data";

export type DateRangePreset = "7d" | "14d" | "30d" | "90d";

interface DashboardStore {
  data: DashboardData | null;
  isLoading: boolean;
  lastUpdated: string | null;
  error: string | null;

  selectedMetric: MetricKey;
  selectedAccountId: string | "all";
  datePreset: DateRangePreset;
  customFrom: Date | null;
  customTo: Date | null;

  setMetric: (m: MetricKey) => void;
  setAccount: (id: string | "all") => void;
  setDatePreset: (p: DateRangePreset) => void;
  refresh: (accounts: PinterestAccount[], daysBack?: number) => void;
}

function computeRange(daysBack: number): { from: Date; to: Date } {
  const to = new Date();
  to.setUTCHours(0, 0, 0, 0);
  const from = new Date(to);
  from.setUTCDate(from.getUTCDate() - (daysBack - 1));
  return { from, to };
}

const PRESET_DAYS: Record<DateRangePreset, number> = {
  "7d": 7,
  "14d": 14,
  "30d": 30,
  "90d": 90,
};

export const useDashboardStore = create<DashboardStore>((set, get) => ({
  data: null,
  isLoading: false,
  lastUpdated: null,
  error: null,

  selectedMetric: "outboundClicks",
  selectedAccountId: "all",
  datePreset: "30d",
  customFrom: null,
  customTo: null,

  setMetric: (m) => set({ selectedMetric: m }),
  setAccount: (id) => set({ selectedAccountId: id }),
  setDatePreset: (p) => set({ datePreset: p }),

  refresh: (accounts, daysBack) => {
    const preset = get().datePreset;
    const days = daysBack ?? PRESET_DAYS[preset];
    const { from, to } = computeRange(days);
    set({ isLoading: true, error: null });
    // simulate async fetch (mock data is sync but keep the loading state for UX)
    setTimeout(() => {
      try {
        const data = generateDashboardData(accounts, from, to);
        set({ data, isLoading: false, lastUpdated: new Date().toISOString() });
      } catch (e) {
        set({
          isLoading: false,
          error: e instanceof Error ? e.message : "Failed to load data",
        });
      }
    }, 250);
  },
}));
