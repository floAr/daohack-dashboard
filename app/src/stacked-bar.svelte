<script lang="ts">
	import { spring } from 'svelte/motion';
	import type { Trait } from './graphql/statistics';
    import {tooltip} from './tooltip';
	export let id: string;
	export let values: Trait[];
	export let total_width: number;
	// aggregate the total count of traits
	let total_count = 0;

	$: {
		total_count = 0;
		values.forEach((value) => {
			total_count += value.weight;
			value.value;
		});
	}

	const getStyle = (value: Trait) => {
		var style = '';
		let width = (value.weight / total_count) * 100;
		style += `width: ${width}%; height:15px;`;
		style += `background-color: ${getColor(value.value)};`;
		return style;
	};

	const getColor = (value: string) => {
		switch (value) {
			case 'Non-Binary':
				return '#ffbf00';
			case 'Male':
				return '#1a43c8';
			case 'Female':
				return '#ad2160';
			case 'Zombie':
				return '#7da269';
			case 'Ape':
				return '#36240f';
			case 'Alien':
				return '#c8fbfb';
			default:
				return 'black';
		}
	};
</script>

<!-- horizonally stacked bar chart -->
<div class="bar">
	<div
		class="stacked-bar-line"
		style={`display: flex;
    flex-direction: row;
    flex-wrap: wrap;
    justify-content: space-between;
    align-items: center;
    padding-bottom: 1em;
    width: ${total_width}%`}
	>
		{#each values as value}
			<div id={id + value.value} class="stacked-bar-line-item" style={getStyle(value)} use:tooltip title={value.value}/>
		{/each}
	</div>
	<div
		class="filler"
		style={`
width: ${100 - total_width}%;
height: 13px;

border-top: 1px solid black;
border-bottom: 1px solid black;
`}
	/>
</div>

<style>
	.bar {
		display: flex;
		flex-direction: row;
		align-items: baseline;
		width: 100%;
		height: 100%;
        justify-content: baseline;

		font-size: 0.8em;
	}
</style>
