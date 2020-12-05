<script>
import Image from './Image.svelte'
export let opt
export let nodes
export let id
export let width
export let depth
export let view
let backgroundImageID=nodes[id].links.filter(x=>x.view=='header')[0].id
// https://images.unsplash.com/photo-1607088829306-76f3779160f6?ixid=MXwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHw%3D&ixlib=rb-1.2.1&auto=format&fit=crop&w=600&q=80
</script>
{#if nodes[backgroundImageID]}
    <section class="masthead" role="img" aria-label="Image Description" style="background-image:url({nodes[backgroundImageID].content.src})">
  		<h1  on:click={()=>{opt.history.push(opt.base); opt.base=id; console.log(id)}}>{@html nodes[id].content.title}</h1>
	</section>
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
}</style>
