<script>
export let opt
export let node
export let width
$: width
</script>


<img src={node.content.src} alt=""/>
    <span contenteditable={opt.edit} style="color:salmon"><i>{node.content.caption}</i></span>

<style>
img {
width:100%
}
</style>