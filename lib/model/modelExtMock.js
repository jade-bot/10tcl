module.exports = {

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
		record._id = ''+Number.random(100000000)
		this.add(record)
		callback(undefined, [record])
	},

	update: function(record, callback){

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
	}
	
}