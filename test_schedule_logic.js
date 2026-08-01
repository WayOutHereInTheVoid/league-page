/**
 * Test file for the new schedule logic
 * Run this to verify the countdown and live game periods work correctly
 */

import {
  determineSchedulePeriod,
  getCountdownData,
  shouldShowLiveScoreboard,
  debugSchedule,
  getPhoenixTime,
} from "../src/lib/utils/helperFunctions/scheduleLogic.js";

// Mock NFL state for testing
const mockNflState = {
  season: "2025",
  season_type: "regular",
  week: 1,
};

console.log("=== TRL SCHEDULE LOGIC TEST ===\n");

// Test current time
console.log("Current Phoenix Time:", getPhoenixTime().toLocaleString());

// Test dates around season kickoff (September 4, 2025 5:20 PM)
const testDates = [
  // Before season starts
  "2025-09-04T16:00:00-07:00", // 4:00 PM - 1h 20m before kickoff
  "2025-09-04T17:15:00-07:00", // 5:15 PM - 5 minutes before kickoff

  // Season starts
  "2025-09-04T17:20:00-07:00", // 5:20 PM - exactly at kickoff
  "2025-09-04T18:00:00-07:00", // 6:00 PM - during games

  // Sunday during games
  "2025-09-08T14:00:00-07:00", // Sunday 2:00 PM - during games

  // Monday night
  "2025-09-09T20:00:00-07:00", // Monday 8:00 PM - during MNF

  // Tuesday preview period
  "2025-09-10T00:01:00-07:00", // Tuesday 12:01 AM - preview mode
  "2025-09-10T10:00:00-07:00", // Tuesday 10:00 AM - still preview

  // Wednesday preview period
  "2025-09-11T15:00:00-07:00", // Wednesday 3:00 PM - preview mode

  // Thursday before 5 PM (preview)
  "2025-09-12T16:00:00-07:00", // Thursday 4:00 PM - last hour of preview

  // Thursday 5 PM (live starts)
  "2025-09-12T17:00:00-07:00", // Thursday 5:00 PM - live mode starts
  "2025-09-12T18:00:00-07:00", // Thursday 6:00 PM - during live
];

testDates.forEach((testDate, index) => {
  console.log(`\n--- TEST ${index + 1}: ${testDate} ---`);

  // Override the Phoenix time function temporarily
  const originalDate = Date;
  global.Date = class extends Date {
    constructor(...args) {
      if (args.length === 0) {
        super(testDate);
      } else {
        super(...args);
      }
    }

    static now() {
      return new originalDate(testDate).getTime();
    }
  };

  try {
    const result = debugSchedule(mockNflState, testDate);

    console.log(`Mode: ${result.schedule.mode}`);
    console.log(`Display: ${result.schedule.displayType || "N/A"}`);
    console.log(`Show Live: ${result.showLive}`);
    console.log(`Message: ${result.schedule.message}`);
    console.log(`Title: ${result.schedule.title}`);

    if (result.countdown) {
      console.log(
        `Countdown Target: ${new Date(result.countdown.targetDate).toLocaleString()}`,
      );
    }
  } catch (error) {
    console.error("Test failed:", error.message);
  } finally {
    // Restore original Date
    global.Date = originalDate;
  }
});

console.log("\n=== END TEST ===");
