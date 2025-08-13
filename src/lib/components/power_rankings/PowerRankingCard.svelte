<script>
    export let powerRankings;
    export let regularSeasonLength;

    let weeks = [];
    let currentWeek;

    $: {
        const recordLength = powerRankings && powerRankings[0] ? powerRankings[0].data.length + 1 : 0;
        const weeksList = [...Array(regularSeasonLength).keys()].slice(1).reverse();
        weeks = recordLength < weeksList.length ? [...Array(recordLength).keys()].slice(1).reverse() : weeksList;
        if(!currentWeek && weeks.length > 0) {
            currentWeek = weeks[0];
        }
    }

    let rankingValues = [];
    $: {
        if(powerRankings && currentWeek) {
            rankingValues = powerRankings.map(p => p).sort((a, b) => {
                return b.ratings[currentWeek - 1] - a.ratings[currentWeek - 1];
            });
        }
    }

    let listPadding = 'py-3';
    $: {
        if (powerRankings) {
            if (powerRankings.length <= 10) {
                listPadding = "py-3";
            } else if (powerRankings.length <= 12) {
                listPadding = "py-2";
            } else {
                listPadding = "py-1";
            }
        }
    }
</script>

<div class="px-6 pt-4 bg-white border border-gray-200 rounded-lg shadow custom-width dark:bg-gray-800 dark:border-gray-700">
    <div class="flex items-center justify-between sm:mt-1.5 mb-3">
        <h5 class="w-20 text-xl font-bold leading-none text-gray-900 dark:text-gray-50 text-pretty">
            Ranking score
        </h5>
        <select
            aria-label="current week"
            id="rankings"
            class="block p-2 text-sm text-gray-900 border border-gray-300 rounded-lg w-15 bg-gray-50 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-gray-50 dark:focus:ring-blue-500 dark:focus:border-blue-500 custom-padding"
            bind:value={currentWeek}
        >
            {#each weeks as week}
                <option value={week}>
                    Week {week}
                </option>
            {/each}
        </select>
    </div>
    <div class="flow-root">
        <ul role="list" class="divide-y divide-gray-200 dark:divide-gray-700">
            {#each rankingValues as user, index}
                <li class="{listPadding}">
                    <div class="flex items-center">
                        <div class="flex-1 min-w-0 list-padding ms-1">
                            <p class="w-48 text-sm font-medium text-gray-900 truncate dark:text-gray-50">
                                {index + 1}.&nbsp;
                                {user.name ? user.name : "Ghost Roster"}
                            </p>
                        </div>
                        <div class="inline-flex items-center text-sm font-normal text-gray-600 dark:text-gray-300">
                            {user.ratings[currentWeek - 1]}
                        </div>
                    </div>
                </li>
            {/each}
        </ul>
    </div>
</div>

<style>
    .custom-width {
        min-width: 100%;
    }
    @media (min-width: 768px) {
        .custom-width {
            min-width: 19rem;
        }
    }
    .custom-padding {
        padding-right: 2rem !important;
    }
    .list-padding {
        padding: 0.2rem 0 0.2rem 0;
    }
</style>
