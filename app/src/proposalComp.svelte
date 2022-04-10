<script lang="ts">
	import { onMount } from 'svelte';

	import { fetchVoters, type Voter } from './graphql/proposals';
	import { fetchVoterWeight, type Trait } from './graphql/statistics';
	import StackedBar from './stacked-bar.svelte';

	// import { marked } from 'marked';
	export let title: string;
	export let description: string;
	export let id: string;
	export let answers: string[];
	let voters: Voter[] = [];
	let total_weights: Trait[] = [];
	let answer_weights: Trait[][] = [];
	for (let i = 0; i < answers.length; i++) {
		answer_weights[i] = [];
	}

	const updateVoters = async () => {
		voters = await fetchVoters(id);
		var new_global_weights: Trait[] = [];
		var new_answer_weights: Trait[][] = [];
		for (let i = 0; i < answers.length; i++) {
			new_answer_weights[i] = [];
		}
		for (let i = 0; i < voters.length; i++) {
			let voter_weights = await fetchVoterWeight(voters[i].voter);
			let voter_choice = voters[i].choice - 1;
			voter_weights.traits.forEach((trait) => {
				// add to global weights for normalization
				let found = false;
				for (let j = 0; j < new_global_weights.length; j++) {
					if (new_global_weights[j].value == trait.value) {
						new_global_weights[j].weight += trait.weight;
						found = true;
					}
				}
				if (!found) {
					new_global_weights.push({
						value: trait.value,
						weight: trait.weight,
						weight_normalized: 0
					});
				}

				// add ot answer weights
				found = false;
				let new_answer_weight = new_answer_weights[voter_choice];
				for (let j = 0; j < new_answer_weight.length; j++) {
					if (new_answer_weight[j].value == trait.value) {
						new_answer_weight[j].weight += trait.weight;
						found = true;
					}
				}
				if (!found) {
					new_answer_weight.push({
						value: trait.value,
						weight: trait.weight,
						weight_normalized: 0
					});
				}
				new_answer_weights[voter_choice] = new_answer_weight;
			});
		}
		total_weights = new_global_weights;
		answer_weights = new_answer_weights;

	};

	const getAnswerWeight = (answer_weights: Trait[]) => {
		let answer_weight = 0;
		let total_weight = 0;
		for (let i = 0; i < answer_weights.length; i++) {
			answer_weight += answer_weights[i].weight;
		}
		for (let i = 0; i < total_weights.length; i++) {
			total_weight += total_weights[i].weight;
		}
		return (answer_weight / total_weight) * 100;
	};

	onMount(() => {
		updateVoters();
		// it's not safe to have an unchecked timer running -- problems would
		// occur if the component is destroyed before the timeout has ellapsed,
		// that's why we're using the `onMount` lifecycle function and its
		// cleanup function here
		const interval = setInterval(updateVoters, 2000);

		// this cleanup function is called when the component is destroyed
		return () => {
			clearTimeout(interval);
		};
	});
</script>

<!-- Proposal card, with title on top, smaller description and url below and then anwers below it-->

<div class="proposal-card">
	<div class="proposal-card-title">
		<h1>{title}</h1>
	</div>
	<!-- <div class="proposal-card-description">
            {@html marked(description,{sanitize:true
            })}
        </div> -->
	<div class="proposal-card-details">
		<div class="proposal-card-url">
			{voters.length} Voters.
		</div>
		<div class="proposal-card-url">
			<a href={`https://snapshot.org/#/expansiondao.eth/proposal/${id}`} target="__blank"
				>See on snapshot.org</a
			>
		</div>
	</div>
	<div class="proposal-card-answers">
		Answers:
		{#each answers as anwer, i}
			<div class="proposal-card-answer">
				<div class="proposal-card-answer-title">
					<h2>"{anwer}" - ({getAnswerWeight(answer_weights[i]).toFixed(2)}%)</h2>
					<StackedBar
						id={i.toString()}
						values={answer_weights[i]}
						total_width={getAnswerWeight(answer_weights[i])}
					/>
                    
				</div>
			</div>
		{/each}
	</div>
</div>

<style>
	.proposal-card {
		display: flex;
		flex-direction: column;
		justify-content: space-between;
		align-items: center;
		width: 100%;
		height: 100%;
		padding: 10px;
		border-radius: 10px;
		background-color: #fafafa;
		box-shadow: 0px 0px 10px rgba(0, 0, 0, 0.1);
		font-size: 0.8em;
	}

	.proposal-card-title {
		display: flex;
		flex-direction: column;
		justify-content: center;
		align-items: center;
		width: 100%;
		height: 50%;
		padding: 10px;

		background-color: #fafafa;
	}

	.proposal-card-details {
		display: flex;
		flex-direction: row;
		justify-content: center;
		align-items: center;
		width: 100%;
		height: 50%;
		padding: 10px;

		background-color: #fafafa;
	}

	.proposal-card-description {
		display: flex;
		flex-direction: column;
		justify-content: center;
		align-items: center;
		width: 100%;
		height: 50%;
		padding: 10px;

		background-color: #fafafa;
		letter-spacing: -1px;
	}

	.proposal-card-url {
		display: flex;
		flex-direction: column;
		justify-content: center;
		align-items: center;
		width: 100%;
		height: 50%;
		padding: 10px;
	}

	.proposal-card-answers {
		display: flex;
		flex-direction: column;
		justify-content: center;
		align-items: left;
		width: 100%;
		height: 50%;
		padding: 10px;
		border-radius: 10px;
		background-color: #fafafa;
		box-shadow: 0px 0px 10px rgba(0, 0, 0, 0.1);
	}
</style>
