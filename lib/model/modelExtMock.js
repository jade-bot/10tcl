module.exports = function(srv){

	return {

		start: function(){
			var self = this

			function afterRead(records, err){
				if (!err) self.add(records)
				log('loading {1} records from mock.{2}'.assign(self.length, self.name))
			}

			this.readAll(afterRead)
		},

		readAll: function(callback){
			var mock = (this.mock) ? this.mock : []
			callback(mock)
		},

		readById: function(id, callback){

		},

		readByQuery: function(query, callback){

		},

		insert: function(record, callback){
			var err = this.check(record)
			if (err.keys().length){
				callback(err)
				return
			}
			record._id = ''+Number.random(100000000)
			this.add(record)
			callback(undefined, [record])
		},

		update: function(record, callback){
			var err = this.check(record)
			if (err.keys().length){
				callback(err)
				return
			}
			
			var item = this.find({_id: record._id})
			
			if (this.keepVersions) {
				var oldVersion = item.clone()
				delete oldVersion.versions
				delete record.versions
				if (!item.versions) item.versions = []
				item.versions.push(oldVersion)
			}
			
			item.merge(record)

			callback(undefined, item)
		},

		delete: function(id, callback){
			this.remove({_id: item._id})
			callback()
		},

		desc: function(data){
			return mustache.render(this.format, data).trim()
		},

		options: function(query){
			var self = this
			  , options = []

			if (query){
				options = self.findAll(function(r){
		            return self.desc(r).toLowerCase().has(query.toLowerCase())
		        })
			} else {
				options = self
			}

	        options = options
	        .map(function(r){
	            return { _id: r._id, desc: self.desc(r) }
	        })
	        .sortBy('desc')

	        return options;
		},

		collectionName: function(){
			var name = this.collection || this.name
			if ( this.multiTenant ) name =  
			return this.collection || this.name
		},

		check: function(record){
			var self = this
			  , err = {}

			if (this.onlyFor){
				var usr = record.audit.who
				  , user = srv.m.user.find({usr: usr})

				function notForYou(){
					if (!user.role) return true
					return (self.onlyFor.none(user.role))
				}

				if (notForYou()){
					if (this.onlyFor.isArray()){
						err.general = 'Alteração restrita aos perfis '+this.onlyFor.join(', ')
					}else{
						err.general = 'Alteração restrita ao perfil '+this.onlyFor
					} 

					return err
				}
			}
			
			this.fields.each(function(field){
				if (record[field.name]){
					if (self.validate.byType[field.type]){
						try{ self.validate.byType[field.type](field, record, self) }
						catch(e){ err[field.name] = e.message }
					}
				}
				if (field.checks){
					field.checks.each(function(check){
						if (self.validate[check]){
							try{ self.validate[check](field, record, self) }
							catch(e){ err[field.name] = e.message }
						}
					})
				}
				
			})

			return err
		},

		form: function(){
			
			var modelFields = this.fields
			  , formFields = []

			modelFields.each(function( field ){
				if (['instance', 'list'].some(field.type)){
					var refFields = srv.m[field.of].fields
					refFields.each( function( refField ){
						var formField = refField.clone()
						if (field.tab) formField.tab = field.tab
						formField.name = field.name+'.'+formField.name
						formField.fieldset = field.label
						formFields.push(formField)
					})
				} else if ( 'html' === field.type ){
					var formField = field.clone()
					formField.fieldset = field.label
					formFields.push(formField)
				} else {
					formFields.push(field)
				}
			})

			return formFields.groupBy('fieldset')
		}
	}
	
}