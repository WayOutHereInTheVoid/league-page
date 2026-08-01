// Enhanced Component Registry for Visual Page Builder
// Maps existing components to their visual builder configuration

// Use relative imports to avoid $lib alias issues
import {
  Standings,
  PowerRankings,
  Transactions,
  TransactionsPage,
  AllManagers,
  Manager,
  Awards,
  Records,
  News,
  HomePost,
  Posts,
  FullPost,
  Rivalry,
  Rosters,
  Drafts,
  MatchupsAndBrackets,
  Nav,
  Footer,
  Resources,
  Pagination,
} from "../components.js";

// Import chart components using relative paths
import BarChart from "../BarChart.svelte";
import EnhancedBarChart from "../EnhancedBarChart.svelte";
import RadarChart from "../RadarChart.svelte";
import TrendChart from "../TrendChart.svelte";

/**
 * Enhanced Component Registry Configuration for Visual Page Builder.
 * Maps registered Svelte components to categories, config settings, and data requirements.
 *
 * @type {Object}
 */
export const componentRegistry = {
  // === CONTENT COMPONENTS ===
  "homepage-text": {
    component: null, // Special case - handled by text editor
    name: "League Introduction Text",
    category: "Content",
    description: "Welcome message and league description",
    configurable: {
      text: { type: "rich-text", label: "League Introduction" },
    },
    defaultProps: {
      text: "Welcome to our fantasy football league!",
    },
    requiresData: [],
    tags: ["text", "intro", "welcome"],
    previewMode: "text",
  },

  news: {
    component: News,
    name: "League News",
    category: "Content",
    description: "Latest league news and updates",
    configurable: {
      limit: {
        type: "number",
        label: "Number of Articles",
        default: 5,
        min: 3,
        max: 15,
      },
      showImages: {
        type: "boolean",
        label: "Show Article Images",
        default: true,
      },
    },
    defaultProps: {
      limit: 5,
      showImages: true,
    },
    requiresData: ["news"],
    tags: ["news", "updates", "articles"],
  },

  "blog-post": {
    component: HomePost,
    name: "Recent Blog Post",
    category: "Content",
    description: "Most recent blog post preview (requires blog enabled)",
    configurable: {
      showExcerpt: {
        type: "boolean",
        label: "Show Post Excerpt",
        default: true,
      },
      maxExcerptLength: {
        type: "number",
        label: "Excerpt Length",
        default: 200,
        min: 100,
        max: 500,
      },
    },
    defaultProps: {
      showExcerpt: true,
      maxExcerptLength: 200,
    },
    requiresData: ["blog"],
    tags: ["blog", "posts", "content"],
  },

  "blog-posts": {
    component: Posts,
    name: "All Blog Posts",
    category: "Content",
    description: "Complete blog posts listing with pagination",
    configurable: {
      postsPerPage: {
        type: "number",
        label: "Posts Per Page",
        default: 10,
        min: 5,
        max: 25,
      },
      showPagination: {
        type: "boolean",
        label: "Show Pagination",
        default: true,
      },
    },
    defaultProps: {
      postsPerPage: 10,
      showPagination: true,
    },
    requiresData: ["blog"],
    tags: ["blog", "posts", "pagination"],
  },

  resources: {
    component: Resources,
    name: "League Resources",
    category: "Content",
    description: "Helpful fantasy football resources and links",
    configurable: {
      showCategories: {
        type: "boolean",
        label: "Show Categories",
        default: true,
      },
      openInNewTab: {
        type: "boolean",
        label: "Open Links in New Tab",
        default: true,
      },
    },
    defaultProps: {
      showCategories: true,
      openInNewTab: true,
    },
    requiresData: [],
    tags: ["resources", "links", "tools"],
  },

  // === LEAGUE DATA COMPONENTS ===
  standings: {
    component: Standings,
    name: "Current Standings",
    category: "League Data",
    description: "Current season standings and records",
    configurable: {
      showWeek: { type: "boolean", label: "Show Week Number", default: true },
      showPoints: {
        type: "boolean",
        label: "Show Points For/Against",
        default: true,
      },
      compactView: { type: "boolean", label: "Compact View", default: false },
      highlightPlayoffs: {
        type: "boolean",
        label: "Highlight Playoff Teams",
        default: true,
      },
    },
    defaultProps: {
      showWeek: true,
      showPoints: true,
      compactView: false,
      highlightPlayoffs: true,
    },
    requiresData: ["standings", "rosters"],
    tags: ["standings", "records", "playoffs"],
  },

  "power-rankings": {
    component: PowerRankings,
    name: "Power Rankings",
    category: "League Data",
    description: "Algorithmic power rankings based on performance",
    configurable: {
      animated: { type: "boolean", label: "Animated Rankings", default: true },
      showTrend: { type: "boolean", label: "Show Trend Arrows", default: true },
      chartHeight: {
        type: "number",
        label: "Chart Height (px)",
        default: 400,
        min: 300,
        max: 600,
      },
    },
    defaultProps: {
      animated: true,
      showTrend: true,
      chartHeight: 400,
    },
    requiresData: ["matchups", "rosters", "standings"],
    tags: ["rankings", "power", "analysis"],
  },

  transactions: {
    component: Transactions,
    name: "Recent Transactions",
    category: "League Data",
    description: "Recent trades, waivers, and roster moves",
    configurable: {
      limit: {
        type: "number",
        label: "Number of Transactions",
        default: 10,
        min: 5,
        max: 50,
      },
      showTypes: {
        type: "multi-select",
        label: "Transaction Types",
        options: ["trade", "waiver", "free_agent"],
        default: ["trade", "waiver", "free_agent"],
      },
      showDate: {
        type: "boolean",
        label: "Show Transaction Date",
        default: true,
      },
    },
    defaultProps: {
      limit: 10,
      showTypes: ["trade", "waiver", "free_agent"],
      showDate: true,
    },
    requiresData: ["transactions", "players"],
    tags: ["transactions", "trades", "waivers"],
  },

  "transactions-page": {
    component: TransactionsPage,
    name: "Full Transactions History",
    category: "League Data",
    description: "Complete transaction history with advanced filtering",
    configurable: {
      showFilters: {
        type: "boolean",
        label: "Show Filter Options",
        default: true,
      },
      showSearch: { type: "boolean", label: "Show Search Bar", default: true },
      transactionsPerPage: {
        type: "number",
        label: "Transactions Per Page",
        default: 25,
        min: 10,
        max: 100,
      },
    },
    defaultProps: {
      showFilters: true,
      showSearch: true,
      transactionsPerPage: 25,
    },
    requiresData: ["transactions", "players", "rosters"],
    tags: ["transactions", "history", "filtering"],
  },

  rosters: {
    component: Rosters,
    name: "Current Rosters",
    category: "League Data",
    description: "All team rosters with player information",
    configurable: {
      showPositions: {
        type: "boolean",
        label: "Show Player Positions",
        default: true,
      },
      showStats: { type: "boolean", label: "Show Player Stats", default: true },
      sortBy: {
        type: "select",
        label: "Sort Rosters By",
        options: ["standing", "alphabetical", "points"],
        default: "standing",
      },
    },
    defaultProps: {
      showPositions: true,
      showStats: true,
      sortBy: "standing",
    },
    requiresData: ["rosters", "players", "standings"],
    tags: ["rosters", "teams", "players"],
  },

  "matchups-brackets": {
    component: MatchupsAndBrackets,
    name: "Matchups & Brackets",
    category: "League Data",
    description: "Weekly matchups and playoff brackets",
    configurable: {
      showScores: {
        type: "boolean",
        label: "Show Final Scores",
        default: true,
      },
      showProjections: {
        type: "boolean",
        label: "Show Projections",
        default: false,
      },
      highlightCurrent: {
        type: "boolean",
        label: "Highlight Current Week",
        default: true,
      },
    },
    defaultProps: {
      showScores: true,
      showProjections: false,
      highlightCurrent: true,
    },
    requiresData: ["matchups", "brackets"],
    tags: ["matchups", "brackets", "playoffs"],
  },

  drafts: {
    component: Drafts,
    name: "Draft Results",
    category: "Historical",
    description: "Draft history and analysis",
    configurable: {
      showGrades: {
        type: "boolean",
        label: "Show Draft Grades",
        default: true,
      },
      showTrades: {
        type: "boolean",
        label: "Show Traded Picks",
        default: true,
      },
      draftYear: {
        type: "select",
        label: "Draft Year",
        options: ["current", "all"],
        default: "current",
      },
    },
    defaultProps: {
      showGrades: true,
      showTrades: true,
      draftYear: "current",
    },
    requiresData: ["drafts", "players"],
    tags: ["draft", "history", "picks"],
  },

  // === MANAGER COMPONENTS ===
  "all-managers": {
    component: AllManagers,
    name: "All Managers",
    category: "Managers",
    description: "Grid of all league managers with profiles",
    configurable: {
      layout: {
        type: "select",
        label: "Layout Style",
        options: ["grid", "list", "cards"],
        default: "grid",
      },
      showBio: { type: "boolean", label: "Show Manager Bios", default: true },
      showStats: {
        type: "boolean",
        label: "Show Manager Stats",
        default: true,
      },
      photosPerRow: {
        type: "number",
        label: "Photos Per Row",
        default: 3,
        min: 2,
        max: 6,
      },
    },
    defaultProps: {
      layout: "grid",
      showBio: true,
      showStats: true,
      photosPerRow: 3,
    },
    requiresData: ["managers", "rosters"],
    tags: ["managers", "profiles", "team"],
  },

  "single-manager": {
    component: Manager,
    name: "Manager Profile",
    category: "Managers",
    description: "Individual manager profile with detailed stats",
    configurable: {
      showAdvancedStats: {
        type: "boolean",
        label: "Show Advanced Stats",
        default: true,
      },
      showHistory: {
        type: "boolean",
        label: "Show Season History",
        default: true,
      },
      showRival: { type: "boolean", label: "Show Rival Info", default: true },
    },
    defaultProps: {
      showAdvancedStats: true,
      showHistory: true,
      showRival: true,
    },
    requiresData: ["managers", "rosters", "matchups"],
    tags: ["manager", "profile", "stats"],
  },

  rivalry: {
    component: Rivalry,
    name: "Manager Rivalries",
    category: "Managers",
    description: "Head-to-head rivalry analysis between managers",
    configurable: {
      showStats: {
        type: "boolean",
        label: "Show Rivalry Stats",
        default: true,
      },
      animated: { type: "boolean", label: "Animated Charts", default: true },
      showAllRivalries: {
        type: "boolean",
        label: "Show All Rivalries",
        default: false,
      },
    },
    defaultProps: {
      showStats: true,
      animated: true,
      showAllRivalries: false,
    },
    requiresData: ["matchups", "managers"],
    tags: ["rivalry", "head-to-head", "comparison"],
  },

  // === HISTORICAL COMPONENTS ===
  awards: {
    component: Awards,
    name: "League Awards",
    category: "Historical",
    description: "Championship history and awards",
    configurable: {
      showYears: {
        type: "number",
        label: "Years to Display",
        default: 5,
        min: 1,
        max: 20,
      },
      showDetails: {
        type: "boolean",
        label: "Show Award Details",
        default: true,
      },
      showRunnerUp: { type: "boolean", label: "Show Runner-up", default: true },
    },
    defaultProps: {
      showYears: 5,
      showDetails: true,
      showRunnerUp: true,
    },
    requiresData: ["awards", "brackets"],
    tags: ["awards", "champions", "history"],
  },

  records: {
    component: Records,
    name: "League Records",
    category: "Historical",
    description: "All-time league records and statistics",
    configurable: {
      recordType: {
        type: "select",
        label: "Record Type",
        options: ["all-time", "season", "weekly"],
        default: "all-time",
      },
      showDetails: {
        type: "boolean",
        label: "Show Record Details",
        default: true,
      },
      showTop: {
        type: "number",
        label: "Show Top N Records",
        default: 10,
        min: 5,
        max: 25,
      },
    },
    defaultProps: {
      recordType: "all-time",
      showDetails: true,
      showTop: 10,
    },
    requiresData: ["matchups", "rosters", "managers"],
    tags: ["records", "statistics", "achievements"],
  },

  // === CHART COMPONENTS ===
  "bar-chart": {
    component: BarChart,
    name: "Bar Chart",
    category: "Charts",
    description: "Interactive bar chart for data visualization",
    configurable: {
      title: { type: "text", label: "Chart Title", default: "Data Chart" },
      height: {
        type: "number",
        label: "Chart Height (px)",
        default: 300,
        min: 200,
        max: 600,
      },
      showLegend: { type: "boolean", label: "Show Legend", default: true },
      animated: { type: "boolean", label: "Animated Bars", default: true },
    },
    defaultProps: {
      title: "Data Chart",
      height: 300,
      showLegend: true,
      animated: true,
    },
    requiresData: ["custom"],
    tags: ["chart", "bar", "visualization"],
  },

  "enhanced-bar-chart": {
    component: EnhancedBarChart,
    name: "Enhanced Bar Chart",
    category: "Charts",
    description: "Advanced bar chart with multiple data series",
    configurable: {
      title: { type: "text", label: "Chart Title", default: "Enhanced Chart" },
      height: {
        type: "number",
        label: "Chart Height (px)",
        default: 400,
        min: 250,
        max: 700,
      },
      showGridlines: {
        type: "boolean",
        label: "Show Grid Lines",
        default: true,
      },
      showTooltips: { type: "boolean", label: "Show Tooltips", default: true },
    },
    defaultProps: {
      title: "Enhanced Chart",
      height: 400,
      showGridlines: true,
      showTooltips: true,
    },
    requiresData: ["custom"],
    tags: ["chart", "enhanced", "advanced"],
  },

  "radar-chart": {
    component: RadarChart,
    name: "Radar Chart",
    category: "Charts",
    description: "Multi-dimensional radar/spider chart",
    configurable: {
      title: { type: "text", label: "Chart Title", default: "Radar Analysis" },
      size: {
        type: "number",
        label: "Chart Size (px)",
        default: 300,
        min: 200,
        max: 500,
      },
      showLabels: { type: "boolean", label: "Show Axis Labels", default: true },
      fillOpacity: {
        type: "number",
        label: "Fill Opacity",
        default: 0.3,
        min: 0,
        max: 1,
        step: 0.1,
      },
    },
    defaultProps: {
      title: "Radar Analysis",
      size: 300,
      showLabels: true,
      fillOpacity: 0.3,
    },
    requiresData: ["custom"],
    tags: ["chart", "radar", "spider", "analysis"],
  },

  "trend-chart": {
    component: TrendChart,
    name: "Trend Chart",
    category: "Charts",
    description: "Line chart showing trends over time",
    configurable: {
      title: { type: "text", label: "Chart Title", default: "Trend Analysis" },
      height: {
        type: "number",
        label: "Chart Height (px)",
        default: 350,
        min: 200,
        max: 600,
      },
      showPoints: { type: "boolean", label: "Show Data Points", default: true },
      smooth: { type: "boolean", label: "Smooth Lines", default: true },
    },
    defaultProps: {
      title: "Trend Analysis",
      height: 350,
      showPoints: true,
      smooth: true,
    },
    requiresData: ["custom"],
    tags: ["chart", "trend", "line", "time-series"],
  },

  // === LAYOUT COMPONENTS ===
  pagination: {
    component: Pagination,
    name: "Pagination",
    category: "Layout",
    description: "Page navigation for long content lists",
    configurable: {
      itemsPerPage: {
        type: "number",
        label: "Items Per Page",
        default: 10,
        min: 5,
        max: 50,
      },
      showFirstLast: {
        type: "boolean",
        label: "Show First/Last Buttons",
        default: true,
      },
      showPageNumbers: {
        type: "boolean",
        label: "Show Page Numbers",
        default: true,
      },
    },
    defaultProps: {
      itemsPerPage: 10,
      showFirstLast: true,
      showPageNumbers: true,
    },
    requiresData: [],
    tags: ["pagination", "navigation", "layout"],
  },

  footer: {
    component: Footer,
    name: "Page Footer",
    category: "Layout",
    description: "Footer with league information and links",
    configurable: {
      showCredits: {
        type: "boolean",
        label: "Show League Page Credits",
        default: true,
      },
      showSocialLinks: {
        type: "boolean",
        label: "Show Social Links",
        default: false,
      },
      customText: { type: "text", label: "Custom Footer Text", default: "" },
    },
    defaultProps: {
      showCredits: true,
      showSocialLinks: false,
      customText: "",
    },
    requiresData: [],
    tags: ["footer", "layout", "credits"],
  },
};

