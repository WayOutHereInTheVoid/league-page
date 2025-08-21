<script>
    import { createEventDispatcher } from 'svelte';
    import Button, { Label } from '@smui/button';
    import IconButton from '@smui/icon-button';
    
    const dispatch = createEventDispatcher();
    
    let { 
        tableData = [],
        tableName = 'Records',
        exportFormats = ['csv', 'json'],
        showDropdown = false
    } = $props();
    
    const toggleDropdown = () => {
        showDropdown = !showDropdown;
    };
    
    const closeDropdown = () => {
        showDropdown = false;
    };
    
    const exportData = (format) => {
        try {
            let content, mimeType, extension;
            const filename = `${tableName.replace(/\s+/g, '_').toLowerCase()}_${new Date().toISOString().split('T')[0]}`;
            
            switch (format) {
                case 'csv':
                    content = convertToCSV(tableData);
                    mimeType = 'text/csv';
                    extension = 'csv';
                    break;
                case 'json':
                    content = JSON.stringify(tableData, null, 2);
                    mimeType = 'application/json';
                    extension = 'json';
                    break;
                case 'txt':
                    content = convertToText(tableData);
                    mimeType = 'text/plain';
                    extension = 'txt';
                    break;
                default:
                    throw new Error(`Unsupported format: ${format}`);
            }
            
            downloadFile(content, `${filename}.${extension}`, mimeType);
            closeDropdown();
            
            dispatch('export', { 
                format, 
                filename: `${filename}.${extension}`,
                recordCount: tableData.length 
            });
            
        } catch (error) {
            console.error('Export failed:', error);
            dispatch('exportError', { error: error.message, format });
        }
    };
    
    const convertToCSV = (data) => {
        if (!data || data.length === 0) return '';
        
        const headers = Object.keys(data[0]);
        const csvHeaders = headers.join(',');
        
        const csvRows = data.map(row => {
            return headers.map(header => {
                const value = row[header];
                // Handle commas and quotes in CSV
                if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
                    return `"${value.replace(/"/g, '""')}"`;
                }
                return value || '';
            }).join(',');
        });
        
        return [csvHeaders, ...csvRows].join('\n');
    };
    
    const convertToText = (data) => {
        if (!data || data.length === 0) return '';
        
        const headers = Object.keys(data[0]);
        const maxWidths = headers.map(header => {
            const headerLength = header.length;
            const maxValueLength = Math.max(...data.map(row => String(row[header] || '').length));
            return Math.max(headerLength, maxValueLength, 8); // minimum width of 8
        });
        
        // Create header row
        const headerRow = headers.map((header, i) => header.padEnd(maxWidths[i])).join(' | ');
        const separatorRow = maxWidths.map(width => '-'.repeat(width)).join('-+-');
        
        // Create data rows
        const dataRows = data.map(row => {
            return headers.map((header, i) => {
                const value = String(row[header] || '');
                return value.padEnd(maxWidths[i]);
            }).join(' | ');
        });
        
        return [headerRow, separatorRow, ...dataRows].join('\n');
    };
    
    const downloadFile = (content, filename, mimeType) => {
        const blob = new Blob([content], { type: mimeType });
        const url = URL.createObjectURL(blob);
        
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        // Clean up the URL object
        setTimeout(() => URL.revokeObjectURL(url), 1000);
    };
    
    // Close dropdown when clicking outside
    const handleOutsideClick = (event) => {
        if (showDropdown && !event.target.closest('.export-button-container')) {
            closeDropdown();
        }
    };
    
    let recordCount = $derived(() => tableData?.length || 0);
</script>

