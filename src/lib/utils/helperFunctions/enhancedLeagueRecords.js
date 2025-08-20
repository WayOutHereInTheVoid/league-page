import { getLeagueData } from './leagueData';
import { leagueID } from '$lib/utils/leagueInfo';
import { getNflState } from './nflState';
import { getLeagueRosters } from "./leagueRosters";
import { waitForAll } from './multiPromise';
import { get } from 'svelte/store';
import { records } from '$lib/stores';
import { getManagers, round, sortHighAndLow } from './universalFunctions';
import { EnhancedRecords } from '$lib/utils/dataClasses';
import { getBrackets } from './leagueBrackets';
import { browser } from '$app/environment';

/**
 * Enhanced League Records - Drop-in replacement for getLeagueRecords with enhanced features
 * 
 * This function provides all the functionality of the original getLeagueRecords() but uses
 * the EnhancedRecords class to provide additional features like:
 * - Achievement rarity classification
 * - Performance percentile calculations  
 * - Context generation for record explanations
 * - Historical significance analysis
 * - Trend analysis and predictions
 * 
 * @param {bool} refresh - if set to false, returns cached records from localStorage
 * @param {Object} options - Enhanced options for the new features
 * @returns {Object} Enhanced records data with all original fields plus new features
 */
export const getEnhancedLeagueRecords = async (refresh = false, options = {}) => {
    const {
        includeAchievementGallery = true,
        includeContextGeneration = true,
        includeTrendAnalysis = true,
        includePercentileCalculations = true,
        maxAchievementsPerCategory = 10
    } = options;

    // Check for cached enhanced records first
    if(get(records).leagueWeekHighs && get(records).enhancedFeatures) {
        return get(records);
    }

    // Check localStorage for enhanced records (if not refresh)
    if(!refresh && browser) {
        let localRecords = await JSON.parse(localStorage.getItem("enhancedRecords"));
        if(localRecords && localRecords.playoffData && localRecords.enhancedFeatures) {
            localRecords.stale = true;
            return localRecords;
        }
    }

    // Get info about the current NFL season (week and season type)
    const nflState = await getNflState().catch((err) => { console.error(err); });
    let week = 0;
    if(nflState.season_type == 'regular') {
        week = nflState.week - 1;
    } else if(nflState.season_type == 'post') {
        week = 18;
    }

    // Historical TRL League IDs - only process completed seasons (2020-2024)
    const historicalSeasons = [
        "1124822402371428352", // 2024 Season
        "986011172245692416",  // 2023 Season 
        "842236252429324288",  // 2022 Season
        "650044825487384576",  // 2021 Season
        "604862459685191680"   // 2020 Season
    ];
    
    let currentYear;
    let lastYear;
    
    console.log('📅 Enhanced Records: Processing historical seasons 2020-2024 only, skipping 2025 preseason');

    // Create EnhancedRecords instances instead of basic Records
    let regularSeason = new EnhancedRecords();
    let playoffRecords = new EnhancedRecords();

    // Process only historical seasons explicitly
    for(const curSeason of historicalSeasons) {
        console.log(`📊 Processing season: ${curSeason}`);
        
        const [rosterRes, leagueData] = await waitForAll(
            getLeagueRosters(curSeason),
            getLeagueData(curSeason),
        ).catch((err) => { 
            console.error(`Error loading data for season ${curSeason}:`, err);
            return [null, null]; // Return null values to indicate failure
        });

        // Skip if data loading failed
        if (!rosterRes || !leagueData) {
            console.log(`Skipping season ${curSeason} due to loading failure`);
            continue;
        }

        const rosters = rosterRes.rosters;

        // Determine week processing logic
        if(leagueData.status == 'complete' || week > leagueData.settings.playoff_week_start - 1) {
            week = 99;
        }

        // Process regular season data with enhanced records
        const {
            season,
            year,
        } = await processEnhancedRegularSeason({leagueData, rosters, curSeason, week, regularSeason});

        // Process post season data with enhanced records
        const pS = await processEnhancedPlayoffs({year, curSeason, week, playoffRecords, rosters});

        if(pS) {
            playoffRecords = pS;
        }

        lastYear = year;

        if(!currentYear && year) {
            currentYear = year;
        }
    }

    // Finalize both regular season and playoff records
    playoffRecords.currentYear = regularSeason.currentYear;
    playoffRecords.lastYear = regularSeason.lastYear;

    regularSeason.finalizeAllTimeRecords({currentYear, lastYear});
    playoffRecords.finalizeAllTimeRecords({currentYear, lastYear});

    // NEW: Generate enhanced features
    if (includePercentileCalculations) {
        regularSeason.calculateLeagueAverages();
        playoffRecords.calculateLeagueAverages();
    }

    if (includeAchievementGallery) {
        regularSeason.buildAchievementGallery({
            maxPerCategory: maxAchievementsPerCategory,
            sortBy: 'significance'
        });
        playoffRecords.buildAchievementGallery({
            maxPerCategory: maxAchievementsPerCategory,
            sortBy: 'significance'
        });
    }

    if (includeTrendAnalysis) {
        regularSeason.performTrendAnalysis();
        playoffRecords.performTrendAnalysis();
    }

    // NEW: Finalize enhanced records (adds contextual data)
    if (includeContextGeneration) {
        regularSeason.finalizeEnhancedRecords();
        playoffRecords.finalizeEnhancedRecords();
    }

    // Get enhanced records data
    const regularSeasonData = regularSeason.returnEnhancedRecords();
    const playoffData = playoffRecords.returnEnhancedRecords();

    const enhancedRecordsData = {
        regularSeasonData, 
        playoffData,
        enhancedFeatures: {
            achievementGallery: includeAchievementGallery,
            contextGeneration: includeContextGeneration,
            trendAnalysis: includeTrendAnalysis,
            percentileCalculations: includePercentileCalculations,
            generatedAt: new Date().toISOString()
        }
    };

    if(browser) {
        // Update localStorage with enhanced records
        localStorage.setItem("enhancedRecords", JSON.stringify(enhancedRecordsData));
        
        // Also update the regular records store for backward compatibility
        const backwardCompatibleData = {
            regularSeasonData: regularSeasonData,
            playoffData: playoffData
        };
        localStorage.setItem("records", JSON.stringify(backwardCompatibleData));
        
        records.update(() => enhancedRecordsData);
    }

    return enhancedRecordsData;
};

