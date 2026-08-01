/**
 * TRL Schedule Logic - Hardcoded NFL Season Schedule
 * Handles countdown and live game periods with Phoenix timezone
 */

// Season Configuration
export const SEASON_CONFIG = {
  // Season Kickoff: September 4, 2025 at 5:20 PM Phoenix Time
  kickoffDate: new Date("2025-09-04T17:20:00-07:00"), // Phoenix is always MST (UTC-7)
  year: 2025,

  // Weekly Schedule Pattern
  liveStartTime: { day: 4, hour: 17, minute: 0 }, // Thursday 5:00 PM
  previewStartTime: { day: 2, hour: 0, minute: 1 }, // Tuesday 12:01 AM
};

/**
 * Get current time in Phoenix timezone
 * Phoenix, AZ doesn't observe daylight saving, so it's always UTC-7 (MST)
 */
export function getPhoenixTime() {
  const now = new Date();
  // Convert to Phoenix time (always UTC-7)
  return new Date(
    now.getTime() - 7 * 60 * 60 * 1000 + now.getTimezoneOffset() * 60 * 1000,
  );
}

/**
 * Check if season has started yet
 */
export function hasSeasonStarted() {
  const phoenixNow = getPhoenixTime();
  return phoenixNow >= SEASON_CONFIG.kickoffDate;
}

/**
 * Get next Thursday 5:00 PM from given date
 */
export function getNextThursday5PM(fromDate = null) {
  const baseDate = fromDate || getPhoenixTime();
  const nextThursday = new Date(baseDate);

  // Find next Thursday
  const currentDay = baseDate.getDay(); // 0=Sunday, 4=Thursday
  const daysUntilThursday = (4 - currentDay + 7) % 7;

  // If it's Thursday and past 5 PM, go to next Thursday
  if (currentDay === 4 && baseDate.getHours() >= 17) {
    nextThursday.setDate(baseDate.getDate() + 7);
  } else if (daysUntilThursday === 0) {
    // It's Thursday but before 5 PM
    nextThursday.setDate(baseDate.getDate());
  } else {
    nextThursday.setDate(baseDate.getDate() + daysUntilThursday);
  }

  nextThursday.setHours(17, 0, 0, 0); // 5:00 PM
  return nextThursday;
}

/**
 * Get next Tuesday 12:01 AM from given date
 */
export function getNextTuesday1201AM(fromDate = null) {
  const baseDate = fromDate || getPhoenixTime();
  const nextTuesday = new Date(baseDate);

  // Find next Tuesday
  const currentDay = baseDate.getDay(); // 0=Sunday, 2=Tuesday
  let daysUntilTuesday = (2 - currentDay + 7) % 7;

  // If it's Tuesday and past 12:01 AM, go to next Tuesday
  if (
    currentDay === 2 &&
    (baseDate.getHours() > 0 ||
      (baseDate.getHours() === 0 && baseDate.getMinutes() >= 1))
  ) {
    daysUntilTuesday = 7;
  } else if (daysUntilTuesday === 0) {
    // It's Tuesday but before 12:01 AM (technically Monday night)
    daysUntilTuesday = 0;
  }

  nextTuesday.setDate(baseDate.getDate() + daysUntilTuesday);
  nextTuesday.setHours(0, 1, 0, 0); // 12:01 AM
  return nextTuesday;
}

/**
 * Determine current schedule period
 * @param {Object} nflState - Current NFL state from Sleeper API
 * @returns {Object} - Schedule information
 */
