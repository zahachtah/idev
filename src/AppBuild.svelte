<script>
	import Content from './Content.svelte'
	import { dndzone } from 'svelte-dnd-action';
    import Svg from './Svg.svelte'
    
/*
changed:

no user/passwd
newNodes=100ae244c5494db595a9fbfa6ae7fe3f
remove controls

edit rollup config to remove livereload
*/

	let nodes={}
	let opt={'depth':1,
			 'base':'100ae244c5494db595a9fbfa6ae7fe3f',
			 url:'https://9231c9c3-121c-4b8e-bbfd-ac275ec62eb9-bluemix.cloudantnosqldb.appdomain.cloud/test/',
			 'edit':false,
			 'remove':false,
			 'addParagraph':false, 
			 'addSection':false,
			 'addImage':false,
			 'showContextInfer':0,
			 'history':[], 
			 'dragDisabled':true}
	let key=false
	
	function _handleKeydown(event) {
		key = event.which;
	}

	const newNodes="100ae244c5494db595a9fbfa6ae7fe3f"


	
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
		if (elapsed<350)
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

	function toggle(v,n){
		if (n==2) {opt[v]=!opt[v]}
		else {if (opt[v]+1>=n) {opt[v]=0} else {opt[v]=opt[v]+1}}
	}
	
	//$: if(key==68) {opt.drag=!opt.drag} else if (key==69) {opt.edit=!opt.edit} // add authorization
</script>

<svelte:window on:keydown="{_handleKeydown}" on:keyup="{() => key = false}"/>

<section>
<Content bind:nodes={nodes} bind:opt={opt} id={opt.base} depth={1}/>
</section>

<div class="back" style="width: {menuWidth}" on:mousedown|self={()=>startTimer()} on:mouseup|self={()=>check()} on:touchstart|self={()=>startTimer()} on:touchend|self={()=>check()}>
<!--{#if menuWidth=="100%"}
	<span  class="control" ><Svg name="Connection" size=30 fill="black"/></span>
	<span  class="control" ><Svg name="Authorization" size=30 fill="black"/></span>
	<span  class="control" ><Svg name="Delete" size=30 fill="black"/></span>
	<span  class="control" ><Svg name="Cut" size=30 fill="black"/></span>
	<span  class="control" on:click={()=>{opt.remove=!opt.remove}}><Svg name="Remove" size=30 fill={(opt.remove)?"crimson":"black"}/></span>
	<span  class="control" on:click={()=>{opt.addSection=!opt.addSection}} ><Svg name="Section" size=30 fill={(opt.addSection)?"olive":"black"}/></span>
	<span  class="control" ><Svg name="Code" size=30 fill="black"/></span>
	<span  class="control" ><Svg name="Video" size=30 fill="black"/></span>
	<span  class="control" on:click={()=>{opt.addImage=!opt.addImage}}><Svg name="Image" size=30 fill={(opt.addImage)?"olive":"crimson"}/></span>
	<span  class="control" on:click={()=>{opt.addParagraph=!opt.addParagraph}}><Svg name="Paragraph" size=30 fill={(opt.addParagraph)?"olive":"black"}/></span>
	<span  class="control" on:click={()=>{opt.edit=!opt.edit}}><Svg name="Editor" size=30 fill={(opt.edit)?"olive":"crimson"}/></span>
	<span  class="control" on:click={()=>{opt.dragDisabled=!opt.dragDisabled}}><Svg name="Move" size=30 fill={(opt.dragDisabled)?"crimson":"olive"}/></span>
	<span  class="control" ><Svg name="Equation" size=30 fill="black"/></span>
	<span  class="control" on:click={()=>{toggle('showContextInfer',3)}}><Svg name="Connection" size=30 fill={(opt.showContextInfer!=0)?"olive":"black"}/></span>
{/if}
-->
</div>



<style>
:global(body){
	margin:0;
	padding:0;

	}


	.back {
		box-sizing: border-box;
		display:flex;
		flex-direction: row-reverse;
		justify-content: center;
		align-content: center;
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
		height:40px;
		margin:0px;
		padding:40;
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
		margin-left: auto;
		margin-right:auto;
		width: 100%;
		max-width: 800px;
		border: 0px solid black;
		padding: 0;
        /* this will allow the dragged element to scroll the list */
		overflow-y: auto ;
		height: auto;
		background-color: white; /* rgba(100, 100, 100, 0.05);*/ 
		padding-bottom: 40px 
	}
	:global(body)::-webkit-scrollbar {
    display: none;
}

/* Hide scrollbar for IE, Edge and Firefox */
:global(body) {
  -ms-overflow-style: none;  /* IE and Edge */
  scrollbar-width: none;  /* Firefox */
}
</style>