/**
 * Processes a regular season using EnhancedRecords class
 * Identical logic to original but with enhanced data structures
 */
const processEnhancedRegularSeason = async ({rosters, leagueData, curSeason, week, regularSeason}) => {
    let year = parseInt(leagueData.season);

    if(leagueData.status == 'complete' || week > leagueData.settings.playoff_week_start - 1) {
        week = leagueData.settings.playoff_week_start - 1;
    }

    // Analyze rosters (same as original)
    for(const rosterID in rosters) {
        analyzeEnhancedRosters({year, roster: rosters[rosterID], regularSeason});
    }

    // Process matchups (same as original)
    const matchupsPromises = [];
    let startWeek = parseInt(week);
    while(week > 0) {
        matchupsPromises.push(fetch(`https://api.sleeper.app/v1/league/${curSeason}/matchups/${week}`, {compress: true}))
        week--;
    }

    const matchupsRes = await waitForAll(...matchupsPromises).catch((err) => { console.error(err); });

    const matchupsJsonPromises = [];
    for(const matchupRes of matchupsRes) {
        const data = matchupRes.json();
        matchupsJsonPromises.push(data)
        if (!matchupRes.ok) {
            console.error(data);
        }
    }
    const matchupsData = await waitForAll(...matchupsJsonPromises).catch((err) => { console.error(err); });

    // No longer following previous_league_id chain - using explicit historical seasons only

    let seasonPointsRecord = [];
    let matchupDifferentials = [];
    
    // Process all the matchups (same as original)
    for(const matchupWeek of matchupsData) {
        const {sPR, mD, sW} = processEnhancedMatchups({matchupWeek, seasonPointsRecord, record: regularSeason, startWeek, matchupDifferentials, year})
        seasonPointsRecord = sPR;
        matchupDifferentials = mD;
        startWeek = sW;
    }

    // Sort and add records (same as original)
    const [biggestBlowouts, closestMatchups] = sortHighAndLow(matchupDifferentials, 'differential')
    const [seasonPointsHighs, seasonPointsLows] = sortHighAndLow(seasonPointsRecord, 'fpts')

    regularSeason.addAllTimeMatchupDifferentials(matchupDifferentials);

    if(seasonPointsHighs.length > 0) {
        regularSeason.addSeasonWeekRecord({
            year,
            biggestBlowouts,
            closestMatchups,
            seasonPointsLows,
            seasonPointsHighs,
        });
    } else {
        year = null;
    }

    return {
        season: null, // No longer following season chain - using explicit historical seasons
        year,
    }
};

/**
 * Enhanced roster analysis - same as original but with EnhancedRecords
 */