/**
 * Scan the file system (mock) and return any custom Svelte components not explicitly configured in the registry.
 *
 * @returns {Object[]} Discovered components metadata.
 */
export function discoverUnregisteredComponents() {
  // This would scan the file system for .svelte files
  // For now, we return a list of known unregistered components
  const discoveredComponents = [
    {
      path: "$lib/AnalyticsDashboard.svelte",
      name: "Analytics Dashboard",
      category: "Analytics",
      description: "Comprehensive analytics dashboard for league insights",
    },
    {
      path: "$lib/CacheManager.svelte",
      name: "Cache Manager",
      category: "System",
      description: "Manage data caching and performance",
    },
    {
      path: "$lib/CacheStatusIndicator.svelte",
      name: "Cache Status",
      category: "System",
      description: "Show current cache status",
    },
  ];

  return discoveredComponents;
}

/**
 * Groups and returns registry components organized by display category.
 *
 * @returns {Object} Grouped categories dictionary.
 */
export function getComponentsByCategory() {
  const categories = {};

  Object.entries(componentRegistry).forEach(([key, config]) => {
    const category = config.category;
    if (!categories[category]) {
      categories[category] = {
        name: category,
        components: [],
        count: 0,
      };
    }
    categories[category].components.push({
      key,
      ...config,
    });
    categories[category].count++;
  });

  // Sort categories by priority
  const categoryOrder = [
    "Content",
    "League Data",
    "Managers",
    "Historical",
    "Charts",
    "Layout",
    "System",
  ];
  const sortedCategories = {};

  categoryOrder.forEach((cat) => {
    if (categories[cat]) {
      sortedCategories[cat] = categories[cat];
    }
  });

  // Add any remaining categories
  Object.keys(categories).forEach((cat) => {
    if (!sortedCategories[cat]) {
      sortedCategories[cat] = categories[cat];
    }
  });

  return sortedCategories;
}

