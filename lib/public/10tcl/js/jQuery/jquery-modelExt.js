(function($){

	$.model.merge({

		record: {},

		save: function(cb){
			($.model.record._id) ? this.update($.model.record, cb) : this.insert($.model.record, cb)
		},

		insert: function(record, cb){
			function then(record){
				$.model.data.add({_id: record._id, desc: $.model.desc(record)})
				$.model.pages = $.model.data.inGroupsOf($.model.rowsPerPage)
				$.model.pages.each(function(a){ 
					var idx = 0
					a.remove(null)
					a.each(function(o){ o.idx = idx++ })
				})
				$.model.page = $.model.pages[$.model.pageNr - 1]
				$.view.applyTemplates()
				alertify.success('Registro incluido.')
				if (cb) cb()
			}
			this.talkToServer('POST', record, then)
		},
		
		update: function(record, cb){
			function then(record, txt, jqXHR){
				var item = $.model.data.find({_id: record._id})
				item.desc = $.model.desc(record)
				$.model.pages = $.model.data.inGroupsOf($.model.rowsPerPage)
				$.model.pages.each(function(a){ 
					var idx = 0
					a.remove(null)
					a.each(function(o){ o.idx = idx++ })
				})
				$.view.applyTemplates()
				alertify.success('Registro alterado.')
				if (cb) cb()
			}
			this.talkToServer('PUT', record, then)
		},

		query: function(a1, a2){
			var query, cb
			if (arguments[0] && arguments[0].isString()) query = arguments[0]
			if (arguments[0] && arguments[0].isFunction()) cb = arguments[0]
			if (arguments[1] && arguments[1].isFunction()) cb = arguments[1]

			var url = this.url + '/list'
			if (query) url += '/' + query.encodeBase64()

			function then(records, txt, jqXHR){
				$.model.data = records
				$.model.pages = $.model.data.inGroupsOf($.model.rowsPerPage)
				$.model.pages.each(function(a){ 
					var idx = 0
					a.remove(null)
					a.each(function(o){ o.idx = idx++ })
				})
				$.model.pageNr = 1
				if (cb) cb()
			}
			this.talkToServer('GET', url, then)
		},

		getById: function(id, cb){
			var url = '{1}/byId/{2}'.assign(this.url, id)

			function then(record, txt, jqXHR){
				$.model.record = record
				$('#crud-form').show('fast')
			}
			this.talkToServer('GET', url, then)
		},

		newRecord: function(){
			$.model.record = {}
		},

		talkToServer: function(method, par, success, error){

			var contentType = (method === 'GET') ? '' : 'application/json'
			  , url         = (par.isString()) ? par : this.url
			  , data        = (par.isObject()) ? JSON.stringify( par ) : undefined
			  , error       = error || this.errorHandler
			
			$.ajax({ 
				url: url, 
				type: method, 
				contentType: contentType,
				context: this,
				data: data,
				success: success,
				error: error
			})	
		
		},

		errorHandler: function(jqXHR, txt, err){
			var errs = JSON.parse(jqXHR.responseText)

			errs.each(function(field, err){
				$('#ctrl-group-'+field).addClass('error')
				alertify.error(err)
			})
		},

		setFieldValue: function(name, value){
			var fields = name.split('.')
			
			if (fields.length === 1) $.model.record[fields[0]] = value
			if (fields.length === 2){
				if (!$.model.record[fields[0]]) $.model.record[fields[0]] = {}
				$.model.record[fields[0]][fields[1]] = value
			}
		},

		getFieldValue: function(name, record){
			var fields = name.split('.')
			  , value

			if (!record) record = $.model.record

			if (fields.length === 1) value = record[fields[0]]
			if (fields.length === 2){
				if (!record[fields[0]]) return
				value = record[fields[0]][fields[1]]
			}

			return value
		},

		desc: function(record){
			return Mustache.render(this.format, record).trim()
		}
	})

})(jQuery)