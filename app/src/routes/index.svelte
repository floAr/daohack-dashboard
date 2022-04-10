<script lang="ts">
	import { fetchProposals, fetchVoters, type Proposal } from '../graphql/proposals';
	import { fetchVoterWeight } from '../graphql/statistics';

	import { onMount } from 'svelte';
	import ProposalComp from '../proposalComp.svelte';

	let proposals: Proposal[] = [];

	onMount(async () => {
		proposals = await fetchProposals();
	});
</script>

<svelte:head>
	<script src="https://unpkg.com/@popperjs/core@2"></script>
	<script src="https://unpkg.com/tippy.js@6"></script>
	<link rel="stylesheet" href="https://unpkg.com/tippy.js@6/themes/dark.css" />
	<link rel="stylesheet" href="https://unpkg.com/tippy.js@6/themes/light-border.css" />
</svelte:head>
<div class="super-center">
	<!-- Vertical stack of proposals -->
	<div class="proposal-stack">
		{#each proposals as prop, i}
			<ProposalComp
				title={prop.title}
				description={prop.body}
				id={prop.id}
				answers={prop.choices}
			/>
		{/each}
	</div>
</div>

<style>
	.super-center {
		width: 100vw;
		height: 100vh;
		display: grid;
		place-items: center;
		background-color: black;
	}
	.proposal-stack {
		display: flex;
		flex-direction: column;
		justify-content: space-between;
		align-items: center;
		max-width: 880px;

		/* padding: 10px; */
		border-radius: 10px;
		background-color: #ffbf00;
		box-shadow: 0px 0px 10px rgba(0, 0, 0, 0.1);
	}
</style>
