# Sleeper API Data Points and Usage in the Application

This document provides a comprehensive list of all data points accessed through the Sleeper API within the application and details how that information is currently utilized across the website.

## 1. NFL State
**Endpoint:** `https://api.sleeper.app/v1/state/nfl`
*   **Information Accessed:** The current state of the NFL season. This includes the `week` (current week number), `season_type` (pre, regular, post), `season` (current year), and `league_season` (active fantasy season).
*   **How it is Used:**
    *   **Global App State:** Determines the current year and active week for the fantasy application to know whether to display preseason, active season, or offseason UI.
    *   **Data Fetching Scope:** Used in `fetch_players_info` to calculate the length of the regular season and playoffs to properly iterate through weekly projections.
    *   **Caching & Live Updates:** Assists the caching orchestrator in determining if cached data is stale based on the current NFL week.

## 2. League Configuration & Details
**Endpoint:** `https://api.sleeper.app/v1/league/{leagueID}`
*   **Information Accessed:** Comprehensive league metadata including:
    *   `name`: The name of the league.
    *   `status`: League status (pre_draft, in_season, complete).
    *   `season`: The year of the league.
    *   `previous_league_id`: The ID of the league from the previous year.
    *   `draft_id`: The ID of the upcoming/current draft.
    *   `settings`: Various league settings (playoff_week_start, trade deadlines, etc.).
    *   `scoring_settings`: Key-value map of all custom point multipliers (e.g., passing yards = 0.04).
*   **How it is Used:**
    *   **Core Foundation:** This is the primary configuration object for the league homepage.
    *   **Historical Data Traversal:** The `previous_league_id` is crucial for creating loops that fetch historical data (standings, managers, records, awards, and past drafts) for all previous seasons of the league.
    *   **Custom Projections:** The `scoring_settings` are mathematically applied against raw player projections to calculate custom fantasy point projections tailored specifically to the league's unique scoring format.

## 3. Users / Managers
**Endpoint:** `https://api.sleeper.app/v1/league/{leagueID}/users`
*   **Information Accessed:** A list of all users participating in the league. Key fields include `user_id`, `display_name`, `avatar`, and team metadata (like team name).
*   **How it is Used:**
    *   **Manager Profiles:** Maps the cryptic `user_id` to human-readable display names.
    *   **Team Mapping:** Merged with local manager configurations (from `leagueInfo.js`) to display customized bios, photos, and team names across the app (Standings, Power Rankings, Team Pages).

## 4. Rosters & Team Configurations
**Endpoint:** `https://api.sleeper.app/v1/league/{leagueID}/rosters`
*   **Information Accessed:** Detailed data on all teams (rosters) in the league. Includes:
    *   `roster_id`: Unique identifier for the roster slot (1-12).
    *   `owner_id`: The `user_id` of the manager managing the roster.
    *   `starters`, `reserve` (IR), `players`: Arrays of Sleeper player IDs currently on the team.
    *   `settings`: Team-specific stats like `wins`, `losses`, `ties`, `fpts` (fantasy points), `fpts_decimal`.
*   **How it is Used:**
    *   **Standings & Records:** The `settings` object is used to build real-time standings, calculate win percentages, and display total points scored.
    *   **Team Pages:** Renders the actual lineup of players for each team, indicating who is starting, on the bench, or on IR.
    *   **Draft Order Prediction:** Before the draft happens, team records (`wins`/`losses`/`fpts`) from this endpoint are used to predict the upcoming draft order.

## 5. Global NFL Players Database
**Endpoint:** `https://api.sleeper.app/v1/players/nfl`
*   **Information Accessed:** A massive JSON object containing metadata for every active and inactive NFL player. Fields include `player_id`, `first_name`, `last_name`, `position`, `team`, and `injury_status`.
*   **How it is Used:**
    *   **Player Identification:** Translates numeric player IDs found on rosters and transactions into displayable names, positions, and NFL teams.
    *   **Injury Reports:** Highlights players with active injury designations on team pages and matchups.

## 6. Player Projections
**Endpoint:** `https://api.sleeper.app/projections/nfl/{year}/{week}?season_type=regular&...&order_by=ppr`
*   **Information Accessed:** Weekly statistical projections (e.g., predicted passing yards, rushing TDs, receptions) and the NFL opponent for every player.
*   **How it is Used:**
    *   **Player Values:** The raw statistical projections are multiplied against the league's `scoring_settings` (from the League Details endpoint) to generate a custom projected fantasy score for each player for every week of the season.

## 7. Matchups & Scoring
**Endpoint:** `https://api.sleeper.app/v1/league/{leagueID}/matchups/{week}`
*   **Information Accessed:** Weekly Head-to-Head matchup data. Includes `matchup_id`, `roster_id`, `points` (total points scored), and `starters_points` (individual points scored by starting players).
*   **How it is Used:**
    *   **Live/Past Matchups:** Renders the weekly scoreboard.
    *   **Deep Analytics:** Aggregated across all weeks and seasons to calculate detailed manager statistics, such as:
        *   All-time Head-to-Head (Rivalry) records between specific managers.
        *   Longest winning/losing streaks.
        *   Highest and lowest scoring weeks in league history.
        *   Points For (PF) and Points Against (PA) metrics over time.