const analyzeEnhancedRosters = ({year, roster, regularSeason}) => {
    const rosterID = roster.roster_id;
    const managers = getManagers(roster);

    if(roster.settings.wins == 0 && roster.settings.ties == 0 && roster.settings.losses == 0) return;

    const fptsFor = roster.settings.fpts + (roster.settings.fpts_decimal / 100);
    const fptsPerGame = round(fptsFor / (roster.settings.wins + roster.settings.losses + roster.settings.ties));

    const rosterRecords = {
        wins: roster.settings.wins,
        losses: roster.settings.losses,
        ties: roster.settings.ties,
        fptsFor,
        fptsAgainst: roster.settings.fpts_against + (roster.settings.fpts_against_decimal / 100),
        fptsPerGame,
        potentialPoints: roster.settings.ppts + (roster.settings.ppts_decimal / 100),
        rosterID,
        year,
    }

    regularSeason.updateManagerRecord(managers, rosterRecords);
    regularSeason.addSeasonLongPoints({
        rosterID,
        fpts: fptsFor,
        fptsPerGame,
        year,
    });
};

/**
 * Enhanced matchup processing - same as original but with EnhancedRecords  
 */
const processEnhancedMatchups = ({matchupWeek, seasonPointsRecord, record, startWeek, matchupDifferentials, year}) => {
    let matchups = {};
    let pSD = {};

    // Same processing logic as original
    for(const matchup of matchupWeek) {
        const rosterID = matchup.roster_id;
        if(!rosterID) continue;

        let mID = matchup.matchup_id;

        if(!mID) {
            if(!pSD[rosterID]) {
                pSD[rosterID] = {
                    wins: 0, losses: 0, ties: 0, fptsFor: 0, fptsAgainst: 0,
                    potentialPoints: 0, fptspg: 0, pOGames: 0, byes: 0,
                }
            }
            pSD[rosterID].pOGames = 1;
            const m = matchup.m;
            if(!m) {
                pSD[rosterID].byes = 1;
                continue;
            }
            mID = `PS:${m}`
        }
        
        const entry = {
            rosterID,
            fpts: matchup.points,
            week: startWeek,
            year,
        }

        if(!matchups[mID]) {
            matchups[mID] = [];
        }
        matchups[mID].push(entry);
        record.addLeagueWeekRecord(entry);
        seasonPointsRecord.push(entry);
    }
    startWeek--;

    // Create matchup differentials (same as original)
    for(const matchupKey in matchups) {
        const matchup = matchups[matchupKey];
        let home = matchup[0];
        let away = matchup[1];

        if(!away || !home) continue;
        
        if(home.fpts < away.fpts) {
            home = matchup[1];
            away = matchup[0];
        }
        const matchupDifferential = {
            year: home.year,
            week: home.week,
            home: {
                rosterID: home.rosterID,
                fpts: home.fpts,
            },
            away: {
                rosterID: away.rosterID,
                fpts: away.fpts,
            },
            differential: home.fpts - away.fpts
        }
        matchupDifferentials.push(matchupDifferential);

        if(matchupKey.split(":")[0] == "PS") {
            pSD[home.rosterID].wins = 1;
            pSD[home.rosterID].fptsFor = home.fpts;
            pSD[home.rosterID].fptsAgainst = away.fpts;
            
            pSD[away.rosterID].losses = 1;
            pSD[away.rosterID].fptsFor = away.fpts;
            pSD[away.rosterID].fptsAgainst = home.fpts;
        }
    }

    return {
        sPR: seasonPointsRecord,
        mD: matchupDifferentials,
        sW: startWeek,
        pSD
    }
};

/**
 * Enhanced playoff processing - same as original but with EnhancedRecords
 */