/**
 * Performs a search filtering components by matching names, descriptions, categories, or tags.
 *
 * @param {string} query - The search query term.
 * @returns {Object[]} Sorted list of matched components with relevance scoring metrics.
 */
export function searchComponents(query) {
  const searchQuery = query.toLowerCase();
  const results = [];

  Object.entries(componentRegistry).forEach(([key, config]) => {
    const searchableText = [
      config.name,
      config.description,
      config.category,
      ...(config.tags || []),
    ]
      .join(" ")
      .toLowerCase();

    if (searchableText.includes(searchQuery)) {
      results.push({
        key,
        ...config,
        relevance: calculateRelevance(searchQuery, config),
      });
    }
  });

  return results.sort((a, b) => b.relevance - a.relevance);
}

/**
 * Calculates a search relevance match score.
 *
 * @param {string} query - Lowcase query term.
 * @param {Object} config - Component configuration metadata.
 * @returns {number} Derived score.
 */
function calculateRelevance(query, config) {
  let score = 0;
  const queryLower = query.toLowerCase();

  // Exact name match gets highest score
  if (config.name.toLowerCase().includes(queryLower)) score += 100;

  // Category match
  if (config.category.toLowerCase().includes(queryLower)) score += 50;

  // Tag matches
  if (config.tags) {
    config.tags.forEach((tag) => {
      if (tag.toLowerCase().includes(queryLower)) score += 25;
    });
  }

  // Description match
  if (config.description.toLowerCase().includes(queryLower)) score += 10;

  return score;
}

