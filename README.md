# 🏈 Fantasy Football League Page

A fully customizable, mobile-first fantasy football league homepage built with **SvelteKit** and optimized for **Sleeper** leagues.

This professional web app serves as the ultimate hub for your fantasy football league, integrating live scoring, all-time and single-season records, head-to-head manager rivalries, trade/waiver tracking, drafts, standings, a trophy room, and an optional Contentful-powered blog.

---

## 📖 Table of Contents

1. [Features](#-features)
2. [Tech Stack](#-tech-stack)
3. [Prerequisites](#-prerequisites)
4. [Getting Started (Local Development)](#-getting-started-local-development)
5. [Configuration Guide](#%EF%B8%8F-configuration-guide)
6. [Draft/Waivers & FAAB Clearing Timezone Normalization](#-draftwaivers--faab-clearing-timezone-normalization)
7. [Visual Page Builder](#%EF%B8%8F-visual-page-builder)
8. [Caching & Performance System](#-caching--performance-system)
9. [Preseason & Pre-draft Setup (Time-Travel Mode)](#-preseason--pre-draft-setup-time-travel-mode)
10. [Seasonal Checklist: Start of Each Season](#-seasonal-checklist-start-of-each-season)
11. [Build, Deployment & Docker](#%EF%B8%8F-build-deployment--docker)
12. [License & Contributing](#-license--contributing)

---

## 🌟 Features

- **Manager Profiles:** Custom biographies, locations, photos, and deep statistical history for every active or inactive manager.
- **Standings:** Real-time division and overall standings updated dynamically.
- **Rosters:** View team rosters, positions, and current player injury status.
- **Matchups & Bracket Trees:** Interactive weekly matchup schedules and fully rendered winner/loser playoff brackets.
- **Power Rankings:** Advanced performance-based algorithmic rankings featuring trend indicators.
- **Trophy Room (Awards):** View historical division winners, champions, runners-up, third-place finishers, and toilet bowl losers.
- **Trade & Waiver Transactions:** Complete list of trades, waivers, and roster moves with detailed FAAB bid tracking.
- **Record Book:** Aggregated all-time and single-season leaderboards (weekly high/low scores, blowout margins, closest wins).
- **Draft Board:** Interactive grids displaying previous and upcoming draft selections.
- **League Blog:** (Optional) Powered by Contentful rich-text rendering with comment support.

---

## 💻 Tech Stack

- **Framework:** [SvelteKit](https://kit.svelte.dev/)
- **Styling & UI:** [Svelte Material UI (SMUI)](https://sveltematerialui.com/)
- **Charts:** [ApexCharts](https://apexcharts.com/)
- **Data API:** [Sleeper REST API](https://docs.sleeper.com/)
- **CMS (Blog):** [Contentful](https://www.contentful.com/)

---

## 📋 Prerequisites

Before running the application locally, ensure you have:

- **Node.js:** Version 20.0.0 or higher
- **npm:** Version 6.0.0 or higher

---

## 🚀 Getting Started (Local Development)

Follow these steps to run a development instance of your league page:

1. **Clone the repository:**

   ```sh
   git clone https://github.com/nmelhado/league-page.git
   cd league-page
   ```

2. **Install dependencies:**
   _(Note: This automatically triggers preparation scripts compiling light and dark SMUI themes)_

   ```sh
   npm install
   ```

3. **Run the local development server:**

   ```sh
   npm run dev
   ```

4. **Open in your browser:**
   Open [http://localhost:5173](http://localhost:5173) to view your running application.

---

## ⚙️ Configuration Guide

The primary configuration of your league resides in: **`src/lib/utils/leagueInfo.js`**.

Open this file to adjust the following options:

### Basic Settings

- `leagueID`: Your active Sleeper League ID (can be fetched from your Sleeper league URL).
- `leagueName`: Your custom league name displayed in navigation bars and banners.
- `dues`: Annual monetary dues.
- `dynasty`: Set to `true` if this is a dynasty league, `false` for redraft/keepers.
- `enableBlog`: Set to `true` to enable the Contentful blog feature.

### Manager Grid Setup

Managers are defined in the `managers` array of objects. Map each manager's Sleeper user ID, roster slots, customized bio, and photo paths:

```js
{
  managerID: "1234567890", // Manager's Sleeper User ID
  name: "Eric Patterson",
  location: "Phoenix, AZ",
  bio: "Fantasy football veteran since 2010.",
  photo: "/managers/EricP.jpg",
  // additional profile details...
}
```

Historical manager roster mappings across seasons are configured in **`src/lib/utils/managers.json`**. Keep this file accurate to enable cross-season stats compiling.

---

## ⏰ Draft/Waivers & FAAB Clearing Timezone Normalization

To ensure consistent time stamps regardless of where your league managers live, the system includes native timezone normalization:

- **FAAB Waivers:** Waiver claims usually clear on Tuesdays at **7:00 AM MST**. The system automatically detects waivers processed near this window and normalizes their visual timestamps to prevent minute-by-minute API delay offsets.
- **Arizona Standard Time:** All server-side and browser-facing timestamps are formatted to **America/Phoenix (MST year-round)**. Arizona does not observe Daylight Saving Time, eliminating DST offsets on your transactions log.

---

## 🏗️ Visual Page Builder

The web app includes an advanced **Visual Page Builder Layout System** managed through:

- `src/lib/admin/pageLayoutManager.js`
- `src/lib/admin/componentRegistry.js`

You can change what sections appear on your homepage and manager pages, adjust chart heights, configure grid sizes, or enable/disable components (like records, blog previews, and transaction lists) dynamically in the admin configuration panel.

---

## ⚡ Caching & Performance System

Since the Sleeper API has rate limits and network lookups can be expensive, the project utilizes a centralized caching orchestrator:

- **`cacheManager.js`:** Implements `localStorage` caching with precise time-to-live expiration policies.
- **Stale-While-Revalidate:** servs cached (stale) data instantly while triggering asynchronous background updates for seamless performance.
- **Performance Monitor:** Records caching hit rates to maximize responsiveness.

### Default Lifetimes (TTL):

- **Players Database:** 24 Hours
- **League Settings:** 4 Hours
- **Rosters / Standings:** 30 Minutes
- **Live Matchups:** 15 Minutes
- **Waivers / Trades:** 10 Minutes
- **News / NFL State:** 5 Minutes

---

## ⏳ Preseason & Pre-draft Setup ("Time-Travel" Mode)

During the preseason, Sleeper API settings are in "pre_draft" mode, indicating no active games have occurred.
To keep your homepage engaging before kickoff, the system enters **"Time-Travel" Mode**:

- **Automatic Fallback:** Detects the preseason status and automatically fetches and compiles results from the preceding completed year.
- **Power Rankings Preview:** Homepage charts display the previous season's power rankings to foster draft-week rivalry discussion.
- **Upcoming Draft Board:** Parses traded picks and rosters wins to predict the draft board, calculating mock accuracy indexes.

---

## 📅 Seasonal Checklist: Start of Each Season

When transitioning your league to a new fantasy year, perform these steps to update your homepage:

1. **Roll Over the League on Sleeper:** Complete your draft and league creation on the Sleeper platform.
2. **Update Active ID:** Retrieve your new Sleeper League ID and replace the value of `leagueID` inside `src/lib/utils/leagueInfo.js`.
3. **Configure New Managers:** If any owners changed, update their profile details in `src/lib/utils/leagueInfo.js` and input their historical mapping inside `src/lib/utils/managers.json`.
4. **Prune Cache:** Press the "Clear Cache" button under your site's resources manager to trigger a fresh data reload.
5. **Verify Version:** Check `src/lib/version.js` to ensure your local build is in sync with the upstream repository master.

---

## 🛠️ Build, Deployment & Docker

### Local Code Quality

Run formatting and linting to ensure compliance with SvelteKit compile guidelines:

```sh
# Run code formatter
npm run format

# Run project linter checks
npm run lint
```

### Production Compiles

To generate a production-ready application bundle:

```sh
npm run build
```

_(Produces static and server-rendered assets inside SvelteKit's build output)._

### Docker Containerization

Run your league page inside a lightweight container:

1. **Build the Docker Image:**

   ```sh
   npm run docker-build
   ```

2. **Run the Docker Container:**
   ```sh
   npm run docker-run
   ```
   _(Exposes the running container at `http://localhost:3000`)_

---

## 📄 License & Contributing

This project is open-source software distributed under the **MIT License**.

Contributions are highly encouraged! Please fork this repository, commit your amazing enhancements, and submit a pull request against the `PRIMARY` branch. For formatting guidelines, run `npm run format` prior to committing.
