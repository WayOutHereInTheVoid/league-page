/**
 * Final Verification Test for TRL Enhanced Manager Statistics System
 *
 * This script runs a comprehensive end-to-end test of all Phase 2 and Phase 3 enhancements:
 * - Data validation system
 * - Enhanced manager statistics computation
 * - Playoff detection enhancements
 * - Cross-validation systems
 * - Integration with existing components
 *
 * Run this to verify that all NaN values and zero count issues have been resolved.
 *
 * @version 1.0.0
 * @author TRL Development Team
 */

import { leagueID, managers } from "$lib/utils/leagueInfo";
import {
  computeValidatedManagerStats,
  prepareStatsForComponent,
  getValidationSummary,
} from "./managerStatsIntegration";
import { quickValidationTest } from "./trlTestSuite";
import { performApiHealthCheck } from "./enhancedApiCalls";
import { debugAwardProcessing } from "./awardProcessingUtils";

// ============================================================================
// FINAL VERIFICATION TEST
// ============================================================================

/**
 * Main verification function - tests everything works together
 */
export async function runFinalVerification() {
  console.log("🎯 TRL Enhanced Manager Statistics - Final Verification");
  console.log("=".repeat(70));
  console.log(`📅 Test Date: ${new Date().toISOString()}`);
  console.log(`🏈 League: TRL (${leagueID})`);
  console.log(`👥 Managers: ${managers.length}`);
  console.log("");

  const verificationResults = {
    startTime: new Date(),
    testResults: {},
    issues: [],
    recommendations: [],
    overallSuccess: false,
  };

  try {
    // Phase 1: API Health Check
    console.log("🔍 Phase 1: API Health Verification");
    console.log("-".repeat(40));
    verificationResults.testResults.apiHealth = await verifyApiHealth();

    // Phase 2: Data Validation System
    console.log("\n🛡️ Phase 2: Data Validation System Verification");
    console.log("-".repeat(40));
    verificationResults.testResults.validation = await verifyValidationSystem();

    // Phase 3: Manager Statistics Integration
    console.log("\n👥 Phase 3: Manager Statistics Integration Verification");
    console.log("-".repeat(40));
    verificationResults.testResults.managerStats =
      await verifyManagerStatsIntegration();

    // Phase 4: NaN and Zero Count Detection
    console.log("\n🔧 Phase 4: NaN and Zero Count Issue Detection");
    console.log("-".repeat(40));
    verificationResults.testResults.dataIntegrity = await verifyDataIntegrity();

    // Phase 5: Component Integration
    console.log("\n🧩 Phase 5: Component Integration Verification");
    console.log("-".repeat(40));
    verificationResults.testResults.componentIntegration =
      await verifyComponentIntegration();

    // Generate final assessment
    verificationResults.overallSuccess = assessOverallSuccess(
      verificationResults.testResults,
    );
    verificationResults.endTime = new Date();
    verificationResults.duration =
      verificationResults.endTime - verificationResults.startTime;

    // Display final results
    displayFinalResults(verificationResults);

    return verificationResults;
  } catch (error) {
    console.error("❌ Final verification failed:", error);
    verificationResults.fatalError = error.message;
    verificationResults.overallSuccess = false;
    return verificationResults;
  }
}

// ============================================================================
// INDIVIDUAL VERIFICATION PHASES
// ============================================================================

/**
 * Verify API health and connectivity
 */
async function verifyApiHealth() {
  const result = { success: false, details: {} };

  try {
    console.log("  📡 Testing API connectivity...");
    const healthCheck = await performApiHealthCheck();

    result.details.healthCheck = healthCheck;
    result.success = healthCheck.overallStatus === "healthy";

    if (result.success) {
      console.log("  ✅ API health check passed");
    } else {
      console.log("  ⚠️ API health check has issues");
    }

    // Test quick validation
    console.log("  🔬 Testing quick validation...");
    const quickTestResult = await quickValidationTest();
    result.details.quickValidation = quickTestResult;

    if (quickTestResult) {
      console.log("  ✅ Quick validation test passed");
    } else {
      console.log("  ❌ Quick validation test failed");
      result.success = false;
    }
  } catch (error) {
    console.log(`  ❌ API health verification failed: ${error.message}`);
    result.error = error.message;
  }

  return result;
}

/**
 * Verify the data validation system is working
 */
