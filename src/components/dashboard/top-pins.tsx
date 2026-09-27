"use client";

import { motion } from "framer-motion";
import { MousePointerClick, ExternalLink } from "lucide-react";
import { DashboardData, TopPin } from "@/lib/pinterest/types";
import { formatFullNumber } from "@/lib/pinterest/analytics";

interface TopPinsProps {
  data: DashboardData | null;
}

export function TopPins({ data }: TopPinsProps) {
  const pins = data?.topPins ?? [];

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="rounded-2xl border border-border bg-card p-4 sm:p-5 shadow-sm"
    >
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-base font-semibold text-foreground flex items-center gap-2">
            <MousePointerClick className="h-4 w-4 text-primary" />
            Top Pins by Outbound Clicks
          </h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            Best performing Pins in the selected period
          </p>
        </div>
      </div>

      {pins.length === 0 ? (
        <div className="py-8 text-center text-sm text-muted-foreground">
          No top pins to show yet.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {pins.slice(0, 6).map((pin, idx) => (
            <PinCard key={pin.id} pin={pin} rank={idx + 1} />
          ))}
        </div>
      )}
    </motion.div>
  );
}

function PinCard({ pin, rank }: { pin: TopPin; rank: number }) {
  return (
    <motion.a
      href={pin.url}
      target="_blank"
      rel="noreferrer noopener"
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3, delay: 0.04 * rank }}
      whileHover={{ y: -2 }}
      className="group relative flex gap-3 rounded-xl border border-border bg-background/60 p-3 transition-all hover:border-foreground/15 hover:shadow-md"
    >
      <div className="relative h-20 w-16 shrink-0 overflow-hidden rounded-lg bg-muted">
        <img
          src={pin.imageUrl}
          alt={pin.title}
          className="h-full w-full object-cover transition-transform group-hover:scale-105"
          loading="lazy"
          onError={(e) => {
            (e.currentTarget as HTMLImageElement).style.display = "none";
          }}
        />
        <div className="absolute top-1 left-1 grid h-5 w-5 place-items-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground shadow">
          {rank}
        </div>
      </div>

      <div className="flex min-w-0 flex-1 flex-col">
        <div className="flex items-start justify-between gap-1.5">
          <div className="text-sm font-medium text-foreground line-clamp-2">
            {pin.title}
          </div>
          <ExternalLink className="h-3.5 w-3.5 shrink-0 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
        </div>
        <div className="mt-0.5 text-[11px] text-muted-foreground truncate">
          @{pin.username}
        </div>

        <div className="mt-auto flex items-center gap-2 pt-2">
          <div className="rounded-md bg-emerald-50 px-1.5 py-0.5 text-[10px] font-medium text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300">
            {formatFullNumber(pin.outboundClicks)} clicks
          </div>
          <div className="text-[10px] text-muted-foreground">
            {formatFullNumber(pin.impressions)} impr · {formatFullNumber(pin.saves)} saves
          </div>
        </div>
      </div>
    </motion.a>
  );
}
