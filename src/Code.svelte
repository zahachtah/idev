<svelte:head>
	<link rel='stylesheet' href='https://unpkg.com/prism-theme-night-owl@1.4.0/build/light.css'>

</svelte:head>

<script>

    import Prism from 'svelte-prism'
		export let nodes
		export let id
		export let opt
		export let width
		export let depth
		export let view
</script>
<div contentedit=true>
	

<Prism language="html" >
	{nodes[id].content.text}
</Prism>
</div>