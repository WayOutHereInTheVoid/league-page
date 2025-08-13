<script>
    import PowerRankingsChart from '$lib/components/power_rankings/PowerRankingsChart.svelte';
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

    {#if data.processedStats && powerRankings}
        <div class="w-full p-4 bg-white rounded-lg shadow md:p-6 min-w-80">
            <PowerRankingsChart
                powerRankings={powerRankings}
                regularSeasonLength={data.leagueData.settings.playoff_week_start - 1}
                totalRosters={data.leagueData.total_rosters}
            />
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
                    {#each data.processedStats as team, i}
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
    {:else}
        <p>Loading power rankings...</p>
    {/if}
</div>