export function determineSchedulePeriod(nflState) {
  const phoenixNow = getPhoenixTime();

  // Handle postseason - defer to existing playoff logic
  if (nflState?.season_type === "post") {
    return {
      mode: "playoff",
      displayType: "playoff-logic",
      message: "Playoff Time!",
      title: "🏆 Playoffs",
      week: nflState.week,
    };
  }

  // Handle preseason - countdown to season start (only if NFL API says preseason)
  if (nflState?.season_type === "pre" && !hasSeasonStarted()) {
    return {
      mode: "countdown",
      targetDate: SEASON_CONFIG.kickoffDate,
      displayType: "season-start",
      message: "Until Season Starts!",
      title: "🏈 Season Countdown",
      week: 1,
    };
  }

  // Regular season logic (includes when NFL API says regular but before hardcoded season start)
  const currentWeek = nflState?.week || 1;

  // If we're in regular season but before the hardcoded kickoff, show countdown to kickoff
  if (nflState?.season_type === "regular" && !hasSeasonStarted()) {
    return {
      mode: "countdown",
      targetDate: SEASON_CONFIG.kickoffDate,
      displayType: "season-start",
      message: "Until Week 1 Games Begin!",
      title: "🏈 Week 1 Countdown",
      week: 1,
    };
  }

  // Determine if we're in Live or Preview period (for regular season after kickoff)
  const currentDay = phoenixNow.getDay();
  const currentHour = phoenixNow.getHours();
  const currentMinute = phoenixNow.getMinutes();

  // Live Period: Thursday 5:00 PM through Tuesday 12:00 AM
  const isLivePeriod =
    (currentDay === 4 && currentHour >= 17) || // Thursday 5 PM or later
    currentDay === 5 || // Friday all day
    currentDay === 6 || // Saturday all day
    currentDay === 0 || // Sunday all day
    currentDay === 1 || // Monday all day
    (currentDay === 2 && currentHour === 0 && currentMinute === 0); // Tuesday exactly at midnight

  if (isLivePeriod) {
    return {
      mode: "live",
      displayType: "live-games",
      message: `Week ${currentWeek} Live Matchups`,
      title: "🔴 Live Scoreboard",
      week: currentWeek,
    };
  } else {
    // Preview Period: Tuesday 12:01 AM through Thursday 4:59 PM
    const nextThursday = getNextThursday5PM(phoenixNow);
    // Fix: Use display_week (completed week) + 1 instead of current week + 1
    // This ensures Week 1 completed → shows "Week 2", not "Week 3"
    const nextWeek = (nflState?.display_week || nflState?.week || 1) + 1;

    return {
      mode: "countdown",
      targetDate: nextThursday,
      displayType: "week-preview",
      message: `Until Week ${nextWeek} Games Begin`,
      title: `⏰ Week ${nextWeek} Countdown`,
      week: nextWeek,
    };
  }
}

/**
 * Get countdown data for GameWeekCountdown component
 * @param {Object} nflState - Current NFL state from Sleeper API
 * @returns {Object} - Countdown configuration
 */
export function getCountdownData(nflState) {
  const schedule = determineSchedulePeriod(nflState);

  if (schedule.mode !== "countdown") {
    return null; // No countdown needed for live or playoff modes
  }

  const isSeasonStart = schedule.displayType === "season-start";
  const isWeekPreview = schedule.displayType === "week-preview";

  return {
    targetDate: schedule.targetDate,
    week: schedule.week,
    seasonType: nflState?.season_type || "regular",
    isDraftCountdown: false, // We're past draft season
    isSeasonStart,
    isWeekPreview,
    message: schedule.message,
    title: schedule.title,
  };
}

/**
 * Should we show live scoreboard?
 * @param {Object} nflState - Current NFL state from Sleeper API
 * @returns {boolean}
 */
export function shouldShowLiveScoreboard(nflState) {
  const schedule = determineSchedulePeriod(nflState);
  return schedule.mode === "live" || schedule.mode === "playoff";
}

/**
 * Debug function to test schedule logic
 */
export function debugSchedule(nflState, testDate = null) {
  const originalGetPhoenixTime = getPhoenixTime;

  if (testDate) {
    // Override getPhoenixTime for testing
    global.getPhoenixTime = () => new Date(testDate);
  }

  const schedule = determineSchedulePeriod(nflState);
  const countdown = getCountdownData(nflState);
  const showLive = shouldShowLiveScoreboard(nflState);

  console.log("=== SCHEDULE DEBUG ===");
  console.log("Test Date:", testDate || "Current Time");
  console.log("Phoenix Time:", getPhoenixTime());
  console.log("Schedule Period:", schedule);
  console.log("Countdown Data:", countdown);
  console.log("Show Live Scoreboard:", showLive);
  console.log("====================");

  // Restore original function
  if (testDate) {
    global.getPhoenixTime = originalGetPhoenixTime;
  }

  return { schedule, countdown, showLive };
}
