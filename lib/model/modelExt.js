module.exports = function(srv){

	return {

		collection: function( tenant ){
			var collectionName = this.name
			if ( tenant ) collectionName = tenant+'.'+collectionName
			return srv.db.collection( collectionName )
		},

		findAll: function( tenant, callback ){
			var self = this

			function afterFind( err, data ){
				var data = JSON.parse( JSON.stringify( data ) )
				callback( err, data )
			}				

			self.collection( tenant ).find().toArray( afterFind )	
		},

		findById: function( tenant, id, callback ){
			var self = this

			function afterFind( err, data ){
				var data = JSON.parse( JSON.stringify( data ) )
				callback( err, data )
			}

			self.collection( tenant ).findById( id, afterFind )
		},

		findByText: function( tenant, text, callback ){
			var self = this
			  , fields = self.textFields()
			  , qryExp = new RegExp(text, 'i')

			if (fields.length === 0){
				callback( 'no searchable fields', [] )	
			} else {
				var param = {}
				if (fields.length === 1) {
					param[fields[0].name] = qryExp
				} else {
					param.$or = []
					fields.each( function(field){
						var orParam = {}
						orParam[field.name] = qryExp
						param.$or.push( orParam )
					})
				}

				function afterFind( err, data){
					var data = JSON.parse( JSON.stringify( data ) )
					callback( err, data )		
				}
				self.collection( tenant ).find(param).toArray( afterFind )
			}
		},

		findByQuery: function( tenant, query, callback ){
			var self = this

			function afterFind( err, data ){
				var data = JSON.parse( JSON.stringify( data ) )
				callback( err, data )
			}
			self.collection( tenant ).find( query ).toArray( afterFind )
		},

		insert: function(record, callback){
			var err = this.check(record)
			if (err.keys().length){
				callback(err)
				return
			}
			
			var self = this
			  , newItem = record

			delete newItem._id

			self.collection.insert(newItem, function(err, items){
				if (!err) {
					var insertedItems = JSON.parse(JSON.stringify(items))
					self.add(insertedItems)
					callback(err, insertedItems)
				} else {
					callback(err)
				}
			})

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
				delete data.versions
				if (!item.versions) item.versions = []
				item.versions.push(oldVersion)
			}

			item.merge(record)

			var _id = item._id.toString()
			  , options = {safe: true}
			  , clone = item.clone()
			delete clone._id

			self.collection.updateById(_id, clone, options, function(err, items){
				callback(err, items)
			})

		},

		delete: function(callback){
			this.findAll({_dirty:'deleted'}).each(function(item){
				self.collection.remove({_id: item._id}, function(err){
					callback(err)
				})
			})
		},

		desc: function(data){
			return mustache.render(this.format, data).trim()
		},

		options: function(query, afterList){
			var self = this
			  , options = []

			function afterRead( err, data ){
				data = data.map(function(r){
					return { _id: r._id, desc: self.desc(r) }
				}).sortBy('desc')

				afterList(data)
			}

			if (query){
				self.readByQuery( query, afterRead )
			} else {
				self.readAll( afterRead )
			}

		},

		collectionName: function(){
			return this.collection || this.name
		},

		textFields: function(){
			var fields = []
			  , type = this.fields.groupBy('type')

			fields.add( type.undefined.map(function(field){ return field.name }) )
			fields.add( type.string.map(function(field){ return field.name }) )
			fields.add( type.text.map(function(field){ return field.name }) )
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
				if (field.onlyFor){
					var usr = record.audit.who
					  , user = srv.m.user.find({usr: usr})

					if (record[field.name]){
						if (field.onlyFor.isString()){
							if (!user.role || user.role !== field.onlyFor){
								err[field.name] = 'Campo {1} está restrito ao perfil {2}.'.assign(field.label, field.onlyFor)
							}
						} else {
							if (!user.role || field.onlyFor.none(user.role)){
								err[field.name] = 'Campo {1} está restrito aos perfis {2}.'.assign(field.label, field.onlyFor.join(', '))
							}
						}
					}
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