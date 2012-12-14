module.exports = function(srv){

	return {

		start: function(){
			var self = this

			function afterRead(records, err){
				if (!err) self.add(records)
				log('loading {1} records from db.{2}'.assign(self.length, self.name))
			}

			this.readAll(afterRead)
		},

		readAll: function(callback){
			srv.db[this.collectionName()].find().toArray(
				function(err, data){
					callback(JSON.parse(JSON.stringify(data)), err)
				}
			)
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
			
			var self = this
			  , newItem = record

			delete newItem._id

			srv.db[this.collectionName()].insert(newItem, function(err, items){
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

			srv.db[this.collectionName()].updateById(_id, clone, options, function(err, items){
				callback(err, items)
			})

		},

		delete: function(callback){
			this.findAll({_dirty:'deleted'}).each(function(item){
				srv.db[this.collectionName()].remove({_id: item._id}, function(err){
					callback(err)
				})
			})
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
		}
	}
	
}