<script>
	import Content from './Content.svelte'
	import { dndzone } from 'svelte-dnd-action';
	import Fig from './Fig.svelte'
	let nodes={}
	let opt={'depth':1, 'base':'root',url:'https://9231c9c3-121c-4b8e-bbfd-ac275ec62eb9-bluemix.cloudantnosqldb.appdomain.cloud/infodev/','edit':false, 'history':[], 'drag':false}
	let key=false
		function _handleKeydown(event) {
		key = event.which;
	}
	const newNodes="957fd8f002d38bd256c615b4c84cd5fc"
	
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
	

	
	$: if(key==68) {opt.drag=!opt.drag} else if (key==69) {opt.edit=!opt.edit}
</script>
<svelte:window on:keydown="{_handleKeydown}" on:keyup="{() => key = false}"/>
{opt.edit}{opt.drag}
<Content bind:nodes={nodes} bind:opt={opt} id={opt.base} depth={1}/>

<div class="back" on:click={()=>{
	if (opt.history.length>0){
		opt.base=opt.history[opt.history.length-1];
		opt.history.pop()
	}
	}}/>
	
	{#await getID(newNodes)}
	{:then go}

	
	

{/await}

<style>
	.back {
		width: 40px;
		height: 40px;
		background-color: steelblue;
		position: fixed;
  	right: 0;
  	bottom: 0;
		border-radius: 15px 0px 0px 0px
	}
	
	.new {
		width: 40px;
		min-height: 40px;
		background-color: coral;
		position: fixed;
  	left: 0;
  	bottom: 0;
		border-radius: 0px 10px 0px 0px;
		display: flex;
		flex-direction: row;
		flex-wrap:wrap;
		justify-content: center
	}
	
	.item {
		width:30px;
		height:30px;
		background-color: white;
		margin: 5px;
		border-radius: 10px;
		padding-left: 5px;
		padding-top: 3px
	}
</style>