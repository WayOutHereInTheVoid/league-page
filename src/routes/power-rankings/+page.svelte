<script>
    import PowerRankingsChart from '$lib/components/power_rankings/PowerRankingsChart.svelte';
    import PowerRankingCard from '$lib/components/power_rankings/PowerRankingCard.svelte';
    import { mean, max, min, zip } from "lodash";
    import { getPowerRanking, winsOnWeek } from "$lib/utils/helperFunctions/advancedStats";

    export let data;

    const powerRankings = (() => {
        if (!data.processedStats) return null;

        const result = [];
        const ratingsContainer = [];
        data.processedStats.forEach((value) => {
            const ratingArr = [];
            if (value.recordByWeek && value.points) {
                value.points.forEach((_, week) => {
                    if (week < value.recordByWeek.length) {
                        const currentWins = winsOnWeek(value.recordByWeek, week);
                        const currentLosses = week + 1 - currentWins;
                        ratingArr.push(
                            getPowerRanking(
                                mean(value.points.slice(0, week + 1)),
                                Number(max(value.points.slice(0, week + 1))),
                                Number(min(value.points.slice(0, week + 1))),
                                currentWins / (currentWins + currentLosses)
                            )
                        );
                    }
                });
            }
            ratingsContainer.push(ratingArr);
            result.push({
                name: value.name,
                type: "line",
                ratings: ratingArr,
            });
        });

        const orderedArrs = zip(...ratingsContainer);
        orderedArrs.forEach((arr) => {
            arr.sort((a, b) => b - a);
        });

        result.forEach((user) => {
            const data = [];
            user.ratings.forEach((value, index) => {
                data.push(orderedArrs[index].indexOf(value) + 1);
            });
            user["data"] = data;
        });
        return result;
    })();
</script>

