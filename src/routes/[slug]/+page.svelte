<script>
  export let data;
</script>

<svelte:head>
	<title>{data.title}</title>
	{#each data.meta as [property, content]}
		<meta property={property} content={content}>
	{/each}
</svelte:head>
<div class="wrap">
  <div>
    <ul>
      <li><a href="#home">Home</a></li>
      <li><a href="#news">News</a></li>
      <li><a href="#contact">Contact</a></li>
      <li><a href="#about">About</a></li>
    </ul>
  </div>
  <h1>{data.title}</h1>
	{#each data.imageUrls as imageUrl}
		<img src={imageUrl} style="width:100%; height: auto" alt="">
	{/each}
</div>

<style>
  .wrap {
    padding: 20px;
    margin: 30px auto;
    max-width: 800px;
    background: white;
  }
  ul {
    display: block;
    margin-block-start: 1em;
    margin-block-end: 1em;
    margin-inline-start: 0px;
    margin-inline-end: 0px;
    padding-inline-start: 40px;
    list-style-type: none;
    margin: 0;
    padding: 0;
    overflow: hidden;
    background-color: #333;
  }
  li {
    display: list-item;
    text-align: -webkit-match-parent;
    float: left;
  }
  li a {
    display: block;
    color: white;
    text-align: center;
    padding: 14px 16px;
    text-decoration: none;
  }
</style>