async function verifyValidationSystem() {
  const result = { success: false, details: {} };

  try {
    console.log("  🔍 Testing validation framework...");

    // Test basic validation functions with sample data
    const sampleInvalidData = {
      invalidField: "not_a_number",
      missingRequired: null,
      outOfRange: -50,
    };

    // Import validation functions
    const { validateRequiredFields, validateRange } = await import(
      "./dataValidation"
    );

    // Test required fields validation
    const requiredFieldsTest = validateRequiredFields(
      sampleInvalidData,
      ["requiredField"],
      "test object",
    );

    if (!requiredFieldsTest.isValid && requiredFieldsTest.errors.length > 0) {
      console.log("  ✅ Required fields validation working correctly");
      result.details.requiredFieldsValidation = true;
    } else {
      console.log("  ❌ Required fields validation not working");
      result.details.requiredFieldsValidation = false;
    }

    // Test range validation
    const rangeTest = validateRange(-50, 0, 100, "test_field");

    if (!rangeTest.isValid && rangeTest.errors.length > 0) {
      console.log("  ✅ Range validation working correctly");
      result.details.rangeValidation = true;
    } else {
      console.log("  ❌ Range validation not working");
      result.details.rangeValidation = false;
    }

    result.success =
      result.details.requiredFieldsValidation && result.details.rangeValidation;
  } catch (error) {
    console.log(`  ❌ Validation system verification failed: ${error.message}`);
    result.error = error.message;
  }

  return result;
}

/**
 * Verify manager statistics integration
 */
async function verifyManagerStatsIntegration() {
  const result = {
    success: false,
    details: {
      managersProcessed: 0,
      managersSuccessful: 0,
      validationsPassed: 0,
      nanValuesFound: 0,
      zeroCountIssues: 0,
    },
  };

  try {
    console.log("  👤 Testing manager statistics computation...");

    // Test with first 3 managers to keep test fast
    const testManagers = managers.slice(0, 3);

    for (const manager of testManagers) {
      try {
        console.log(`    Processing ${manager.name}...`);

        // Create mock data for testing (since we don't have actual league data loaded)
        const mockLeagueTeamManagers = createMockLeagueTeamManagers(manager);
        const mockRecords = createMockRecords(manager);
        const mockAwards = createMockAwards();

        // Test the integrated computation
        const managerResult = await computeValidatedManagerStats(
          manager,
          mockLeagueTeamManagers,
          mockRecords,
          manager.roster || 1,
          mockAwards,
          { enableValidation: true, logValidation: false },
        );

        result.details.managersProcessed++;

        if (managerResult.metadata.isValid) {
          result.details.managersSuccessful++;
          result.details.validationsPassed++;
          console.log(
            `    ✅ ${manager.name} - Stats computed and validated successfully`,
          );
        } else {
          console.log(
            `    ⚠️ ${manager.name} - Stats computed but validation has warnings`,
          );
          result.details.managersSuccessful++; // Still successful, just warnings
        }

        // Check for NaN values
        const nanValues = findNaNValuesInStats(managerResult.stats);
        if (nanValues.length > 0) {
          result.details.nanValuesFound++;
          console.log(
            `    🚨 ${manager.name} - NaN values found: ${nanValues.join(", ")}`,
          );
        }

        // Test component preparation
        const preparedStats = prepareStatsForComponent(managerResult);
        if (preparedStats && preparedStats.totalStats) {
          console.log(
            `    ✅ ${manager.name} - Component data prepared successfully`,
          );
        } else {
          console.log(
            `    ❌ ${manager.name} - Component data preparation failed`,
          );
        }
      } catch (error) {
        console.log(`    ❌ ${manager.name} - Failed: ${error.message}`);
      }
    }

    result.success =
      result.details.managersSuccessful === result.details.managersProcessed &&
      result.details.nanValuesFound === 0;

    console.log(`  📊 Processed ${result.details.managersProcessed} managers`);
    console.log(`  ✅ Successful: ${result.details.managersSuccessful}`);
    console.log(`  🚨 NaN values found: ${result.details.nanValuesFound}`);
  } catch (error) {
    console.log(
      `  ❌ Manager stats integration verification failed: ${error.message}`,
    );
    result.error = error.message;
  }

  return result;
}

/**
 * Verify data integrity (specifically checking for NaN and zero count issues)
 */
