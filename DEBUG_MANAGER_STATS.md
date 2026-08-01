# Manager Statistics Debugging Guide

## How to Enable Debugging

1. **Open your browser's Developer Console** while viewing a manager page
2. **Enable debugging** by running this command in the console:
   ```javascript
   localStorage.setItem("debug-manager-stats", "true");
   ```
3. **Refresh the page** to see detailed debugging information
4. **Disable debugging** when done:
   ```javascript
   localStorage.removeItem("debug-manager-stats");
   ```

## What the Debug Logs Will Show

The debugging system will provide detailed information about:

### Data Flow Tracing

- Input data validation (manager, records, awards)
- Roster ID mapping across seasons
- Season data aggregation
- Points calculation with field name verification

### Common Issues to Look For

1. **Field Name Mismatches**

   - Check if API data uses `fpts` vs `fptsFor`
   - Verify `fpts_against` vs `fptsAgainst`
   - Look for `ppts` vs `potentialPoints`

2. **Awards Processing**

   - Roster ID matching for championships/playoffs
   - Year alignment between awards and season data
   - Division championship detection

3. **Data Validation**
   - Missing or null data structures
   - NaN values in calculations
   - Empty seasons or missing manager mappings

## Debug Output Sections

### [Manager Component Debug]

Shows the raw input data being passed to the statistics calculation

### [ManagerStats Debug]

Detailed tracing through each step of the calculation process

### Key Debug Points

- `getAllManagerRosterIDs`: Maps manager ID to roster IDs across seasons
- `aggregateManagerSeasonData`: Collects season data from records
- `processSeasonData`: Calculates individual season stats and awards
- `Final Calculations`: Derived statistics like win percentage

## Troubleshooting Steps

1. **If getting NaN values:**

   - Check the "Points Calculation Results" log
   - Verify field names match between expected and actual data
   - Look for null/undefined values in season data

2. **If playoff/championship counts are zero:**

   - Check "Awards Processing" logs
   - Verify roster ID matching logic
   - Confirm awards data structure matches expected format

3. **If no seasons found:**
   - Check "Manager Roster Mapping" logs
   - Verify manager ID exists in team managers data
   - Confirm season data exists in records

## Making Fixes

After identifying issues through debugging:

1. Update field name mappings in `managerStats.js`
2. Improve data validation and error handling
3. Fix awards processing logic if needed
4. Test with debugging enabled to verify fixes
