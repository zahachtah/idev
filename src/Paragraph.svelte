<script>
  export let opt
  export let width
  export let nodes
  export let id
  export let depth
  export let view

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
  
</script>

{#if opt.edit}
  <div on:keyup={()=>debounce()} contenteditable=true bind:innerHTML={nodes[id].content.text}></div>
{:else}
  <div on:keyup={()=>debounce()} contenteditable=false  bind:innerHTML={nodes[id].content.text}></div>  
{/if}
<!--
  {#if view.mode=='structure'}
    <span contenteditable={view.edit} style="color:salmon">{@html node.content.text.substring(0, 40)}</span>
  {:else}
    <span contenteditable={view.edit}>{@html node.content.text}</span>
  {/if}
-->
<style>
div {
  margin:0;
  padding-left: 0.4em;
  padding-right: 0.4em;
  font-size: 18px;
  line-height: 1.44444;
  font-family: Georgia,Times New Roman,Times,serif; 
}
</style>