<div class="p-4">
    <h1 class="text-2xl font-bold mb-4">Power Rankings</h1>
    
    {#if data.usingPreviousSeasonData}
        <div class="mb-4 p-3 bg-amber-100 border-l-4 border-amber-500 text-amber-700 rounded-r-lg">
            <div class="flex items-center">
                <svg class="h-5 w-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd" />
                </svg>
                <div>
                    <p class="font-semibold">Showing {data.displayedSeason} Season Data</p>
                    <p class="text-sm">Current {data.currentSeason} season hasn't started yet. These are the final power rankings from the completed {data.displayedSeason} season.</p>
                </div>
            </div>
        </div>
    {:else if data.displayedSeason !== data.currentSeason}
        <div class="mb-4 p-3 bg-blue-100 border-l-4 border-blue-500 text-blue-700 rounded-r-lg">
            <p class="font-semibold">Showing {data.displayedSeason} Season Data</p>
        </div>
    {/if}

    {#if data.processedStats && powerRankings}
        <div class="flex flex-wrap md:flex-nowrap">
            <PowerRankingCard
                powerRankings={powerRankings}
                regularSeasonLength={data.leagueData.settings.playoff_week_start - 1}
                class="w-full mb-4 md:w-1/3 md:mr-4 md:mb-0"
            />
            <div class="w-full p-4 bg-white rounded-lg shadow md:w-2/3 dark:bg-gray-800 md:p-6 min-w-80">
                <PowerRankingsChart
                    powerRankings={powerRankings}
                    regularSeasonLength={data.leagueData.settings.playoff_week_start - 1}
                    totalRosters={data.leagueData.total_rosters}
                />
            </div>
        </div>
        <div class="overflow-x-auto mt-4">
            <table class="min-w-full bg-white border border-gray-200">
                <thead>
                    <tr class="bg-gray-100">
                        <th class="py-2 px-4 border-b">Rank</th>
                        <th class="py-2 px-4 border-b">Team</th>
                        <th class="py-2 px-4 border-b">Power Ranking</th>
                        <th class="py-2 px-4 border-b">Wins</th>
                        <th class="py-2 px-4 border-b">Losses</th>
                        <th class="py-2 px-4 border-b">Points For</th>
                    </tr>
                </thead>
                <tbody>
                    {#each data.processedStats.sort((a, b) => b.rating - a.rating) as team, i}
                        <tr class="hover:bg-gray-50">
                            <td class="py-2 px-4 border-b text-center">{i + 1}</td>
                            <td class="py-2 px-4 border-b">
                                <div class="flex items-center">
                                    <img src={team.avatar} alt="avatar" class="w-8 h-8 rounded-full mr-2" />
                                    <span>{team.name}</span>
                                </div>
                            </td>
                            <td class="py-2 px-4 border-b text-center">{team.rating}</td>
                            <td class="py-2 px-4 border-b text-center">{team.wins}</td>
                            <td class="py-2 px-4 border-b text-center">{team.losses}</td>
                            <td class="py-2 px-4 border-b text-center">{team.pointsFor}</td>
                        </tr>
                    {/each}
                </tbody>
            </table>
        </div>
    {:else if data.standingsData && data.leagueTeamManagersData}
        <!-- Show basic standings when we have data but no advanced power rankings -->
        <div class="bg-amber-50 border border-amber-200 rounded-lg p-6 mb-6">
            <h3 class="text-lg font-medium text-amber-800 mb-2">
                {data.usingPreviousSeasonData ? `${data.displayedSeason} Final Standings` : 'Current Standings'}
            </h3>
            <p class="text-amber-700">
                {data.usingPreviousSeasonData 
                    ? `Showing final standings from the completed ${data.displayedSeason} season. Advanced power rankings will be available once the ${data.currentSeason} season begins.`
                    : 'Advanced power rankings are being calculated. Here are the current standings:'
                }
            </p>
        </div>
        
        <div class="overflow-x-auto">
            <table class="min-w-full bg-white border border-gray-200 rounded-lg shadow">
                <thead>
                    <tr class="bg-gray-100">
                        <th class="py-3 px-4 border-b text-left">Rank</th>
                        <th class="py-3 px-4 border-b text-left">Team</th>
                        <th class="py-3 px-4 border-b text-center">Wins</th>
                        <th class="py-3 px-4 border-b text-center">Losses</th>
                        <th class="py-3 px-4 border-b text-center">Points For</th>
                        <th class="py-3 px-4 border-b text-center">Points Against</th>
                    </tr>
                </thead>
                <tbody>
                    {#each (data.standingsData?.standingsInfo ? Object.entries(data.standingsData.standingsInfo) : [])
                        .sort(([,a], [,b]) => {
                            // Sort by wins first, then by points for
                            if (b.wins !== a.wins) return b.wins - a.wins;
                            return b.fpts - a.fpts;
                        }) as [rosterId, standing], i}
                        {@const user = data.leagueTeamManagersData.users.find(u => 
                            data.leagueTeamManagersData.rosters.find(r => r.roster_id == rosterId)?.owner_id === u.user_id
                        )}
                        <tr class="hover:bg-gray-50">
                            <td class="py-3 px-4 border-b">
                                <span class="inline-flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 text-blue-800 font-semibold text-sm">
                                    {i + 1}
                                </span>
                            </td>
                            <td class="py-3 px-4 border-b">
                                <div class="flex items-center">
                                    {#if user}
                                        <img 
                                            src={user.avatar ? `https://sleepercdn.com/avatars/thumbs/${user.avatar}` : '/default-avatar.png'} 
                                            alt="avatar" 
                                            class="w-10 h-10 rounded-full mr-3" 
                                        />
                                        <div>
                                            <div class="font-medium text-gray-900">
                                                {user.metadata?.team_name || user.display_name || user.username}
                                            </div>
                                            <div class="text-sm text-gray-500">
                                                {user.display_name || user.username}
                                            </div>
                                        </div>
                                    {:else}
                                        <div class="w-10 h-10 bg-gray-300 rounded-full mr-3"></div>
                                        <span class="text-gray-500">Team {parseInt(rosterId) + 1}</span>
                                    {/if}
                                </div>
                            </td>
                            <td class="py-3 px-4 border-b text-center font-semibold text-green-600">{standing.wins}</td>
                            <td class="py-3 px-4 border-b text-center font-semibold text-red-600">{standing.losses}</td>
                            <td class="py-3 px-4 border-b text-center">{standing.fpts}</td>
                            <td class="py-3 px-4 border-b text-center">{standing.fptsAgainst}</td>
                        </tr>
                    {/each}
                </tbody>
            </table>
        </div>
    {:else}
        <div class="text-center py-8">
            {#if data.usingPreviousSeasonData}
                <div class="bg-gray-100 rounded-lg p-6">
                    <svg class="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                    <h3 class="text-lg font-medium text-gray-900 mb-2">Power Rankings Unavailable</h3>
                    <p class="text-gray-500">Previous season data couldn't be loaded. Power rankings will be available once the {data.currentSeason} season begins!</p>
                </div>
            {:else}
                <div class="bg-blue-50 rounded-lg p-6">
                    <svg class="mx-auto h-12 w-12 text-blue-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                    <h3 class="text-lg font-medium text-blue-900 mb-2">Calculating Power Rankings</h3>
                    <p class="text-blue-700">Power rankings will appear here once we have enough matchup data from the current season!</p>
                </div>
            {/if}
        </div>
    {/if}
</div>
