<script id='tag-list-tpl' type='text/html'>
	<ul>
		{{#data}}
			<li> 
				<b>{{_id}}</b>
				<span> - {{name}} - {{category}}</span>
			</li>
		{{/data}}
	</ul>
</script>

<script id='tag-list-item-tpl' type='text/html'>
	{{#data}}
		<li> 
			<b>{{_id}}</b>
			<span> - {{name}} - {{category}}</span>
		</li>
	{{/data}}
</script>