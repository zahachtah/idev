<script>
export let opt
export let nodes
export let width
export let depth
export let id
export let view
export let addDepth

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

{#if view.view!="header"}
    <img src={nodes[id].content.src} alt=""/>
    {#if opt.edit}
        {#if nodes[id].content.text}
        <div contenteditable=true on:keyup={()=>debounce()} bind:innerHTML={nodes[id].content.text}/>
        {:else}
        <div contenteditable=true on:keyup={()=>debounce()} bind:innerHTML={nodes[id].content.text}/>
        {/if}
    {:else}
        {#if nodes[id].content.text}
        <div contenteditable=false on:keyup={()=>debounce()} bind:innerHTML={nodes[id].content.text}/>
        {:else}
        <div contenteditable=false on:keyup={()=>debounce()} bind:innerHTML={nodes[id].content.text}/>
        {/if}
    {/if}
{/if}
<style>
img {
width:100%
}
div {
  font-family:    Georgia, 'Times New Roman', Times, serif, serif;
  color: "darkgray";
  margin:0;
  padding-left: 0.8em;
  padding-right: 0.8em;
  padding-bottom: 0.8em
}
</style>