<script>
	import { flip } from 'svelte/animate';
	import { dndzone } from 'svelte-dnd-action';
	import Svg from './Svg.svelte'
	import Paragraph from './Paragraph.svelte'
	import Image from './Image.svelte'
	import Video from './Video.svelte'
	import Code from './Code.svelte'
	import Section from './Section.svelte'
	import Options from './Options.svelte'
	import Style from './Style.svelte'
	import Connection from './Connection.svelte'
	import Authorization from './Authorization.svelte'
	import Svega from './Svega.svelte'
	import Data from './Data.svelte'
	import CouchDB from './CouchDB.svelte'
import { check_outros } from 'svelte/internal';
	export let nodes
	export let opt
	export let id
	export let depth
	export let width
	export let view
	let key

	let exempt=["Header"]

	let comp={	Paragraph:Paragraph, 
				Image:Image,
				Video:Video,
				Code:Code,
				Svg:Svg,
				Section:Section,
				Options:Options,
				Style:Style,
				Connection:Connection,
				Authorization:Authorization,
				Svega:Svega,
				Data:Data}

	const flipDurationMs = 400;
	
	function handleDndConsider(e) {
		nodes[id].links = e.detail.items
	}
	
	function handleDndFinalize(e) {
		
		nodes[id].links = e.detail.items;
		post(id)
		console.log('update node with links')
	}
	
	
async function post(id) {
	try {
		const options={
			method: 'put',
			headers: {
				"Content-Type": "application/json",
				"Accept": "application/json",
				"authorization": 'Basic ' + btoa(opt.user + ':' + opt.pwd)
			},
			body: JSON.stringify(nodes[id])
		}
		const response=await fetch(opt.url+id, options)
		const data= await response.json()
		nodes[id]._rev=data.rev
		console.log(options)
		console.log(data)
	}
	catch (err) {console.log(err)}
}

async function get(id){
	
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
				
				if (data.hasOwnProperty('links')) {await get(data.links)}
				return nodes[id]
				}
		}
	} catch (err) {
		
	console.log(id)
		console.log(err)
		return err
	}	
}

function addRemove(event,id){console.log(event.offsetY/event.currentTarget.getBoundingClientRect().height);}

</script>
{#await get(id)}
	loading {id}
	
{:then go}

	<svelte:component this={comp[nodes[id].type]} bind:nodes={nodes} bind:opt={opt} id={id} width={width} depth={depth} view={view}/>

	{#if nodes[id].links}
		<section use:dndzone={{items:nodes[id].links, flipDurationMs,type:'dnd',dragDisabled:opt.dragDisabled}}
					on:consider={handleDndConsider} 
					on:finalize={handleDndFinalize}>
			{#if depth<=opt.depth}
				{#each nodes[id].links as link (link.id)}
						<div animate:flip="{{duration: flipDurationMs}}" class="item" on:click={(event)=>addRemove(event,link.id)}>
							<svelte:self bind:nodes={nodes} bind:opt={opt} id={link.id} width={width} depth={depth+1} view={link.view}/>
						</div>
				{/each}
			{/if}
		</section>
	{/if}
{:catch error}
	<p style="color: red">{error.message}</p>
{/await}

<style>
	section {
		width: auto;
		max-width: 800px;
		border: 0px solid black;
		padding: 0;
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
	.item {
		background-color: white /*rgba(00, 100, 100, 0.05);*/
	}
</style>