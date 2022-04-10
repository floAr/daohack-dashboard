<script lang="ts">
import { fetchProposals, fetchVoters, type Proposal } from '../graphql/proposals';
import { fetchVoterWeight } from '../graphql/statistics';



	import { onMount } from 'svelte';
import ProposalComp from '../proposalComp.svelte';


    let proposals:Proposal[] = [];

	onMount(async () => {       
        
        proposals = await fetchProposals();
       


	});
</script>
 <!-- Vertical stack of proposals -->
 <div class="proposal-stack">
    {#each proposals as prop, i}
    <ProposalComp title={prop.title} description={prop.body} id={prop.id} answers={prop.choices} />
    {/each}
   
 </div>

 <style >
    .proposal-stack {
        display: flex;
        flex-direction: column;
        justify-content: space-between;
        align-items: center;
        width: 60%;
        height:10%;
        padding: 10px;
        border-radius: 10px;
        background-color: #fafafa;
        box-shadow: 0px 0px 10px rgba(0, 0, 0, 0.1);
    }
 </style>