## 8. Playoff Brackets
**Endpoints:**
*   `https://api.sleeper.app/v1/league/{leagueID}/winners_bracket`
*   `https://api.sleeper.app/v1/league/{leagueID}/losers_bracket`
*   **Information Accessed:** Tournament bracket structures detailing matchups (teams, rounds, winners, losers) for both the championship bracket and the toilet bowl.
*   **How it is Used:**
    *   **Bracket Visualization:** Renders the playoff bracket UI for current and historical seasons.
    *   **Awards & History:** Used to programmatically determine league champions, runner-ups, 3rd place finishers, and toilet bowl "winners" for the League History/Awards page.

## 9. Transactions (Waivers, Trades, Draft Picks)
**Endpoint:** `https://api.sleeper.app/v1/league/{leagueID}/transactions/{week}`
*   **Information Accessed:** A ledger of all roster moves for a specific week. Includes `type` (trade, waiver, free_agent), `adds`, `drops`, `draft_picks` traded, and `waiver_budget` (FAAB spent).
*   **How it is Used:**
    *   **Transaction Feed:** Builds a chronological timeline of all league activity, digesting raw JSON into human-readable descriptions (e.g., "Manager A traded Player X to Manager B for a 2024 1st Round Pick").
    *   **Manager Activity Stats:** Aggregates transaction counts to show which managers make the most trades or waiver wire claims (both all-time and per-season).

## 10. Draft Information & Picks
**Endpoints:**
*   `https://api.sleeper.app/v1/draft/{draftID}` (Draft details, slot mapping, settings)
*   `https://api.sleeper.app/v1/draft/{draftID}/picks` (Actual player selections)
*   `https://api.sleeper.app/v1/draft/{draftID}/traded_picks` (Traded pick ownership)
*   `https://api.sleeper.app/v1/league/{leagueID}/drafts` (List of drafts for a season)
*   **Information Accessed:** Draft configurations (snake vs. auction, rounds, reversal round), slot-to-manager assignments, ownership of traded future picks, and the final results of completed drafts (player selected, pick number, amount spent in auction).
*   **How it is Used:**
    *   **Draft Boards:** Constructs detailed, interactive visual draft boards for both historical (completed) drafts and the upcoming (uncompleted) draft.
    *   **Pick Ownership Tracking:** In upcoming drafts, it visually represents traded picks by showing the logo/name of the new owner in the slot that originally belonged to someone else.

## Historical Data and Statistics Calculations

The application performs significant client-side calculations using data from the Sleeper API to generate complex historical statistics and manager records.

### Manager Stats (`computeManagerStats` / `processSeasonData`)
These functions iterate over a manager's history to compile a comprehensive profile.
*   **Calculations Performed:**
    *   **Total Records:** Sums up total `wins`, `losses`, and `ties` across all seasons.
    *   **Win Percentage:** Calculated as `(totalWins / (totalWins + totalLosses + totalTies)) * 100`.
    *   **Points Stats:** Sums total `fpts` (Points For) and `fptsAgainst` (Points Against). Averages are calculated as `totalPoints / seasonsPlayed` and `totalPoints / totalGames`.
    *   **Awards & Achievements:** Tracks counts of `playoffAppearances`, `championships`, `divisionChampionships`, `runnerUpFinishes`, `thirdPlaceFinishes`, and `toiletBowlWins`.
    *   **Lineup Efficiency:** Calculated for individual seasons as `(fpts / potentialPoints) * 100` (Potential points are the optimal points a manager could have scored if they started their perfect lineup).

### League Records (`getLeagueRecords` / `processMatchups` / `digestBracket`)
The app traverses backward through historical league IDs to compile all-time leaderboards.
*   **Calculations Performed:**
    *   **Season Point Records (Highs/Lows):** Sorts all weekly matchups to identify the highest and lowest scoring weeks in league history (and per season).
    *   **Matchup Differentials (Blowouts/Nail-biters):** Compares the scores of Head-to-Head opponents (`home.fpts - away.fpts`) to find the biggest blowouts and closest matchups.
    *   **Season-Long Points:** Averages the `fptsFor` over the number of games played (`wins + losses + ties`) to determine `fptsPerGame` for a season.
    *   **Post-Season Processing (`processPlayoffs`):** Flattens nested bracket JSON data, sums points across multi-week playoff matchups, and adds playoff performance to a manager's historical record (tracking post-season wins, losses, points scored, and byes).

### League Standings (`getLeagueStandings` / `processStandings`)
Calculates real-time standings, including division records which are not always fully exposed by the basic API endpoints.
*   **Calculations Performed:**
    *   **Base Standings:** Extracts `wins`, `losses`, `ties`, `fpts` (combining base and decimal), and `fptsAgainst` directly from the roster settings.
    *   **Division Records:** If the league uses divisions, the app fetches all completed weekly matchups, matches competitors in identical divisions, and programmatically increments `divisionWins`, `divisionLosses`, and `divisionTies` based on the head-to-head point results.
