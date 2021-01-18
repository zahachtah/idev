<script>
import Image from './Image.svelte'
import Svg from './Svg.svelte'
export let opt
export let nodes
export let id
export let width
export let depth
export let view
export let addDepth
let backgroundImageID

if (nodes[id].links.length>0){
  if (nodes[id].links.filter(x=>x.view=='header')[0])
    {backgroundImageID=nodes[id].links.filter(x=>x.view=='header')[0].id}
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

let timer;
function debounce() {
    console.log('start debounce');
		clearTimeout(timer);
		timer = setTimeout(() => {post(id);}, 1500);
  }

function addToHistory(){
  if (id!=opt.base && (view.view!="thumb" || opt.edit)){ // avoid adding when already base
  opt.history.push(opt.base); 
  opt.base=id;
  window.scrollTo(0, 0);
}
}

</script>
{#if nodes[backgroundImageID]}
    <section class="masthead" role="img" aria-label="Image Description" style="background-image:url({nodes[backgroundImageID].content.src})">
      
      {#if opt.edit}
      <h1  on:click={()=>addToHistory()} on:keyup={()=>debounce()} contenteditable=true bind:innerHTML={nodes[id].content.title}/>
    {:else}
      <h1  on:click={()=>addToHistory()} style="color:{view.view=="thumb" ? "lightgray" : "white"};">{@html nodes[id].content.title} </h1> 
    {/if}
  </section>
  {:else}
  {#if opt.edit}
  
  <div class="section" style="padding-bottom:{Math.max(0.0,0.9-(depth-2)*0.6)}em; padding-top:{Math.max(0.0,1.5-(depth-2))}em ">
    <h2  on:click={()=>addToHistory()}  on:keyup={()=>debounce()} contenteditable=true bind:innerHTML={nodes[id].content.title} style="font-size:{1.0+0.5/(depth-1)}em" /> 
    <span  on:click|stopPropagation={()=>{ addDepth++}}>
      <Svg name="Circle" size="1.2em" fill="#ddd"/>
    </span>
  </div>
{:else}
<!-- REMEMBER TO MAKE ADDDEPTH TOGGLE INSTEAD!-->
<div class="section" style="padding-bottom:{Math.max(0.0,1.5-(depth-2)*1.3)}em; padding-top:{Math.max(0.0,1.5-(depth-2))}em ">
<h2  on:click={()=>addToHistory()}  on:keyup={()=>debounce()} style="font-size:{1.0+0.5/(depth-1)}em; color:{(depth<=2)?"black":"gray"}">{@html nodes[id].content.title}</h2><span  on:click|stopPropagation={()=>{ addDepth++}}><Svg name="Circle" size="1.2em" fill="#ddd"/> </span></div>
{/if}
    
  {/if}


<style>
	.masthead {
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
  text-align: center;
  width: 100%;
  height: 60vw; /* if you don't want it to take up the full screen, reduce this number */
  max-height: 400px;
  overflow: hidden;
  background-size: cover !important;
  background:  no-repeat center center scroll;
}

h1 {
  font-style: normal;
  font-weight: bold;
  color: #eee;
  font-size: min(8vmin,30px);
  letter-spacing: 0.03em;
  line-height: 1;
  text-shadow: 1px 2px 4px rgba(0, 0, 0, 0.8);
  margin-bottom: -90px;/* 40 to be in middle */
}

h2 {
  display: inline
}
.section{
  margin:0;
  margin-bottom: 1.4em;
  padding:0;
}
</style>
