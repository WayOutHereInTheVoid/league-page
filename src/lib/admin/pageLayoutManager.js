// Page Layout Configuration System
// Extends leagueInfo.js to include visual page builder settings

/**
 * Default Page Layouts - these define which components appear on each page
 * and in what order, with their configuration settings.
 *
 * @type {Object}
 */
export const defaultPageLayouts = {
  homepage: {
    name: "Homepage",
    description: "Main landing page for your league",
    sections: [
      {
        id: "intro-text",
        component: "homepage-text",
        props: {
          text: null, // Will use homepageText from leagueInfo.js
        },
        enabled: true,
        order: 1,
      },
      {
        id: "power-rankings",
        component: "power-rankings",
        props: {
          animated: true,
          showTrend: true,
          chartHeight: 400,
        },
        enabled: true,
        order: 2,
      },
      {
        id: "current-champ",
        component: "awards",
        props: {
          showYears: 1,
          showDetails: true,
        },
        enabled: true,
        order: 3,
      },
      {
        id: "recent-transactions",
        component: "transactions",
        props: {
          limit: 10,
          showTypes: ["trade", "waiver", "free_agent"],
          showDate: true,
        },
        enabled: true,
        order: 4,
      },
      {
        id: "blog-preview",
        component: "blog-post",
        props: {
          showExcerpt: true,
          maxExcerptLength: 200,
        },
        enabled: false, // Disabled by default, user can enable if they have blog
        order: 5,
      },
    ],
  },

  managers: {
    name: "Managers Page",
    description: "All manager profiles and information",
    sections: [
      {
        id: "all-managers-grid",
        component: "all-managers",
        props: {
          layout: "grid",
          showBio: true,
          showStats: true,
          photosPerRow: 3,
        },
        enabled: true,
        order: 1,
      },
      {
        id: "manager-rivalries",
        component: "rivalry",
        props: {
          showStats: true,
          animated: true,
        },
        enabled: false, // Optional component user can add
        order: 2,
      },
      {
        id: "manager-records",
        component: "records",
        props: {
          recordType: "all-time",
          showDetails: true,
        },
        enabled: false, // Optional component user can add
        order: 3,
      },
    ],
  },
};

/**
 * Page Layout Manager - handles saving and loading page configurations.
 */
export class PageLayoutManager {
  /**
   * Instantiates a PageLayoutManager with copies of default layouts.
   *
   * @constructor
   */
  constructor() {
    this.layouts = { ...defaultPageLayouts };
  }

  /**
   * Get layout configuration for a specific page.
   *
   * @param {string} pageName - The page name.
   * @returns {Object|null} Layout definition or null.
   */
  getPageLayout(pageName) {
    return this.layouts[pageName] || null;
  }

  /**
   * Update layout for a specific page.
   *
   * @param {string} pageName - Name of the page.
   * @param {Object} layout - Layout settings object.
   * @returns {boolean} True if successfully saved.
   */
  updatePageLayout(pageName, layout) {
    this.layouts[pageName] = layout;
    return this.saveToLeagueInfo();
  }

  /**
   * Adds a section component configuration to a page.
   *
   * @param {string} pageName - Name of the target page.
   * @param {Object} section - Section configuration object.
   * @returns {boolean} True on success.
   */
  addSection(pageName, section) {
    if (!this.layouts[pageName]) {
      this.layouts[pageName] = {
        name: pageName,
        description: "",
        sections: [],
      };
    }

    const newSection = {
      id: `section-${Date.now()}`,
      component: section.component,
      props: { ...section.props },
      enabled: section.enabled !== false,
      order: this.layouts[pageName].sections.length + 1,
    };

    this.layouts[pageName].sections.push(newSection);
    return this.saveToLeagueInfo();
  }

