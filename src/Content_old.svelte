<script>
	import { flip } from 'svelte/animate';
	import { dndzone } from 'svelte-dnd-action';
	import Fig from './Fig.svelte'
	import Paragraph from './Paragraph.svelte'
	import Image from './Image.svelte'
	import Video from './Video.svelte'
	import Code from './Code.svelte'
	export let nodes
	export let opt
	export let id
	export let depth
	let key


	const flipDurationMs = 400;
	
	function handleDndConsider(e) {
		nodes[id].links = e.detail.items
	}
	
	function handleDndFinalize(e) {
		
		nodes[id].links = e.detail.items
	}
	
	
	async function getID(id){
		if (!nodes[id]){
		await fetch(opt.url+id)
			.then(res => res.json())
			.then(data => {
				nodes[id]= data;
			console.log(id)
			}).catch(function(error) {
			console.log(error);
					
		});
	}
}


async function get(id){
	console.log(id)
	try {
		if (Array.isArray(id))
			{
				const options={
    			method: 'post',
    			headers: {
      			"Content-Type": "application/json"
    			},
    			body: JSON.stringify({keys:id.map(el=>el.id), include_docs:true})
  			}
				const response=await fetch(opt.url+'_all_docs', options)
				const data= await response.json()
				const add=[]
				data.rows.forEach(el => {
					nodes[el.id]=el.doc; 
					if (nodes[el.id].hasOwnProperty('links'))
						{if (nodes[el.id].links.length>0)	
							{nodes[el.id].links.forEach(link=>add.push(link))}; };
						});
				 if (add.length>0){await get(add)};// not sure how add coulc be empty as links.length has to be >0
				return data
			}
		else {
			if (nodes[id]) //don't fetch it twice
				{ //IF nodes[id].links and these not in keys(nodes) then bulk-fetch these
					return nodes[id]}
			else 
				{
				const response=await fetch(opt.url+id)
				//console.log(response)
				const data= await response.json()
				nodes[id]=data;
				
				if (data.hasOwnProperty('links')) {get(data.links)}
				return nodes[id]
				}
		}
	} catch (err) {
		
	console.log(id)
		console.log(err)
		return err
	}	
}

async function get(id){
	console.log(id)
	try {
		if (Array.isArray(id))
			{
				const options={
    			method: 'post',
    			headers: {
      			"Content-Type": "application/json"
    			},
    			body: JSON.stringify({keys:id.map(el=>el.id), include_docs:true})
  			}
				const response=await fetch(opt.url+'_all_docs', options)
				const data= await response.json()
				const add=[]
				data.rows.forEach(el => {
					nodes[el.id]=el.doc; 
					if (nodes[el.id].hasOwnProperty('links'))
						{if (nodes[el.id].links.length>0)	
							{nodes[el.id].links.forEach(link=>add.push(link))}; };
						});
				 if (add.length>0){await get(add)};// not sure how add coulc be empty as links.length has to be >0
				return data
			}
		else {
			if (nodes[id]) //don't fetch it twice
				{ //IF nodes[id].links and these not in keys(nodes) then bulk-fetch these
					return nodes[id]}
			else 
				{
				const response=await fetch(opt.url+id)
				//console.log(response)
				const data= await response.json()
				nodes[id]=data;
				
				if (data.hasOwnProperty('links')) {get(data.links)}
				return nodes[id]
				}
		}
	} catch (err) {
		
	console.log(id)
		console.log(err)
		return err
	}	
}

//getID(id)	
</script>


{#await get(id)}
	loading
{:then go}
	<!-- responsive: very narrow column: <Fig name={nodes[id].type} size=12/> -->
	{#if nodes[id].type=="Section"}
		{#if depth>1}<hr>{/if}
		<h4>
			
			{#if nodes[id].content.title} <span on:click={()=>{opt.history.push(opt.base); opt.base=id}}>{@html nodes[id].content.title}</span><span on:click={()=>{depth=depth-1}}><b>+</b>{depth}</span>{:else}{@html nodes[id].type}{/if}
		</h4>
	{:else if nodes[id].type=="Paragraph"}
		<Paragraph node={nodes[id]} width=100/>
	{:else if nodes[id].type=="Image"}
		<Image node={nodes[id]} opt={opt} width=100/>
	{:else if nodes[id].type=="Video"}
		<Video node={nodes[id]} opt={opt} width=100/>
	{:else if nodes[id].type=="Code"}
		<Code node={nodes[id]} opt={opt} width=100/>
	{/if}

	{#if nodes[id].links}
		<section use:dndzone={{items:nodes[id].links, flipDurationMs}}
					on:consider={handleDndConsider} 
					on:finalize={handleDndFinalize}>
			{#if depth<=opt.depth}
				{#each nodes[id].links as link (link.id)}
					<div animate:flip="{{duration: flipDurationMs}}" class="item">
						<svelte:self bind:nodes={nodes} bind:opt={opt} id={link.id} depth={depth+1}/>
					</div>
				{/each}
			{/if}
		</section>
	{/if}
{:catch error}
	<p style="color: red">{error.message}</p>
{/await}
<!--
{#if nodes[id]}
	<h4>
		{#if nodes[id].content.title} {@html nodes[id].content.title}<span on:click={()=>{depth=depth-1}}><b>+</b>{depth}</span>{:else}{@html nodes[id].type}{/if}
	</h4>
	{#if nodes[id].links}
			<section use:dndzone={{items:nodes[id].links, flipDurationMs}}
					 on:consider={handleDndConsider} 
					 on:finalize={handleDndFinalize}>
				{#if depth<=opt.depth}
					{#each nodes[id].links as link (link.id)}
						<div animate:flip="{{duration: flipDurationMs}}" class="item">
							<svelte:self bind:nodes={nodes} bind:opt={opt} id={link.id} depth={depth+1}/>
						</div>
					{/each}
				{:else}
				{/if}
	</section>
	{/if}
{/if}-->



<style>
	section {
		width: auto;
		border: 0px solid black;
		padding: 0.2em;
        /* this will allow the dragged element to scroll the list */
		overflow-y: auto ;
		height: auto;
		background-color: white /* rgba(100, 100, 100, 0.05);*/ 
	}
	div {
		width: 95%;
		padding: 0.2em;
		border: 0px solid blue;
		margin: 0.15em 0;
	}
	.item{
		background-color: white /*rgba(00, 100, 100, 0.05);*/
	}
</style>