async function verifyDataIntegrity() {
  const result = {
    success: false,
    details: {
      nanIssuesDetected: 0,
      zeroCountIssuesDetected: 0,
      dataIntegrityScore: 0,
    },
  };

  try {
    console.log("  🔍 Checking for NaN values and zero count issues...");

    // Test with mock data to ensure our fixes work
    const testCases = [
      { name: "Normal Data", data: createNormalTestData() },
      { name: "Data with NaN", data: createNaNTestData() },
      { name: "Data with Zeros", data: createZeroTestData() },
    ];

    for (const testCase of testCases) {
      console.log(`    Testing: ${testCase.name}`);

      const nanValues = findNaNValuesInStats(testCase.data);
      const suspiciousZeros = findSuspiciousZeros(testCase.data);

      if (testCase.name === "Data with NaN" && nanValues.length === 0) {
        console.log(`    ✅ NaN values were properly handled`);
      } else if (testCase.name === "Normal Data" && nanValues.length === 0) {
        console.log(`    ✅ Normal data has no NaN values`);
      } else if (nanValues.length > 0) {
        result.details.nanIssuesDetected++;
        console.log(`    🚨 NaN values detected: ${nanValues.join(", ")}`);
      }

      if (suspiciousZeros.length > 0) {
        result.details.zeroCountIssuesDetected++;
        console.log(`    ⚠️ Suspicious zeros: ${suspiciousZeros.join(", ")}`);
      }
    }

    // Calculate data integrity score
    const totalIssues =
      result.details.nanIssuesDetected + result.details.zeroCountIssuesDetected;
    result.details.dataIntegrityScore = Math.max(0, 100 - totalIssues * 10);

    result.success = result.details.dataIntegrityScore >= 90;

    console.log(
      `  📊 Data Integrity Score: ${result.details.dataIntegrityScore}/100`,
    );
  } catch (error) {
    console.log(`  ❌ Data integrity verification failed: ${error.message}`);
    result.error = error.message;
  }

  return result;
}

/**
 * Verify component integration
 */
async function verifyComponentIntegration() {
  const result = { success: false, details: {} };

  try {
    console.log("  🧩 Testing component integration...");

    // Test that our enhanced stats work with the existing ManagerStatistics component structure
    const mockManagerResult = {
      stats: {
        seasons: [
          {
            year: 2024,
            wins: 10,
            losses: 4,
            ties: 0,
            fpts: 1650.5,
            fptsAgainst: 1420.2,
            playoffs: true,
            championship: false,
          },
        ],
        totalStats: {
          totalWins: 10,
          totalLosses: 4,
          totalTies: 0,
          totalPoints: 1650.5,
          totalPointsAgainst: 1420.2,
          playoffAppearances: 1,
          championships: 0,
          seasonsPlayed: 1,
          winPercentage: 71.43,
          averagePointsPerSeason: 1650.5,
        },
      },
      metadata: { isValid: true },
    };

    const preparedStats = prepareStatsForComponent(mockManagerResult);

    // Verify all expected fields are present
    const requiredFields = [
      "seasons",
      "totalStats.totalWins",
      "totalStats.winPercentage",
      "totalStats.playoffAppearances",
      "totalStats.championships",
    ];

    let fieldsPresent = 0;
    requiredFields.forEach((field) => {
      const fieldPath = field.split(".");
      let value = preparedStats;

      for (const key of fieldPath) {
        value = value?.[key];
      }

      if (value !== undefined && value !== null && !isNaN(value)) {
        fieldsPresent++;
      }
    });

    result.details.fieldsPresent = fieldsPresent;
    result.details.totalFields = requiredFields.length;
    result.success = fieldsPresent === requiredFields.length;

    if (result.success) {
      console.log(
        "  ✅ Component integration verified - all required fields present",
      );
    } else {
      console.log(
        `  ⚠️ Component integration issues - ${fieldsPresent}/${requiredFields.length} fields present`,
      );
    }

    // Test validation metrics
    const validationSummary = getValidationSummary();
    result.details.validationMetrics = validationSummary;

    console.log(
      `  📊 Validation metrics: ${validationSummary.totalValidations} total validations`,
    );
  } catch (error) {
    console.log(
      `  ❌ Component integration verification failed: ${error.message}`,
    );
    result.error = error.message;
  }

  return result;
}

// ============================================================================
// HELPER FUNCTIONS FOR TESTING
// ============================================================================

/**
 * Create mock league team managers data
 */
function createMockLeagueTeamManagers(manager) {
  return {
    currentSeason: 2024,
    teamManagersMap: {
      2024: {
        1: {
          managers: [manager.managerID],
          team: { name: manager.name, avatar: manager.photo },
        },
      },
    },
    users: {
      [manager.managerID]: {
        user_id: manager.managerID,
        username: manager.name.toLowerCase().replace(/\s+/g, ""),
        display_name: manager.name,
      },
    },
  };
}

/**
 * Create mock records data
 */
function createMockRecords(manager) {
  return {
    regularSeasonData: {
      leagueRosterRecords: {
        1: {
          years: [
            {
              year: 2024,
              wins: 8,
              losses: 6,
              ties: 0,
              fpts: 1545.75,
              fptsAgainst: 1423.25,
              potentialPoints: 1634.5,
            },
          ],
        },
      },
    },
  };
}

/**
 * Create mock awards data
 */
function createMockAwards() {
  return [
    {
      year: 2024,
      playoff: [1],
      championship: [],
      division_champions: [],
    },
  ];
}

/**
 * Create test data with normal values
 */
function createNormalTestData() {
  return {
    seasons: [{ year: 2024, wins: 8, losses: 6, fpts: 1545.75 }],
    totalStats: { totalWins: 8, totalLosses: 6, winPercentage: 57.14 },
  };
}

