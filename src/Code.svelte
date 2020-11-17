<svelte:head>
	<link rel='stylesheet' href='https://unpkg.com/prism-theme-night-owl@1.4.0/build/light.css'>

</svelte:head>

<script>

    import Prism from 'svelte-prism'
		export let node
		export let opt
		export let width
		$: opt
		$: width
</script>
<div contentedit=true>
	

<Prism language="html" >
	{node.content.text}
</Prism>
</div>