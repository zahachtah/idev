<script>
export let opt
export let nodes
export let width
export let depth
export let id
export let view
export let addDepth
</script>

{#if view.view!="header"}
    <img src={nodes[id].content.src} alt=""/>
    <div contenteditable={opt.edit} >Fig. {(nodes[id].content.caption) ? nodes[id].content.caption : nodes[id].content.text}</div>
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