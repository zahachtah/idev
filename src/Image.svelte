<script>
export let opt
export let nodes
export let width
export let depth
export let id
export let view
$: width
</script>

{#if view.view!="header"}

<img src={nodes[id].content.src} alt=""/>
    <span contenteditable={opt.edit} style="color:salmon"><i>{nodes[id].content.caption}</i></span>
{/if}
<style>
img {
width:100%
}
</style>