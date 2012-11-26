(function($) {
	
	var modelExtension = {

		url: '/spec',
		afterSave: function(data, textStatus, jqXHR){
			window.location.href = "/";
		},
		errorHandler: function(jqXHR, textStatus, errorThrown){
			alert(textStatus)
		},
		save: function(){
			var data = $.model.data
			
			if (!data.style) {
				alert('Style is a mandatory field.')
				return
			}

			if (data._id) {
				data._dirty = 'updated'
				this.syncServer('PUT', data, this.afterSave)
			} else {
				data._dirty = 'inserted'
				this.syncServer('POST', data, this.afterSave)
			}
		},
		syncServer: function(method, json, success){

			var contentType = 'application/json'
			  , data        = JSON.stringify( json )
			  , error       = this.errorHandler

			$.ajax({ 
				url: this.url, 
				type: method, 
				contentType: contentType,
				context: this,
				data: data,
				success: success,
				error: error
			})

		}

	}

	var fieldExtension = {

		setSpec: function(){
			var val = ''
			  , link = $('a[data-field={1}]'.assign(this.name)).first()
			  , tabIndex = link.attr('tabIndex')
			  , nextLink = $('a[tabIndex={1}]'.assign(tabIndex+1)).first()
			
			if ($.model.data[this.name]) val = this.desc($.model.data[this.name])
			$('.value-place[data-field={1}]'.assign(this.name)).html(val)
			nextLink.focus()
		},
		setFormField: function(){
			if (this.type === 'object'){
				var self = this
				this.fields.each(function(compName, comp){
					if (self.hasData()) {
						$('#f-{1} input[name={2}]'.assign(self.name, compName)).val(self.get(compName)._id)
						$('#f-{1} input[name={2}_desc]'.assign(self.name, compName)).val(self.get(compName).name)
					}
					$('#f-{1} input[name={2}_desc]'.assign(self.name, compName)).focus()
				})
			}
			if (this.type === 'reference'){
				if (this.hasData()) {
					$('input[name={1}]'.assign(this.name)).val(this.get()._id)	
					$('input[name={1}_desc]'.assign(this.name)).val(this.get().name)	
				}
				$('input[name={1}_desc]'.assign(this.name)).focus()
			}
			if (this.type === 'date' || this.type === 'string' ){
				if (this.hasData()) {
					$('input[name={1}]'.assign(this.name)).val(this.get())
				}
				$('input[name={1}]'.assign(this.name)).focus()
			}
			
		},
		readFormField: function(){
			if (this.type === 'object'){
				this.value.each(function(compName, comp){
					this.value[compName]._id = $('#f-{1} input[name={2}]'.assign(this.name, compName)).val()
					this.value[compName].name = $('#f-{1} input[name={2}_desc]'.assign(this.name, compName)).val()
				})
			}
			if (this.type === 'reference'){
				this.value._id = $('input[name={1}]'.assign(this.name)).val()	
				this.value.name = $('input[name={1}_desc]'.assign(this.name)).val()	

			}
			if (this.type === 'date' || this.type === 'string' ){
				this.value = $('input[name={1}]'.assign(this.name)).val()
			} 
		},
		desc: function(val){
			if (!val) val = $.model.data[this.name]
			if (!val) return ''

			if (this.type === 'object'){
				return Mustache.render(this.format, val)
			}
			if (this.type === 'reference'){
				return val.name
			}
			if (this.type === 'date' || this.type === 'string'){
				return val
			}
		},
		get: function(compName){
			if (compName) return $.model.data[this.name][compName]
			return $.model.data[this.name]
		},
		set: function(data){
			if (data){
				if (this.type === 'object'){
					if ($.model.data[this.name]) {
						var clone = $.model.data[this.name].clone()
						clone.merge(data)
						$.model.data[this.name] = clone
					} else {
						$.model.data[this.name] = data
					}
				}
				if (this.type === 'reference'){
					$.model.data[this.name] = data
				}
				if (this.type === 'date' || this.type === 'string'){
					$.model.data[this.name] = data
				}
			} else {
				delete $.model.data[this.name]
			}

			this.setSpec()
		},
		hasData: function(){
			if ($.model.data[this.name]) return true
			return false
		}
	}

	$.model.merge(modelExtension)
	// $.model.data.each(function(fieldName, field){
	// 	$.model.data.watch(fieldName, function(f, o, n){
	// 		$.model.fields[fieldName].setSpec(n)
	// 	})
	// })
	$.model.fields.each(function(fieldName, field){
		field.merge(fieldExtension)
	})

})(jQuery)