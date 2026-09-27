"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { PinterestAccount, PinterestSettings } from "@/lib/pinterest/types";
import { getDefaultSettings } from "@/lib/pinterest/mock-data";

interface SettingsStore extends PinterestSettings {
  setApiKey: (key: string) => void;
  setApiSecret: (secret: string) => void;
  setAppId: (id: string) => void;
  setRefreshInterval: (sec: number) => void;
  setDefaultDateRangeDays: (days: number) => void;
  setLiveMode: (live: boolean) => void;
  addAccount: (account: PinterestAccount) => void;
  removeAccount: (id: string) => void;
  updateAccount: (id: string, patch: Partial<PinterestAccount>) => void;
  reset: () => void;
  isConfigured: () => boolean;
}

export const useSettingsStore = create<SettingsStore>()(
  persist(
    (set, get) => ({
      ...getDefaultSettings(),

      setApiKey: (key) => set({ apiKey: key }),
      setApiSecret: (secret) => set({ apiSecret: secret }),
      setAppId: (id) => set({ appId: id }),
      setRefreshInterval: (sec) => set({ refreshInterval: sec }),
      setDefaultDateRangeDays: (days) => set({ defaultDateRangeDays: days }),
      setLiveMode: (live) => set({ isLiveMode: live }),
      addAccount: (account) =>
        set((s) => ({ accounts: [...s.accounts, account] })),
      removeAccount: (id) =>
        set((s) => ({ accounts: s.accounts.filter((a) => a.id !== id) })),
      updateAccount: (id, patch) =>
        set((s) => ({
          accounts: s.accounts.map((a) =>
            a.id === id ? { ...a, ...patch } : a
          ),
        })),
      reset: () => set({ ...getDefaultSettings() }),
      isConfigured: () => {
        const s = get();
        return s.apiKey.trim().length > 0 && s.appId.trim().length > 0;
      },
    }),
    { name: "pinterest-dashboard-settings" }
  )
);