/**
 * Retrieves components that require the specified data type (e.g. 'news', 'rosters').
 *
 * @param {string} dataType - Target data constraint.
 * @returns {Object[]} Filtered list of matching component objects.
 */
export function getComponentsByDataRequirement(dataType) {
  return Object.entries(componentRegistry)
    .filter(
      ([key, config]) =>
        config.requiresData && config.requiresData.includes(dataType),
    )
    .map(([key, config]) => ({ key, ...config }));
}

/**
 * Retrieves a component configuration by its unique registry key.
 *
 * @param {string} key - Unique registry key.
 * @returns {Object|null} Component config definition or null.
 */
export function getComponentConfig(key) {
  return componentRegistry[key] || null;
}

/**
 * Compiles a list of component keys grouped by category.
 *
 * @returns {Object} Mapped categories to component keys.
 */
export function getAllComponentKeys() {
  const byCategory = {};
  Object.entries(componentRegistry).forEach(([key, config]) => {
    if (!byCategory[config.category]) byCategory[config.category] = [];
    byCategory[config.category].push(key);
  });
  return byCategory;
}

/**
 * Validates a map of properties against the component's custom configurable settings.
 *
 * @param {string} componentKey - Target component identifier key.
 * @param {Object} props - Properties dictionary to validate.
 * @returns {Object} Object indicating valid state, error reasons, and warning strings.
 */
