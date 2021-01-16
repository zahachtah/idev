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
	import Disqus from './Disqus.svelte'
import { check_outros } from 'svelte/internal';
	export let nodes
	export let opt
	export let id
	export let depth
	export let width
	export let view={}
	export let addDepth=0
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
		console.log(e)
		nodes[id].links = e.detail.items;
		post(id)
		console.log('update node with links')
	}
	function uuid() {
	return ([1e7] + -1e3 + -4e3 + -8e3 + -1e11).replace(/[018]/g, function (c) {
		return (c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).toString(16);
	}).replace(/-/g, "");
};
	
async function post(id) {
	try {
		nodes[id].updated= new Date()
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

function docUpdates(doc){
	if (doc.content.context==""){doc.content.context="context"}
	if (doc.content.infer==""){doc.content.infer="infer"}
	return doc
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
					nodes[el.id]=docUpdates(el.doc); 
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

				nodes[id]=docUpdates(data);
				
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

function newNode(type){
		const base={
				_id:uuid(),
				info: {
				comments: false,
				updated: new Date(),
				created: new Date(),
				tags: [],
				linked: [],
				todo: [],
				contribution: [
					{
						"5fb3c55dbdd14e87821828892133904a": [
						"created",
						"author"
						]
					}
				]
				},
				content: {
					context: "context",
					infer: "infer",
					text: "New text"
				},
				private: true,
				live: true,
				type: "Paragraph"
			}
		if (type=='Paragraph')
		{
			return base
		}
		if (type=='Section')
		{
			base.links=[]
			base.type="Section"
			base.content.title="New Section"
			delete base.content.text
			return base
		}
		if (type=='Image')
		{
			base.content.src="url"
			base.type="Image"
			return base
		}		

	}

function addRemove(event,i,id,parent){
	const y=event.offsetY/event.currentTarget.getBoundingClientRect().height
	console.log(y);
	console.log(i)
	console.log('node: '+id);
	console.log('parent: '+parent);
	console.log(nodes[id].links)
	if (opt.addParagraph){
		const thisID=uuid()
		nodes[thisID]=newNode('Paragraph')
		console.log(nodes[thisID])
		post(thisID)
		// Note make it dependent on where one clicks!!
		nodes[parent].links.splice(i+1,0,{id:thisID,view:'inline'})
		post(parent) //NOTE: try to make  bulk-post!
		opt.addParagraph=false
	}
	else if (opt.addSection){
		const thisID=uuid()
		nodes[thisID]=newNode('Section')
		console.log(nodes[thisID])
		post(thisID)
		// Note make it dependent on where one clicks!!
		nodes[parent].links.splice(i+1,0,{id:thisID,view:'inline',addDepth:1})
		post(parent) //NOTE: try to make  bulk-post!
		opt.addSection=false
	}
	else if (opt.addImage){
		const thisID=uuid()
		nodes[thisID]=newNode('Image')
		console.log(nodes[thisID])
		post(thisID)
		// Note make it dependent on where one clicks!!
		nodes[parent].links.splice(i+1,0,{id:thisID,view:'inline'})
		post(parent) //NOTE: try to make  bulk-post!
		opt.addImage=false
	}
	else if (opt.remove){
		nodes[parent].links.splice(i,1)
		post(parent) //NOTE: try to make  bulk-post!
		opt.remove=false
	}
	
}

let timer;

function debounce() {
    console.log('start debounce');
		clearTimeout(timer);
		timer = setTimeout(() => {post(id);}, 1500);
  }

//$: if (view) {if (view.addDepth){addDepth=view.addDepth}}

//$: {console.log(addDepth)}
</script>
{#await get(id)}
	loading
	
{:then go}
	{#if opt.showContextInfer>0}
	<!-- MAKE A RND NOTE EDIT FUNCTION, SORTED BY DATE??-->
		<div>context: <span style="color:olive" on:keyup={()=>debounce()} contenteditable=true  bind:innerHTML={nodes[id].content.context}></span></div>
	{/if}
	{#if opt.showContextInfer<2}
	<svelte:component this={comp[nodes[id].type]} bind:nodes={nodes} bind:opt={opt} id={id} width={width} depth={depth} view={view} bind:addDepth={addDepth}/>
	{/if}
	{#if opt.showContextInfer>0}
		<div style="margin-bottom:0.3em">infer: <span style="color:orange" on:keyup={()=>debounce()} contenteditable=true  bind:innerHTML={nodes[id].content.infer}> </span>  </div>
	{/if}

	{#if (nodes[id].links && depth<=opt.depth+addDepth+(view.hasOwnProperty("addDepth")?view.addDepth:0))}
		<section use:dndzone={{items:nodes[id].links, flipDurationMs,type:'dnd',dragDisabled:opt.dragDisabled}}
					on:consider={handleDndConsider} 
					on:finalize={handleDndFinalize}>
				{#each nodes[id].links as link,i (link.id)}
						<div animate:flip="{{duration: flipDurationMs}}" class="item" on:click={(event)=>addRemove(event,i,link.id,id)}>
							<svelte:self bind:nodes={nodes} bind:opt={opt} id={link.id} width={width} depth={depth+1} addDepth={addDepth} view={link}/>
						</div>
				{/each}
		</section>
	{/if}
	{#if depth==1}
	{#if nodes[id].info.comments}
		<Disqus id={id} title={nodes[id].content.title}/>
	{/if}
	{/if}
{:catch error}
	<p style="color: red">{error.message}</p>
{/await}

<style>
	section {
		width: auto;
		max-width: 800px;
		min-height: 40px;
		border: 0px solid black;
		padding: 0;
		margin: 0;
        /* this will allow the dragged element to scroll the list */
		overflow-y: auto ;
		height: auto;
		background-color: white; /* rgba(100, 100, 100, 0.05);*/ 

	}
	div {
		width: 100%;
		padding:0;
		padding-bottom: 0.3em;
		border: 0px solid blue;
		margin: 0;
	}
	.item {
		background-color: white /*rgba(00, 100, 100, 0.05);*/
	}

</style>