// Page Layout Configuration System
// Extends leagueInfo.js to include visual page builder settings

/**
 * Default Page Layouts - these define which components appear on each page
 * and in what order, with their configuration settings
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
 * Page Layout Manager - handles saving and loading page configurations
 */
export class PageLayoutManager {
  constructor() {
    this.layouts = { ...defaultPageLayouts };
  }

  /**
   * Get layout for a specific page
   */
  getPageLayout(pageName) {
    return this.layouts[pageName] || null;
  }

  /**
   * Update layout for a specific page
   */
  updatePageLayout(pageName, layout) {
    this.layouts[pageName] = layout;
    return this.saveToLeagueInfo();
  }

  /**
   * Add a section to a page
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
   * Remove a section from a page
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
   * Update section configuration
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
   * Reorder sections on a page
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
   * Export layouts to format compatible with leagueInfo.js
   */
  exportToLeagueInfo() {
    return {
      // Add this to leagueInfo.js
      pageLayouts: this.layouts,
    };
  }

  /**
   * Load layouts from leagueInfo.js format
   */
  loadFromLeagueInfo(pageLayouts) {
    if (pageLayouts && typeof pageLayouts === "object") {
      this.layouts = { ...defaultPageLayouts, ...pageLayouts };
    }
    return this.layouts;
  }

  /**
   * Generate configuration code for leagueInfo.js
   */
  generateLeagueInfoCode() {
    return `
// Visual Page Builder Configuration
// This section is managed by the visual page builder
export const pageLayouts = ${JSON.stringify(this.layouts, null, 2)};
`;
  }

  /**
   * Save to leagueInfo.js (placeholder - will be implemented with file system access)
   */
  saveToLeagueInfo() {
    // This will be implemented when we build the save functionality
    console.log("Layout saved:", this.layouts);
    return true;
  }

  /**
   * Get enabled sections for a page in display order
   */
  getEnabledSections(pageName) {
    if (!this.layouts[pageName]) return [];

    return this.layouts[pageName].sections
      .filter((section) => section.enabled)
      .sort((a, b) => a.order - b.order);
  }

  /**
   * Get all sections for a page (including disabled)
   */
  getAllSections(pageName) {
    if (!this.layouts[pageName]) return [];

    return this.layouts[pageName].sections.sort((a, b) => a.order - b.order);
  }
}

/**
 * Default instance for use throughout the app
 */
export const pageLayoutManager = new PageLayoutManager();