export function validateComponentProps(componentKey, props) {
  const config = componentRegistry[componentKey];
  if (!config)
    return { valid: false, errors: [`Unknown component: ${componentKey}`] };

  const errors = [];
  const warnings = [];
  const configurable = config.configurable || {};

  Object.entries(configurable).forEach(([propKey, propConfig]) => {
    const value = props[propKey];

    // Check required props
    if (propConfig.required && (value === undefined || value === null)) {
      errors.push(`Required prop '${propKey}' is missing`);
      return;
    }

    // Type validation with detailed messages
    if (value !== undefined) {
      switch (propConfig.type) {
        case "number":
          if (typeof value !== "number" || isNaN(value)) {
            errors.push(`Prop '${propKey}' must be a valid number`);
          } else {
            if (propConfig.min !== undefined && value < propConfig.min) {
              errors.push(
                `Prop '${propKey}' must be at least ${propConfig.min}`,
              );
            }
            if (propConfig.max !== undefined && value > propConfig.max) {
              errors.push(
                `Prop '${propKey}' must be at most ${propConfig.max}`,
              );
            }
          }
          break;
        case "boolean":
          if (typeof value !== "boolean") {
            errors.push(`Prop '${propKey}' must be true or false`);
          }
          break;
        case "select":
          if (!propConfig.options.includes(value)) {
            errors.push(
              `Prop '${propKey}' must be one of: ${propConfig.options.join(", ")}`,
            );
          }
          break;
        case "multi-select":
          if (!Array.isArray(value)) {
            errors.push(`Prop '${propKey}' must be an array`);
          } else {
            const invalidOptions = value.filter(
              (v) => !propConfig.options.includes(v),
            );
            if (invalidOptions.length > 0) {
              errors.push(
                `Invalid options for '${propKey}': ${invalidOptions.join(", ")}`,
              );
            }
          }
          break;
        case "text":
        case "rich-text":
          if (typeof value !== "string") {
            errors.push(`Prop '${propKey}' must be a text string`);
          } else if (
            propConfig.maxLength &&
            value.length > propConfig.maxLength
          ) {
            warnings.push(
              `Prop '${propKey}' is longer than recommended (${propConfig.maxLength} chars)`,
            );
          }
          break;
      }
    }
  });

  return {
    valid: errors.length === 0,
    errors,
    warnings,
  };
}

/**
 * Returns descriptive statistics on the size and complexity of the current registry.
 *
 * @returns {Object} Aggregated stats metrics.
 */
export function getRegistryStats() {
  const stats = {
    totalComponents: Object.keys(componentRegistry).length,
    categoryCounts: {},
    dataRequirements: {},
    configurableComponents: 0,
  };

  Object.values(componentRegistry).forEach((config) => {
    // Category counts
    stats.categoryCounts[config.category] =
      (stats.categoryCounts[config.category] || 0) + 1;

    // Data requirements
    if (config.requiresData) {
      config.requiresData.forEach((dataType) => {
        stats.dataRequirements[dataType] =
          (stats.dataRequirements[dataType] || 0) + 1;
      });
    }

    // Configurable components
    if (config.configurable && Object.keys(config.configurable).length > 0) {
      stats.configurableComponents++;
    }
  });

  return stats;
}
