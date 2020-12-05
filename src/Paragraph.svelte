<script>
  export let opt
  export let width
  export let nodes
  export let id
  export let depth
  export let view
	
	width=2
	$: opt
</script>

<span >{@html nodes[id].content.text}</span>
<!--
  {#if view.mode=='structure'}
    <span contenteditable={view.edit} style="color:salmon">{@html node.content.text.substring(0, 40)}</span>
  {:else}
    <span contenteditable={view.edit}>{@html node.content.text}</span>
  {/if}
-->
<style>

</style>