  /**
   * Removes a section component configuration from a page.
   *
   * @param {string} pageName - Name of page.
   * @param {string} sectionId - Section ID.
   * @returns {boolean} True on success.
   */
  removeSection(pageName, sectionId) {
    if (!this.layouts[pageName]) return false;

    const sectionIndex = this.layouts[pageName].sections.findIndex(
      (s) => s.id === sectionId,
    );
    if (sectionIndex === -1) return false;

    this.layouts[pageName].sections.splice(sectionIndex, 1);

    // Reorder remaining sections
    this.layouts[pageName].sections.forEach((section, index) => {
      section.order = index + 1;
    });

    return this.saveToLeagueInfo();
  }

  /**
   * Updates properties of an existing page section.
   *
   * @param {string} pageName - Name of page.
   * @param {string} sectionId - Section ID.
   * @param {Object} updates - Updated properties.
   * @returns {boolean} True on success.
   */
  updateSection(pageName, sectionId, updates) {
    if (!this.layouts[pageName]) return false;

    const section = this.layouts[pageName].sections.find(
      (s) => s.id === sectionId,
    );
    if (!section) return false;

    // Update section properties
    Object.assign(section, updates);

    return this.saveToLeagueInfo();
  }

  /**
   * Reorders existing sections on a page.
   *
   * @param {string} pageName - Name of page.
   * @param {string[]} sectionIds - Ordered array of section IDs.
   * @returns {boolean} True on success.
   */
  reorderSections(pageName, sectionIds) {
    if (!this.layouts[pageName]) return false;

    const sections = this.layouts[pageName].sections;
    const reorderedSections = [];

    sectionIds.forEach((sectionId, index) => {
      const section = sections.find((s) => s.id === sectionId);
      if (section) {
        section.order = index + 1;
        reorderedSections.push(section);
      }
    });

    this.layouts[pageName].sections = reorderedSections;
    return this.saveToLeagueInfo();
  }

  /**
   * Exports layouts to format compatible with leagueInfo.js.
   *
   * @returns {Object} Exported settings.
   */
  exportToLeagueInfo() {
    return {
      // Add this to leagueInfo.js
      pageLayouts: this.layouts,
    };
  }

  /**
   * Loads configurations from exported settings format.
   *
   * @param {Object} pageLayouts - Raw pageLayouts object.
   * @returns {Object} Loaded layout definitions.
   */
  loadFromLeagueInfo(pageLayouts) {
    if (pageLayouts && typeof pageLayouts === "object") {
      this.layouts = { ...defaultPageLayouts, ...pageLayouts };
    }
    return this.layouts;
  }

  /**
   * Generates javascript configuration code representing current layouts.
   *
   * @returns {string} Config code.
   */
  generateLeagueInfoCode() {
    return `
// Visual Page Builder Configuration
// This section is managed by the visual page builder
export const pageLayouts = ${JSON.stringify(this.layouts, null, 2)};
`;
  }

  /**
   * Saves layouts list to local storage or mock files.
   *
   * @returns {boolean} Always true.
   */
  saveToLeagueInfo() {
    // This will be implemented when we build the save functionality
    console.log("Layout saved:", this.layouts);
    return true;
  }

  /**
   * Filter and return enabled sections of a page sorted by display order.
   *
   * @param {string} pageName - Target page.
   * @returns {Object[]} Enabled section configurations.
   */
  getEnabledSections(pageName) {
    if (!this.layouts[pageName]) return [];

    return this.layouts[pageName].sections
      .filter((section) => section.enabled)
      .sort((a, b) => a.order - b.order);
  }

  /**
   * Returns all sections of a page sorted by display order.
   *
   * @param {string} pageName - Target page.
   * @returns {Object[]} All section configurations.
   */
  getAllSections(pageName) {
    if (!this.layouts[pageName]) return [];

    return this.layouts[pageName].sections.sort((a, b) => a.order - b.order);
  }
}

/**
 * Default singleton instance of PageLayoutManager.
 * @type {PageLayoutManager}
 */
export const pageLayoutManager = new PageLayoutManager();
