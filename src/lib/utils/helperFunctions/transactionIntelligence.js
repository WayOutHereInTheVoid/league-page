/**
 * Enhanced Transaction Intelligence System for Phase 3.1
 * Provides sophisticated transaction analysis and grid placement algorithms
 */

/**
 * Analyzes transaction complexity for intelligent grid placement
 * @param {Object} transaction - The transaction object
 * @returns {string} - Complexity level: 'high', 'medium', or 'low'
 */
export const analyzeTransactionComplexity = (transaction) => {
  if (transaction.type === "trade") {
    // Count total assets involved
    const totalPlayers = transaction.moves.reduce((total, move) => {
      return total + move.filter((item) => item && item.player).length;
    }, 0);

    const totalTeams = transaction.rosters ? transaction.rosters.length : 0;
    const hasDraftPicks = transaction.moves.some((move) =>
      move.some((item) => item && item.draftPick),
    );

    // Check for FAAB budget trades
    const hasFAAB = transaction.moves.some((move) =>
      move.some((item) => item && item.waiver_budget && item.waiver_budget > 0),
    );

    // Advanced complexity scoring (0-15 scale)
    let complexity = 0;
    complexity += totalPlayers * 1.5; // Player count impact
    complexity += Math.max(totalTeams - 2, 0) * 3; // Multi-team bonus
    complexity += hasDraftPicks ? 4 : 0; // Draft pick complexity
    complexity += hasFAAB ? 3 : 0; // FAAB complexity

    // Advanced trade value estimation
    const estimatedValue =
      totalPlayers * 2 + (hasDraftPicks ? 5 : 0) + (hasFAAB ? 3 : 0);

    // Return enhanced complexity analysis
    if (complexity >= 10 || estimatedValue >= 12) return "high";
    if (complexity >= 6 || estimatedValue >= 8) return "medium";
    return "low";
  }

  if (transaction.type === "waiver") {
    const hasBid =
      transaction.moves[0] &&
      transaction.moves[0][0] &&
      transaction.moves[0][0].bid;
    const bidAmount = hasBid ? transaction.moves[0][0].bid : 0;

    // Enhanced waiver complexity analysis
    const totalMoves = transaction.moves.reduce((total, move) => {
      return total + move.length;
    }, 0);

    // Multiple add/drops in one transaction
    if (totalMoves >= 4) return "medium";
    if (bidAmount >= 25) return "medium";
    if (bidAmount >= 15) return "low";
    return "low";
  }

  return "low";
};

/**
 * Smart grid assignment algorithm with enhanced balancing
 * @param {Array} transactions - Array of transaction objects
 * @param {boolean} isDesktop - Whether the layout is for desktop
 * @returns {Array} - Transactions with grid placement data
 */
export const assignGridPlacement = (transactions, isDesktop = false) => {
  // Always use single column for non-desktop or small transaction counts
  if (!isDesktop || transactions.length <= 2) {
    return transactions.map((transaction, index) => ({
      ...transaction,
      gridColumn: 1,
      gridSpan: 1,
      complexity: analyzeTransactionComplexity(transaction),
    }));
  }

  const analyzed = transactions.map((transaction) => ({
    ...transaction,
    complexity: analyzeTransactionComplexity(transaction),
  }));

  // Enhanced 2-column assignment with visual balance optimization
  const assigned = [];
  let leftColumnWeight = 0;
  let rightColumnWeight = 0;
  let leftColumnItems = 0;
  let rightColumnItems = 0;

  const complexityWeights = {
    high: 4,
    medium: 2.5,
    low: 1,
  };

  // Sort by complexity for better distribution
  const sortedTransactions = [...analyzed].sort((a, b) => {
    const weightA = complexityWeights[a.complexity];
    const weightB = complexityWeights[b.complexity];
    return weightB - weightA; // High complexity first
  });

  sortedTransactions.forEach((transaction, index) => {
    const weight = complexityWeights[transaction.complexity];

    // Enhanced placement algorithm considering both weight and visual balance
    const leftScore = leftColumnWeight + leftColumnItems * 0.3;
    const rightScore = rightColumnWeight + rightColumnItems * 0.3;

    if (leftScore <= rightScore) {
      assigned.push({
        ...transaction,
        gridColumn: 1,
        gridSpan: 1,
        placementReason: `Left: ${leftScore.toFixed(1)} vs Right: ${rightScore.toFixed(1)}`,
      });
      leftColumnWeight += weight;
      leftColumnItems++;
    } else {
      assigned.push({
        ...transaction,
        gridColumn: 2,
        gridSpan: 1,
        placementReason: `Left: ${leftScore.toFixed(1)} vs Right: ${rightScore.toFixed(1)}`,
      });
      rightColumnWeight += weight;
      rightColumnItems++;
    }
  });

  // Restore original order while keeping grid assignments
  const finalAssigned = analyzed.map((originalTx) => {
    const assignedTx = assigned.find((tx) => tx.id === originalTx.id);
    return assignedTx || originalTx;
  });

  return finalAssigned;
};

/**
 * Calculate transaction impact metrics for enhanced visualization
 * @param {Object} transaction - The transaction object
 * @returns {Object} - Impact metrics including value, risk, and complexity scores
 */
export const calculateTransactionImpact = (transaction) => {
  const complexity = analyzeTransactionComplexity(transaction);

  if (transaction.type === "trade") {
    const totalPlayers = transaction.moves.reduce((total, move) => {
      return total + move.filter((item) => item && item.player).length;
    }, 0);

    const hasDraftPicks = transaction.moves.some((move) =>
      move.some((item) => item && item.draftPick),
    );

    return {
      complexity,
      valueScore: totalPlayers * 2 + (hasDraftPicks ? 5 : 0),
      riskScore: complexity === "high" ? 8 : complexity === "medium" ? 5 : 2,
      visualWeight:
        complexity === "high" ? 4 : complexity === "medium" ? 2.5 : 1,
    };
  }

  if (transaction.type === "waiver") {
    const bidAmount = transaction.moves[0]?.[0]?.bid || 0;

    return {
      complexity,
      valueScore: bidAmount / 5,
      riskScore: bidAmount >= 20 ? 6 : bidAmount >= 10 ? 3 : 1,
      visualWeight: complexity === "medium" ? 2 : 1,
    };
  }

  return {
    complexity,
    valueScore: 1,
    riskScore: 1,
    visualWeight: 1,
  };
};

/**
 * Generate performance insights for grid layout optimization
 * @param {Array} transactions - Array of processed transactions
 * @returns {Object} - Performance metrics and optimization suggestions
 */
export const generateGridPerformanceInsights = (transactions) => {
  const complexityDistribution = transactions.reduce((dist, tx) => {
    dist[tx.complexity] = (dist[tx.complexity] || 0) + 1;
    return dist;
  }, {});

  const columnDistribution = transactions.reduce((dist, tx) => {
    const col = tx.gridColumn || 1;
    dist[col] = (dist[col] || 0) + 1;
    return dist;
  }, {});

  return {
    totalTransactions: transactions.length,
    complexityDistribution,
    columnDistribution,
    balanceScore: Math.abs(
      (columnDistribution[1] || 0) - (columnDistribution[2] || 0),
    ),
    recommendations: {
      useGrid: transactions.length >= 4,
      balanceQuality:
        Math.abs((columnDistribution[1] || 0) - (columnDistribution[2] || 0)) <=
        2
          ? "good"
          : "needs_improvement",
    },
  };
};
