
<script>
    export let id
    export let title
    /**
    *  RECOMMENDED CONFIGURATION VARIABLES: EDIT AND UNCOMMENT THE SECTION BELOW TO INSERT DYNAMIC VALUES FROM YOUR PLATFORM OR CMS.
    *  LEARN WHY DEFINING THESE VARIABLES IS IMPORTANT: https://disqus.com/admin/universalcode/#configuration-variables    */
    
function hack(id){
    if (id=="Introduction to Sustainability Science"){
        return "Svelte app"
    }
    else {return id}
}

    var disqus_config = function () {
    this.page.url = window.location.origin;  // Replace PAGE_URL with your page's canonical URL variable
    this.page.identifier = window.location.origin.concat("#!".concat(hack(id))); // Replace PAGE_IDENTIFIER with your page's unique identifier variable    
};
    
    (function() { // DON'T EDIT BELOW THIS LINE
    var d = document, s = d.createElement('script');
    s.src = 'https://itss2021.disqus.com/embed.js';
    s.setAttribute('data-timestamp', +new Date());
    (d.head || d.body).appendChild(s);
    })();

	import { onMount } from 'svelte';

	let photos = [];

	onMount(async () => {
        DISQUS.reset({
        reload: true,
        config: function () {
            this.page.identifier = window.location.origin.concat("#!".concat(hack(id)));
            this.page.url = window.location.origin.concat("#!".concat(hack(id)));
            this.page.title = title;
            }
        })
	});
/*
    setTimeout(() => {
	try {
		DISQUS.reset({
		reload: true,
		config: function () {
			this.page.identifier = window.location.origin.concat("#!".concat(id));
			this.page.url = window.location.origin.concat("#!".concat(id));
			this.page.title = title;
			}
		})
	}
	catch(err) {
	  console.log(err)
	}
}, 2000)
$:  {
    console.log('disqus');
    console.log(id)
    try {
        DISQUS.reset({
        reload: true,
        config: function () {
            this.page.identifier = window.location.origin.concat("#!".concat(id));
            this.page.url = window.location.origin.concat("#!".concat(id));
            this.page.title = title;
            }
        })
    }
    catch(err) {
      console.log(err)
    }
;}
*/
</script>
<noscript>Please enable JavaScript to view the <a href="https://disqus.com/?ref_noscript">comments powered by Disqus.</a></noscript>
<div id="disqus_thread"></div>