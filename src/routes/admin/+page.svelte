<!-- Admin Interface Main Page -->
<script>
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';
	import { getComponentsByCategory } from '$lib/admin/componentRegistry.js';
	import { pageLayoutManager } from '$lib/admin/pageLayoutManager.js';
	import AdminNavigation from './AdminNavigation.svelte';
	import SimplifiedPageBuilder from './SimplifiedPageBuilder.svelte';
	import ComponentPalette from './ComponentPalette.svelte';

	// Admin authentication (simple password protection)
	let isAuthenticated = false;
	let password = '';
	let showLogin = true;
	
	// Page builder state
	let currentPage = 'homepage';
	let availablePages = ['homepage', 'managers'];
	let componentCategories = {};
	let selectedSection = null;
	let previewMode = false;

	// Admin password - in production, this should be environment variable
	const ADMIN_PASSWORD = 'trl-admin-2024';

	onMount(() => {
		// Check if already authenticated (session storage)
		const authStatus = sessionStorage.getItem('league-admin-auth');
		if (authStatus === 'true') {
			isAuthenticated = true;
			showLogin = false;
			initializeBuilder();
		}

		// Load component categories
		componentCategories = getComponentsByCategory();
	});

	function handleLogin() {
		if (password === ADMIN_PASSWORD) {
			isAuthenticated = true;
			showLogin = false;
			sessionStorage.setItem('league-admin-auth', 'true');
			initializeBuilder();
		} else {
			alert('Incorrect password. Please try again.');
			password = '';
		}
	}

	function handleLogout() {
		isAuthenticated = false;
		showLogin = true;
		sessionStorage.removeItem('league-admin-auth');
		password = '';
		goto('/');
	}

	function initializeBuilder() {
		// Initialize the page layout manager
		// In future, this will load existing configurations from leagueInfo.js
		console.log('Admin interface initialized');
	}

	function switchPage(pageName) {
		currentPage = pageName;
		selectedSection = null;
	}

	function handleSectionSelect(event) {
		selectedSection = event.detail.section;
	}

	function handleLayoutUpdate(event) {
		const { page: pageName, layout } = event.detail;
		pageLayoutManager.updatePageLayout(pageName, layout);
		console.log(`Layout updated for ${pageName}:`, layout);
	}

	function togglePreview() {
		previewMode = !previewMode;
	}

	function saveChanges() {
		// This will eventually write to leagueInfo.js
		const config = pageLayoutManager.exportToLeagueInfo();
		console.log('Saving configuration:', config);
		
		// For now, just show success message
		alert('Layout saved! In the full implementation, this will update your leagueInfo.js file.');
	}
</script>

