module.exports = {

	start: function(){
		var self = this

		function afterRead(records, err){
			if (!err) self.add(records)
			log('loading {1} records from db.{2}'.assign(self.length, self.name))
		}

		this.readAll(afterRead)
	},

	readAll: function(callback){
		this.srv.db[this.name].find().toArray(
            function(err, data){
            	callback(JSON.parse(JSON.stringify(data)), err)
            }
        )
	},

	readById: function(id, callback){

	},

	readByQuery: function(query, callback){

	},

	insert: function(data, callback){

		var self = this
		  , newItem = data

		delete newItem._id
		
		this.srv.db[this.name].insert(newItem, function(err, items){
			if (!err) {
				var insertedItems = JSON.parse(JSON.stringify(items))
				self.add(insertedItems)
				callback(err, insertedItems)
			} else {
				callback(err)
			}
		})

	},

	update: function(data, callback){

		var self = this
		  , item = this.find({_id: data._id})
		
		if (this.keepVersions) {
			var oldVersion = item.clone()
			delete oldVersion.versions
			delete data.versions
			if (!item.versions) item.versions = []
			item.versions.push(oldVersion)
		}

		item.merge(data)

		var _id = item._id.toString()
		  , options = {safe: true}

		var clone = item.clone()
		delete clone._id

		this.srv.db[self.name].updateById(_id, clone, options, function(err, items){
			callback(err, items)
		})

	},

	delete: function(callback){
		this.findAll({_dirty:'deleted'}).each(function(item){
			this.srv.db[this.name].remove({_id: item._id}, function(err){
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
	}
	
}