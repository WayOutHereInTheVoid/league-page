import Nav from "./Nav/index.svelte";
import Footer from "./Footer.svelte";
import News from "./News/index.svelte";
import Resources from "./Resources.svelte";
import Awards from "./Awards/Awards.svelte";
import Rosters from "./Rosters/Rosters.svelte";
import Rivalry from "./Rivalry/index.svelte";
import Transactions from "./Transactions/Transactions.svelte";
import TransactionsCompact from "./Transactions/TransactionsCompact.svelte";
import TransactionsPage from "./Transactions/TransactionsPage.svelte";
import MatchupsAndBrackets from "./Matchups/MatchupsAndBrackets.svelte";
import Pagination from "./Pagination.svelte";
import Drafts from "./Drafts/index.svelte";
import Records from "./Records/index.svelte";
import Manager from "./Managers/Manager.svelte";
import AllManagers from "./Managers/AllManagers.svelte";
import PowerRankings from "./PowerRankings/index.svelte";
import PowerRankingsCompact from "./PowerRankings/PowerRankingsCompact.svelte";
import HomePost from "./BlogPosts/HomePost.svelte";
import FullPost from "./BlogPosts/FullPost.svelte";
import Posts from "./BlogPosts/Posts.svelte";
import Standings from "./Standings/index.svelte";
import StandingsCompact from "./Standings/StandingsCompact.svelte";

/**
 * @file Components Re-exports Module.
 * Collects and re-exports primary Svelte custom components for clean imports elsewhere in the project.
 */

export {
  /**
   * Header Navigation component.
   * @type {import('svelte').Component}
   */
  Nav,

  /**
   * Footer markup layout component.
   * @type {import('svelte').Component}
   */
  Footer,

  /**
   * Trophy Room and awards records renderer.
   * @type {import('svelte').Component}
   */
  Awards,

  /**
   * Rosters detailed cards table view.
   * @type {import('svelte').Component}
   */
  Rosters,

  /**
   * Manager head-to-head stats comparison dashboard.
   * @type {import('svelte').Component}
   */
  Rivalry,

  /**
   * Interactive Trade/Waiver transactions view.
   * @type {import('svelte').Component}
   */
  Transactions,

  /**
   * Condensed horizontal card layout trade/waiver preview.
   * @type {import('svelte').Component}
   */
  TransactionsCompact,

  /**
   * Transactions full page layout component.
   * @type {import('svelte').Component}
   */
  TransactionsPage,

  /**
   * News feeds list generator.
   * @type {import('svelte').Component}
   */
  News,

  /**
   * External useful resources references component.
   * @type {import('svelte').Component}
   */
  Resources,

  /**
   * Head-to-head matches matchups and playoff bracket trees renderer.
   * @type {import('svelte').Component}
   */
  MatchupsAndBrackets,

  /**
   * Pagination controller.
   * @type {import('svelte').Component}
   */
  Pagination,

  /**
   * Historical completed and upcoming drafts display.
   * @type {import('svelte').Component}
   */
  Drafts,

  /**
   * Season-by-season and all-time record leaderboards view.
   * @type {import('svelte').Component}
   */
  Records,

  /**
   * Individual manager profile and season records view.
   * @type {import('svelte').Component}
   */
  Manager,

  /**
   * General league managers comparison cards panel.
   * @type {import('svelte').Component}
   */
  AllManagers,

  /**
   * Advanced power rankings charts panel.
   * @type {import('svelte').Component}
   */
  PowerRankings,

  /**
   * Condensed list of active power ranking leaders.
   * @type {import('svelte').Component}
   */
  PowerRankingsCompact,

  /**
   * Homepage single blog post preview.
   * @type {import('svelte').Component}
   */
  HomePost,

  /**
   * Historical blog posts list preview.
   * @type {import('svelte').Component}
   */
  Posts,

  /**
   * Full blog article content viewer with comments.
   * @type {import('svelte').Component}
   */
  FullPost,

  /**
   * Interactive league standings table.
   * @type {import('svelte').Component}
   */
  Standings,

  /**
   * Compact league standings overview.
   * @type {import('svelte').Component}
   */
  StandingsCompact,
};
