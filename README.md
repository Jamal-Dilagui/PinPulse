# PinPulse

> A clean, privacy-first Pinterest analytics dashboard — track impressions, saves, outbound clicks and reacts across all your Pinterest accounts, spot today's winning account at a glance.

![PinPulse Dashboard](https://img.shields.io/badge/PinPulse-Dashboard-E60023?style=for-the-badge&logo=pinterest&logoColor=white)
![Next.js](https://img.shields.io/badge/Next.js-16-black?style=flat-square&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=flat-square&logo=typescript)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-4-38BDF8?style=flat-square&logo=tailwindcss)
![License](https://img.shields.io/badge/License-MIT-green?style=flat-square)

---

## ✨ Features

### 🏆 Winning Account Banner
A prominent animated alert at the top of the dashboard crowns today's best performing account based on **Outbound Clicks** (the winning metric). Includes today's value, day-over-day % change, and share of all outbound clicks.

### 📊 Today's Metric Winners
Four widget cards, one per metric (Impressions, Saves, Outbound Clicks, Reacts). Each card shows that metric's daily winner with value + % change. The Outbound Clicks card is marked with a **Main** crown badge to indicate it's the overall winning metric.

### 📈 Today's Totals
Four KPI cards aggregating each metric across all accounts with day-over-day percentage change.

### 📉 Account Performance Chart
Interactive area/line chart comparing all accounts over time. Metric tabs (Impressions / Saves / Outbound / Reacts) let you switch metric instantly. Custom tooltip shows per-day breakdown ranked by value + daily total.

### 🥇 Account Leaderboard
Sortable table (click any column header) showing per-account totals for every metric + today's % change. The #1 row by Outbound Clicks gets a crown icon.

### 📌 Top Pins
Image cards of the 6 best performing Pins ranked by outbound clicks, with click/impression/save counts.

### ⚙️ Settings (3 tabs)
- **API** — Pinterest access token, app ID, optional app secret, Live/Demo mode toggle, plus a step-by-step guide on how to get credentials from `developers.pinterest.com`.
- **Accounts** — add/remove Pinterest accounts (username + display name).
- **Preferences** — auto-refresh interval, default date range, reset to defaults.

### 🔒 Privacy & Confidentialité
A built-in privacy policy dialog (accessible from the footer) explaining data handling, RGPD / Loi 09-08 rights, and how to delete your data.

---

## 🛠 Tech Stack

| Layer | Technology |
|------|------------|
| Framework | Next.js 16 (App Router) |
| Language | TypeScript 5 |
| Styling | Tailwind CSS 4 |
| UI Components | shadcn/ui (New York style) + Lucide icons |
| Charts | Recharts |
| Animations | Framer Motion |
| State | Zustand (with `persist` for settings) |
| Notifications | Sonner + Radix Toast |

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ (or [Bun](https://bun.sh/))
- A Pinterest Developer account (optional — works in Demo mode without one)

### Installation

```bash
# Clone the repository
git clone https://github.com/Jamal-Dilagui/PinPulse.git
cd PinPulse

# Install dependencies (use one of the following)
bun install
# or
npm install
# or
pnpm install
```

### Running the dev server

```bash
bun run dev
# or
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the dashboard.

### Configuration

1. Click the **Settings** button (top-right).
2. (Optional) Switch to **Live API mode**.
3. Enter your Pinterest API credentials:
   - **Access Token / API Key** — generate from [developers.pinterest.com](https://developers.pinterest.com/)
   - **App ID** — found on your Pinterest app dashboard
   - **App Secret** (optional)
4. In the **Accounts** tab, add the Pinterest accounts you want to track.
5. Click **Save changes**.

> 💡 Without API credentials, the dashboard runs in **Demo mode** with realistic simulated data across 5 sample accounts — perfect for exploring the UI.

---

## 🔑 Getting Pinterest API Credentials

1. Go to [developers.pinterest.com](https://developers.pinterest.com/) and sign in.
2. Create a new app — copy the **App ID**.
3. Generate an access token with the following scopes:
   - `user_accounts:read`
   - `pins:read`
4. Paste the values in PinPulse → Settings → API tab.
5. (Optional) Switch on **Live API mode**.

---

## 📁 Project Structure

```
PinPulse/
├── src/
│   ├── app/
│   │   ├── layout.tsx              # Root layout + Toaster
│   │   ├── page.tsx                # Main dashboard composition
│   │   └── globals.css             # Pinterest-themed design tokens
│   ├── components/
│   │   ├── dashboard/
│   │   │   ├── dashboard-header.tsx
│   │   │   ├── winning-account-banner.tsx
│   │   │   ├── metric-winner-grid.tsx
│   │   │   ├── kpi-summary-grid.tsx
│   │   │   ├── performance-chart.tsx
│   │   │   ├── accounts-table.tsx
│   │   │   └── top-pins.tsx
│   │   ├── settings/
│   │   │   ├── settings-dialog.tsx
│   │   │   └── privacy-dialog.tsx
│   │   └── ui/                     # shadcn/ui components
│   ├── lib/
│   │   ├── pinterest/
│   │   │   ├── types.ts            # Types + metric metadata
│   │   │   ├── mock-data.ts        # Deterministic mock generator
│   │   │   └── analytics.ts        # Winners/totals/series helpers
│   │   ├── store/
│   │   │   ├── use-settings.ts     # Persisted settings store
│   │   │   └── use-dashboard.ts    # Dashboard state store
│   │   └── utils.ts
│   └── hooks/
├── public/
├── prisma/
│   └── schema.prisma
├── package.json
├── tsconfig.json
├── tailwind.config.ts
├── next.config.ts
└── README.md
```

---

## 🎨 Design System

| Token | Value |
|-------|-------|
| Primary | Pinterest Red `#E60023` |
| Impressions | Rose `#E60023` |
| Saves | Amber `#F59E0B` |
| Outbound Clicks | Emerald `#10B981` |
| Reacts | Violet `#8B5CF6` |
| Background | Light `oklch(0.99 0.003 240)` / Dark `oklch(0.16 0.005 240)` |
| Radius | `0.75rem` |

---

## 📊 The Winning Metric

The dashboard crowns **one overall winning account per day** based on **Outbound Clicks** — the metric that directly reflects traffic driven to your site. Each individual metric also has its own per-metric winner card.

```ts
// src/lib/pinterest/types.ts
export const WINNING_METRIC: MetricKey = "outboundClicks";
```

To change the winning metric, edit this constant and the leaderboard sort default in `accounts-table.tsx`.

---

## 🔌 Switching to Real Pinterest API

The data layer is isolated in `src/lib/pinterest/mock-data.ts`. To use the real Pinterest API:

1. Implement a `fetchDashboardData()` function in a new file (e.g. `src/lib/pinterest/api.ts`) that calls the Pinterest v5 API endpoints:
   - `GET /v5/user_account/analytics`
   - `GET /v5/accounts/{username}/analytics`
2. In `src/lib/store/use-dashboard.ts`, replace the call to `generateDashboardData()` with your API fetch when `isLiveMode === true`.
3. Make sure your access token has the required scopes.

---

## 🔒 Privacy

PinPulse is built privacy-first:
- ✅ All settings stored in `localStorage` (never sent to a server)
- ✅ Zero advertising cookies or third-party trackers
- ✅ API keys stay under your control
- ✅ One-click data reset

See the in-app **Politique de Confidentialité** dialog for full RGPD / Loi 09-08 details.

---

## 📝 License

MIT © Jamal Dilagui

---

## 🙏 Acknowledgements

- [Pinterest API v5](https://developers.pinterest.com/docs/api/v5/)
- [shadcn/ui](https://ui.shadcn.com/)
- [Recharts](https://recharts.org/)
- [Framer Motion](https://www.framer.com/motion/)
- [Lucide Icons](https://lucide.dev/)
