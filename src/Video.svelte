<script>
		export let nodes
		export let id
		export let opt
		export let width
		export let depth
        export let view
        export let addDepth
$: opt
$: width
</script>

<div class="container">
<iframe class="video" title="title" src={nodes[id].content.src} frameborder="0" allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
</div>

<style>
.container {
    position: relative;
    width: 100%;
    height: 0;
    padding-bottom: 56.25%;
}
.video {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
}
</style>