const processEnhancedPlayoffs = async ({curSeason, playoffRecords, year, week, rosters}) => {
    const {
        playoffsStart,
        playoffRounds,
        champs,
    } = await getBrackets(curSeason);

    if(week <= playoffsStart || !year) {
        return null;
    }

    let seasonPointsRecord = [];
    let matchupDifferentials = [];
    let postSeasonData = {};

    // Process brackets (same as original)
    const champBracket = digestEnhancedBracket({bracket: champs.bracket, playoffsStart, matchupDifferentials, postSeasonData, playoffRecords, playoffRounds, consolation: false, seasonPointsRecord, year});

    postSeasonData = champBracket.postSeasonData;
    seasonPointsRecord = champBracket.seasonPointsRecord;
    playoffRecords = champBracket.playoffRecords;
    matchupDifferentials = champBracket.matchupDifferentials;

    const consolationBracket = digestEnhancedBracket({bracket: champs.consolations, playoffsStart, matchupDifferentials, postSeasonData, playoffRecords, playoffRounds, consolation: true, seasonPointsRecord, year});

    postSeasonData = consolationBracket.postSeasonData;
    seasonPointsRecord = consolationBracket.seasonPointsRecord;
    playoffRecords = consolationBracket.playoffRecords;
    matchupDifferentials = consolationBracket.matchupDifferentials;

    // Finalize playoff data (same as original)
    for(const rosterID in postSeasonData) {
        const pSD = postSeasonData[rosterID];
        const fptsPerGame = round(pSD.fptsFor / (pSD.wins + pSD.losses + pSD.ties));
        pSD.fptsPerGame = fptsPerGame;
        pSD.year = year;
        pSD.rosterID = rosterID;

        playoffRecords.addSeasonLongPoints({
            fpts: pSD.fptsFor,
            fptsPerGame,
            year,
            rosterID: rosterID,
        })

        const managers = getManagers(rosters[rosterID]);
        playoffRecords.updateManagerRecord(managers, pSD);
    }

    const [biggestBlowouts, closestMatchups] = sortHighAndLow(matchupDifferentials, 'differential')
    const [seasonPointsHighs, seasonPointsLows] = sortHighAndLow(seasonPointsRecord, 'fpts')

    playoffRecords.addAllTimeMatchupDifferentials(matchupDifferentials);

    if(seasonPointsHighs.length > 0) {
        playoffRecords.addSeasonWeekRecord({
            year,
            biggestBlowouts,
            closestMatchups,
            seasonPointsLows,
            seasonPointsHighs,
        });
    }
    
    return playoffRecords;
};

/**
 * Enhanced bracket processing - same as original
 */
const digestEnhancedBracket = ({bracket, playoffRecords, playoffRounds, matchupDifferentials, postSeasonData, consolation, seasonPointsRecord, playoffsStart, year}) => {
    for(let i = 0; i < bracket.length; i++) {
        const startWeek = getStartWeek(i + (playoffRounds - bracket.length), playoffRounds, consolation, playoffsStart);
        const matchupWeek = [];

        for(let matchups of bracket[i]) {
            if(consolation) {
                matchups.flat();
            }
            for(const matchup of matchups) {
                if(matchup.r) {
                    const newMatchup = {...matchup}
                    let points = 0;
                    for(const k in newMatchup.points) {
                        points += newMatchup.points[k].reduce((t, nV) => t + nV, 0);
                    }
                    newMatchup.points = points;
                    matchupWeek.push(newMatchup);
                }
            }
        }
        const {sPR, mD, pSD} = processEnhancedMatchups({matchupWeek, seasonPointsRecord, record: playoffRecords, startWeek, matchupDifferentials, year})

        postSeasonData = meshPostSeasonData(postSeasonData, pSD);
        seasonPointsRecord = sPR;
        matchupDifferentials = mD;
    }

    return {postSeasonData, seasonPointsRecord, playoffRecords, matchupDifferentials}
};

/**
 * Helper functions (same as original)
 */
const meshPostSeasonData = (postSeasonData, pSD) => {
    for(const key in pSD) {
        if(!postSeasonData[key]) {
            postSeasonData[key] = pSD[key];
            continue;
        }
        for(const k in pSD[key]) {
            if(k == 'manager') continue;
            postSeasonData[key][k] += pSD[key][k];
        }
    }
    return postSeasonData;
};

const getStartWeek = (i, playoffRounds, consolation, playoffsStart) => {
    if (consolation) {
        return `(C) Week ${playoffsStart + i}`;
    }

    switch (playoffRounds - i) {
        case 1:
            return "Finals";
        case 2:
            return "Semi-Finals"
        case 3:
            return "Quarter-Finals"
        default:
            return "Qualifiers";
    }
};

/**
 * Backward compatibility wrapper
 * This provides the exact same interface as the original getLeagueRecords()
 * but uses enhanced records under the hood
 */
export const getLeagueRecords = async (refresh = false) => {
    const enhancedData = await getEnhancedLeagueRecords(refresh, {
        includeAchievementGallery: false,  // Disable for backward compatibility
        includeContextGeneration: false,   // Disable for backward compatibility  
        includeTrendAnalysis: false,       // Disable for backward compatibility
        includePercentileCalculations: false // Disable for backward compatibility
    });
    
    // Return only the core data fields for backward compatibility
    return {
        regularSeasonData: enhancedData.regularSeasonData,
        playoffData: enhancedData.playoffData
    };
};