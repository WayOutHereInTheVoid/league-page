<!-- Unified Table Component -->
<!-- This replaces all the individual table sections with one filtered table -->

{#if getCurrentTableData()}
    <DataTable class="recordTable unified-table">
        <Head>
            <Row class="rTableHeader">
                <Cell class="header headerPrimary" colspan={getCurrentTableColumns().length}>
                    {getCurrentTableTitle()}
                    <TooltipHelper text={getCurrentTableTooltip()} position="bottom" />
                </Cell>
            </Row>
            <Row>
                {#each getCurrentTableColumns() as column}
                    <Cell class="header {column.class || ''}">
                        <SortingIndicators 
                            columnId={column.id} 
                            headerText={column.label} 
                            {sortConfig}
                            on:sort={handleSort}
                        />
                        {#if column.tooltip}
                            <TooltipHelper text={column.tooltip} position="bottom" />
                        {/if}
                    </Cell>
                {/each}
            </Row>
        </Head>
        <Body>
            {#each getCurrentTableData() as record, ix}
                <Row class="{shouldHighlightRow(record, highlightedTeam, leagueTeamManagers) ? 'highlighted-team-row' : ''}">
                    {#each getCurrentTableColumns() as column}
                        <Cell class="{column.class || ''}" 
                              onclick={column.clickable ? () => gotoManager(getManagerNavigationData(record)) : undefined}>
                            {#if column.id === 'rank'}
                                {ix + 1}
                            {:else if column.id === 'manager'}
                                <RecordTeam 
                                    teamManagers={leagueTeamManagers} 
                                    {record} 
                                    {year} 
                                    {allTime} 
                                />
                            {:else if column.render}
                                {@html column.render(record)}
                            {:else}
                                {record[column.id] || 'N/A'}
                            {/if}
                        </Cell>
                    {/each}
                </Row>
            {/each}
        </Body>
    </DataTable>
{:else}
    <div class="no-data">
        <p>No records found for the current selection and filters.</p>
        <p>Try adjusting your filters or selecting a different record type.</p>
    </div>
{/if}

<style>
    .unified-table {
        margin-top: 1rem;
        min-height: 400px;
    }
    
    .no-data {
        text-align: center;
        padding: 2rem;
        color: var(--g555);
        border: 2px dashed var(--g333);
        border-radius: 8px;
        margin: 1rem 0;
    }
    
    .no-data p {
        margin: 0.5rem 0;
    }
</style>