<style>
	.admin-container {
		min-height: 100vh;
		background-color: #f5f5f5;
		font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
	}

	.login-overlay {
		position: fixed;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
		background-color: rgba(0, 0, 0, 0.8);
		display: flex;
		align-items: center;
		justify-content: center;
		z-index: 1000;
	}

	.login-box {
		background: white;
		padding: 2rem;
		border-radius: 8px;
		box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
		text-align: center;
		min-width: 300px;
	}

	.login-box h2 {
		margin: 0 0 1rem 0;
		color: #333;
	}

	.login-box input {
		width: 100%;
		padding: 0.75rem;
		margin: 0.5rem 0;
		border: 1px solid #ddd;
		border-radius: 4px;
		font-size: 1rem;
	}

	.login-box button {
		background-color: #007cba;
		color: white;
		border: none;
		padding: 0.75rem 1.5rem;
		border-radius: 4px;
		cursor: pointer;
		font-size: 1rem;
		width: 100%;
	}

	.login-box button:hover {
		background-color: #005a8b;
	}

	.admin-header {
		background-color: #2c3e50;
		color: white;
		padding: 1rem 2rem;
		display: flex;
		justify-content: between;
		align-items: center;
		box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
	}

	.admin-title {
		font-size: 1.5rem;
		font-weight: bold;
		margin: 0;
	}

	.admin-actions {
		display: flex;
		gap: 1rem;
		margin-left: auto;
	}

	.btn {
		padding: 0.5rem 1rem;
		border: none;
		border-radius: 4px;
		cursor: pointer;
		font-size: 0.9rem;
		transition: background-color 0.2s;
	}

	.btn-primary {
		background-color: #3498db;
		color: white;
	}

	.btn-primary:hover {
		background-color: #2980b9;
	}

	.btn-secondary {
		background-color: #95a5a6;
		color: white;
	}

	.btn-secondary:hover {
		background-color: #7f8c8d;
	}

	.btn-success {
		background-color: #27ae60;
		color: white;
	}

	.btn-success:hover {
		background-color: #229954;
	}

	.admin-content {
		display: flex;
		height: calc(100vh - 80px);
	}

	.sidebar {
		width: 300px;
		background-color: white;
		border-right: 1px solid #ddd;
		display: flex;
		flex-direction: column;
	}

	.main-editor {
		flex: 1;
		background-color: white;
		display: flex;
		flex-direction: column;
	}

	.page-tabs {
		display: flex;
		background-color: #f8f9fa;
		border-bottom: 1px solid #ddd;
		padding: 0 1rem;
	}

	.page-tab {
		padding: 0.75rem 1.5rem;
		background: none;
		border: none;
		cursor: pointer;
		font-size: 1rem;
		border-bottom: 3px solid transparent;
		transition: all 0.2s;
	}

	.page-tab.active {
		border-bottom-color: #007cba;
		background-color: white;
		font-weight: bold;
	}

	.page-tab:hover {
		background-color: #e9ecef;
	}

	.editor-content {
		flex: 1;
		padding: 1rem;
		overflow-y: auto;
	}

	.welcome-message {
		text-align: center;
		padding: 2rem;
		color: #666;
	}

	.back-link {
		color: #007cba;
		text-decoration: none;
		margin-right: 1rem;
	}

	.back-link:hover {
		text-decoration: underline;
	}

	@media (max-width: 768px) {
		.admin-content {
			flex-direction: column;
		}

		.sidebar {
			width: 100%;
			height: 200px;
		}

		.admin-actions {
			flex-direction: column;
			gap: 0.5rem;
		}
	}
</style>

<div class="admin-container">
	<!-- Login Overlay -->
	{#if showLogin}
		<div class="login-overlay">
			<div class="login-box">
				<h2>League Admin Access</h2>
				<p>Enter the admin password to access the visual page builder:</p>
				<form on:submit|preventDefault={handleLogin}>
					<input 
						type="password" 
						bind:value={password} 
						placeholder="Admin Password"
						required
					/>
					<button type="submit">Login</button>
				</form>
			</div>
		</div>
	{/if}

	<!-- Admin Interface -->
	{#if isAuthenticated}
		<!-- Header -->
		<div class="admin-header">
			<div>
				<a href="/" class="back-link">← Back to League Page</a>
				<h1 class="admin-title">Visual Page Builder</h1>
			</div>
			<div class="admin-actions">
				<button class="btn btn-secondary" on:click={togglePreview}>
					{previewMode ? 'Edit Mode' : 'Preview Mode'}
				</button>
				<button class="btn btn-success" on:click={saveChanges}>
					Save Changes
				</button>
				<button class="btn btn-secondary" on:click={handleLogout}>
					Logout
				</button>
			</div>
		</div>

		<!-- Main Content -->
		<div class="admin-content">
			<!-- Sidebar -->
			<div class="sidebar">
				<AdminNavigation 
					{currentPage} 
					{availablePages}
					on:pageChange={(e) => switchPage(e.detail.page)}
				/>
				
				{#if !previewMode}
					<ComponentPalette 
						{componentCategories}
						{currentPage}
					/>
				{/if}
			</div>

			<!-- Main Editor -->
			<div class="main-editor">
				<!-- Page Tabs -->
				<div class="page-tabs">
					{#each availablePages as pageName}
						<button 
							class="page-tab"
							class:active={currentPage === pageName}
							on:click={() => switchPage(pageName)}
						>
							{pageName.charAt(0).toUpperCase() + pageName.slice(1)}
						</button>
					{/each}
				</div>

				<!-- Editor Content -->
				<div class="editor-content">
					{#if currentPage}
						<SimplifiedPageBuilder 
							page={currentPage}
							{previewMode}
							{selectedSection}
							on:sectionSelect={handleSectionSelect}
							on:layoutUpdate={handleLayoutUpdate}
						/>
					{:else}
						<div class="welcome-message">
							<h2>Welcome to the Visual Page Builder</h2>
							<p>Select a page from the sidebar to start editing your league page layout.</p>
						</div>
					{/if}
				</div>
			</div>
		</div>
	{/if}
</div>
