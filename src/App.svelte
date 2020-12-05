<script>
	import Content from './Content.svelte'
	import { dndzone } from 'svelte-dnd-action';
	import Svg from './Svg.svelte'
	let nodes={}
	let opt={'depth':1, 'base':'root',url:'https://9231c9c3-121c-4b8e-bbfd-ac275ec62eb9-bluemix.cloudantnosqldb.appdomain.cloud/test/','edit':false, 'history':[], 'drag':false}
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
	let start
	let menuWidth="40px"
	function startTimer(){
		start=Date.now()
	}
	function check(){
		const elapsed=Date.now()-start
		if (elapsed<500)
			{	if (opt.history.length>0){
		opt.base=opt.history[opt.history.length-1];
		opt.history.pop()
	}}
		else
			{
				if (menuWidth=="40px")
					{menuWidth='100%'}
					else
					{menuWidth="40px"}
			}
	}

	
	$: if(key==68) {opt.drag=!opt.drag} else if (key==69) {opt.edit=!opt.edit} // add authorization
</script>
<svelte:window on:keydown="{_handleKeydown}" on:keyup="{() => key = false}"/>
<section>
<Content bind:nodes={nodes} bind:opt={opt} id={opt.base} depth={1}/>
</section>
<div class="back" style="width: {menuWidth}" on:mousedown={()=>startTimer()} on:mouseup={()=>check()} on:touchstart={()=>startTimer()} on:touchend={()=>check()}>
{#if menuWidth=="100%"}
	<span  class="control" ><Svg name="Image" size=30 fill="black"/></span>
	<span  class="control" ><Svg name="Image" size=30 fill="black"/></span>
	<span  class="control" ><Svg name="Image" size=30 fill="black"/></span>
	<span  class="control" ><Svg name="Image" size=30 fill="black"/></span>
	<span  class="control" ><Svg name="Image" size=30 fill="black"/></span>
	<span  class="control" ><Svg name="Image" size=30 fill="black"/></span>
	<span  class="control" ><Svg name="Image" size=30 fill="black"/></span>
	<span  class="control" ><Svg name="Image" size=30 fill="black"/></span>
{/if}
</div>
	
	{#await getID(newNodes)}
	{:then go}

	
	

{/await}


<style>
:global(body){
	margin:0;
	padding:0;

	}

	.back {
		box-sizing: border-box;
		display:flex;
		flex-direction: row-reverse;
		height: 40px;
		background-color: rgba(230,230,240,0.8);
		position: fixed;
  		right: 0;
  		bottom: 0;
		border-radius: 15px 0px 0px 0px;
		padding-right:40px;
		white-space: nowrap;
	}
	.control {
		width:40px;
		display: inline-block;
		padding: 5px
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
</style>