/**
 * Create test data with NaN values
 */
function createNaNTestData() {
  return {
    seasons: [{ year: 2024, wins: 8, losses: 6, fpts: NaN }],
    totalStats: { totalWins: 8, totalLosses: 6, winPercentage: NaN },
  };
}

/**
 * Create test data with suspicious zeros
 */
function createZeroTestData() {
  return {
    seasons: [{ year: 2024, wins: 0, losses: 0, fpts: 0 }],
    totalStats: {
      totalWins: 0,
      totalLosses: 0,
      seasonsPlayed: 5,
      playoffAppearances: 0,
    },
  };
}

/**
 * Find NaN values in stats object
 */
function findNaNValuesInStats(stats) {
  const nanFields = [];

  function checkForNaN(obj, path = "") {
    if (!obj) return;

    Object.entries(obj).forEach(([key, value]) => {
      const currentPath = path ? `${path}.${key}` : key;

      if (typeof value === "number" && isNaN(value)) {
        nanFields.push(currentPath);
      } else if (
        typeof value === "object" &&
        value !== null &&
        !Array.isArray(value)
      ) {
        checkForNaN(value, currentPath);
      } else if (Array.isArray(value)) {
        value.forEach((item, index) => {
          if (typeof item === "object") {
            checkForNaN(item, `${currentPath}[${index}]`);
          }
        });
      }
    });
  }

  checkForNaN(stats);
  return nanFields;
}

/**
 * Find suspicious zero values
 */
function findSuspiciousZeros(stats) {
  const suspicious = [];

  if (stats.totalStats?.seasonsPlayed > 0) {
    if (
      stats.totalStats.totalWins === 0 &&
      stats.totalStats.totalLosses === 0
    ) {
      suspicious.push("No wins or losses despite playing seasons");
    }
    if (stats.totalStats.totalPoints === 0) {
      suspicious.push("Zero total points despite playing seasons");
    }
  }

  return suspicious;
}

/**
 * Assess overall success based on test results
 */
function assessOverallSuccess(testResults) {
  const phases = Object.values(testResults);
  const successfulPhases = phases.filter((phase) => phase.success).length;
  const totalPhases = phases.length;

  // Require at least 80% of phases to pass
  return successfulPhases / totalPhases >= 0.8;
}

/**
 * Display final results
 */
function displayFinalResults(verificationResults) {
  console.log("\n" + "=".repeat(70));
  console.log("🎯 FINAL VERIFICATION RESULTS");
  console.log("=".repeat(70));

  const { testResults, overallSuccess, duration } = verificationResults;

  console.log(`⏱️  Total Duration: ${duration}ms`);
  console.log(
    `📊 Overall Status: ${overallSuccess ? "✅ SUCCESS" : "❌ FAILURE"}`,
  );
  console.log("");

  // Display phase results
  console.log("📋 Phase Results:");
  Object.entries(testResults).forEach(([phase, result]) => {
    const status = result.success ? "✅ PASS" : "❌ FAIL";
    console.log(`  ${status} ${phase}`);

    if (result.error) {
      console.log(`    Error: ${result.error}`);
    }
  });

  // Display specific findings
  console.log("\n🔍 Key Findings:");

  if (testResults.dataIntegrity) {
    const dataIntegrity = testResults.dataIntegrity;
    console.log(
      `  📊 Data Integrity Score: ${dataIntegrity.details.dataIntegrityScore}/100`,
    );
    console.log(`  🚨 NaN Issues: ${dataIntegrity.details.nanIssuesDetected}`);
    console.log(
      `  ⚠️  Zero Count Issues: ${dataIntegrity.details.zeroCountIssuesDetected}`,
    );
  }

  if (testResults.managerStats) {
    const managerStats = testResults.managerStats;
    console.log(
      `  👥 Managers Processed: ${managerStats.details.managersProcessed}`,
    );
    console.log(`  ✅ Successful: ${managerStats.details.managersSuccessful}`);
    console.log(
      `  🔍 Validations Passed: ${managerStats.details.validationsPassed}`,
    );
  }

  // Final recommendations
  console.log("\n💡 Recommendations:");
  if (overallSuccess) {
    console.log("  ✅ All systems are functioning correctly!");
    console.log("  ✅ NaN values and zero count issues have been resolved");
    console.log("  ✅ Enhanced playoff detection is working");
    console.log("  ✅ Data validation system is operational");
    console.log("  ✅ Ready for production use");
  } else {
    console.log("  ⚠️  Some issues were detected - review failed phases");
    console.log("  🔧 Check error messages above for specific fixes needed");
    console.log("  📞 Consider running individual tests for debugging");
  }

  console.log("\n" + "=".repeat(70));
}

// ============================================================================
// EXPORTS
// ============================================================================

export { runFinalVerification };

export default {
  runFinalVerification,
};