<style>
    .export-button-container {
        position: relative;
        display: inline-block;
    }
    
    .export-button {
        border-radius: 6px !important;
        background-color: var(--blueTwo) !important;
        color: white !important;
        font-weight: 600 !important;
        transition: all 0.2s ease-out !important;
        min-height: 36px !important;
        display: flex !important;
        align-items: center !important;
        gap: 0.5rem !important;
        padding: 8px 12px !important;
        font-size: 0.85em !important;
    }
    
    .export-button:hover {
        background-color: color-mix(in srgb, var(--blueTwo) 90%, black 10%) !important;
        transform: translateY(-1px);
        box-shadow: 0 2px 6px rgba(255, 112, 67, 0.3);
    }
    
    .export-icon {
        width: 16px;
        height: 16px;
    }
    
    .export-dropdown {
        position: absolute;
        top: 100%;
        right: 0;
        background: white;
        border: 1px solid var(--ddd);
        border-radius: 6px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        z-index: 100;
        min-width: 150px;
        margin-top: 4px;
        overflow: hidden;
    }
    
    .export-option {
        padding: 10px 12px;
        cursor: pointer;
        border-bottom: 1px solid var(--eee);
        transition: background-color 0.2s ease-out;
        display: flex;
        align-items: center;
        gap: 0.5rem;
        font-size: 0.9em;
    }
    
    .export-option:hover {
        background-color: var(--r2);
    }
    
    .export-option:last-child {
        border-bottom: none;
    }
    
    .format-icon {
        width: 16px;
        height: 16px;
        color: var(--blueTwo);
    }
    
    .format-info {
        display: flex;
        flex-direction: column;
    }
    
    .format-name {
        font-weight: 600;
        color: var(--g333);
        text-transform: uppercase;
    }
    
    .format-description {
        font-size: 0.8em;
        color: var(--g999);
    }
    
    .export-info {
        padding: 8px 12px;
        background-color: var(--r1);
        border-bottom: 1px solid var(--eee);
        font-size: 0.8em;
        color: var(--g555);
        text-align: center;
    }
    
    .record-count {
        font-weight: 600;
        color: var(--blueOne);
    }
    
    @media (max-width: 768px) {
        .export-button {
            font-size: 0.8em !important;
            padding: 6px 10px !important;
            min-height: 32px !important;
        }
        
        .export-icon {
            width: 14px;
            height: 14px;
        }
        
        .export-dropdown {
            right: auto;
            left: 0;
            min-width: 140px;
        }
        
        .export-option {
            padding: 8px 10px;
            font-size: 0.85em;
        }
    }
</style>

<svelte:window onclick={handleOutsideClick} />

<div class="export-button-container">
    <Button 
        class="export-button"
        onclick={toggleDropdown}
        variant="raised"
        title="Export table data"
        disabled={recordCount() === 0}
    >
        <svg class="export-icon" viewBox="0 0 24 24" fill="currentColor">
            <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z" />
        </svg>
        <Label>Export</Label>
        <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
            <path d="M7,10L12,15L17,10H7Z" />
        </svg>
    </Button>
    
    {#if showDropdown}
        <div class="export-dropdown">
            <div class="export-info">
                <span class="record-count">{recordCount()}</span> record{recordCount() !== 1 ? 's' : ''}
            </div>
            
            {#each exportFormats as format}
                <div 
                    class="export-option"
                    onclick={() => exportData(format)}
                    role="button"
                    tabindex="0"
                >
                    <svg class="format-icon" viewBox="0 0 24 24" fill="currentColor">
                        {#if format === 'csv'}
                            <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z" />
                        {:else if format === 'json'}
                            <path d="M5,3H7V5H5V10A2,2 0 0,1 3,12A2,2 0 0,1 5,14V19H7V21H5C3.93,20.73 3,20.1 3,19V15A2,2 0 0,0 1,13H0V11H1A2,2 0 0,0 3,9V5C3,3.9 3.9,3 5,3M19,3A2,2 0 0,1 21,5V9A2,2 0 0,0 23,11H24V13H23A2,2 0 0,0 21,15V19A2,2 0 0,1 19,21H17V19H19V14A2,2 0 0,1 21,12A2,2 0 0,1 19,10V5H17V3H19Z" />
                        {:else}
                            <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z" />
                        {/if}
                    </svg>
                    
                    <div class="format-info">
                        <div class="format-name">{format.toUpperCase()}</div>
                        <div class="format-description">
                            {#if format === 'csv'}
                                Spreadsheet compatible
                            {:else if format === 'json'}
                                Structured data format
                            {:else if format === 'txt'}
                                Plain text table
                            {/if}
                        </div>
                    </div>
                </div>
            {/each}
        </div>
    {/if}
</div>
