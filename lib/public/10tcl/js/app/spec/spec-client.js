$.closeLink = function(){
	if ($.openLink) {
		$('.label-place a[data-field={1}]'.assign($.openLink)).popover('toggle')
		$.openLink = undefined
		$('.datepicker').hide()		
	}
}

$.linkAction = function(link){

	this.linkField = link.attr('data-field')
	
	if ($.openLink === this.linkField) { // se clicou no mesmo link que ta aberto, fecha sem fazer nada
		$.closeLink()
		return
	} else { // se clicou em um link diferente do aberto, fecha o aberto e segue abrindo o novo
		$.closeLink()
		$.openLink = this.linkField
	}
	link.popover('toggle')
	
	$.startFormFields()
	
	// writeForm
	$.model.fields[this.linkField].setFormField()

	$('input')
	.change(function(){
		var el = $(this)
		  , parentName = el.attr('data-parent')
		  , fieldName = el.attr('data-field')
		  , linkName = parentName || fieldName
		  , value = el.val()
		  , field = $.model.fields[linkName]

		if (field.type === 'object'){
			var record, obj = {}
			if (value){
				record = $.cacheFor[fieldName].options.find({name: value})
				obj[fieldName] = {_id: record._id, name: value}
			} else {
				obj[fieldName] = {}
			}
			field.set(obj)
		}
		if (field.type === 'reference'){
			if (value){
				var record = $.cacheFor[fieldName].options.find({name: value})
				field.set({_id: record._id, name: value})
			} else {
				field.set()
			}
			$.closeLink()
		}
		if (field.type === 'string' || field.type === 'date') {
			field.set(value)
			$.closeLink()
		}
		
	})
	.keydown(function(ev){
		var el = $(this)
		  , parentName = el.attr('data-parent')
		  , fieldName = el.attr('data-field')
		  , linkName = parentName || fieldName
		  , escKey = 27
		  , tabKey = 9
		

		if (ev.keyCode === escKey){
			var link = $('a[data-field={1}]'.assign(linkName)).first()
			
			$.closeLink()
			link.focus()
		}
		if (ev.keyCode === tabKey){
			var link = $('a[data-field={1}]'.assign(linkName)).first()
			  , tabIndex = link.attr('tabindex')
			  , nextLink = $('a[tabIndex={1}]'.assign(tabIndex)).first()

			$.closeLink()
			nextLink.focus()
		}
	})
}

$.startFormFields = function(){
	$('.datepicker').datepicker()

	$('.image-panel').each(function(){
		var field = $(this).attr('data-field')

		if ($.model.data[field]){
			$('.image-form[data-field={1}]'.assign(field)).toggle()
		} else {
			$(this).toggle()
		} 
		  
	})

	$('input[type=file]')
	.change(function(){

		$('input[name=key]').val('images/'+this.files[0].name)

		var form = document.getElementById('image-form')
		  , formData = new FormData(form)
		  , bucketURL = $('#image-form').attr('action')
		  , fileName = this.files[0].name
		  , fieldName = $(this).attr('data-field')

		$.ajax({
			type: 'POST',
			url: bucketURL,
			data: formData,
			cache: false,
			context: { fileName: fileName, fieldName: fieldName },
			contentType: false,
			processData: false,
			success: function(data){
				
				var url = 'https://s3-ap-southeast-1.amazonaws.com/haosys/images/{1}'.assign(this.fileName)

				$('img[data-field={1}]'.assign(this.fieldName)).attr('src', url)
				$('.image-panel[data-field={1}]'.assign(this.fieldName)).toggle()
				$('.image-form[data-field={1}]'.assign(this.fieldName)).toggle()

				$.model.data[this.fieldName] = url

			}
		})
		
	})

	$('.ref-desc')
	.each(function(idx, el){
		el = $(el)
		el.typeahead({
			source: function(query, process){
				var model, url, data
				  , contentType = 'application/json'
				  , el = this.$element
				  , fieldName = el.attr('data-field')

				if ($.cacheFor[fieldName] && $.cacheFor[fieldName].options && query.has($.cacheFor[fieldName].query)){
					data = $.cacheFor[fieldName].options.map(function(item){ return item.name })
					process(data)
					return
				}
				if (query.length < 3) return

				model = el.attr('data-model')
				url = '/autocomplete/{1}/{2}'.assign(model, query) 
				
				$.ajax({ 
					url: url, 
					type: 'GET', 
					contentType: 'json',
					context: this,
					success: function(data){ 
						var fieldName = this.$element.attr('data-field')
						$.cacheFor[fieldName] = { options: data, query: this.query }
						process(data.map(function(item){ return item.name })) 
					}
				})
			}
		})
	})
}

function startSpecEditor(){

	// link
	$('.label-place a')
	.each(function(){
		var el = $(this)
		  , formHTML = $('#form-'+el.attr('data-field')).html()

		el.popover({content: formHTML, trigger: 'manual'})

	})
	.click(function(){
		var el = $(this)
		$.linkAction(el)
	})
	.keydown(function(ev){
		if (ev.keyCode === 13) {
			var el = $(this)
			$.linkAction(el)	
		}
	})

	// form
	$('#save-btn').click(function(){
		$.model.save()
	})
	$.startFormFields()
	
}

$(document).ready(function(){

	$.cacheFor = {}

	startSpecEditor()

})