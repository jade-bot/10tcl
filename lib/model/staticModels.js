// Local collections that will not be changed other than here
module.exports = function(){
	
	var models = {
		themes: [
			{ _id: 'theme-1' , desc: 'Default'  , css: 'bootstrap-theme-original.css'  },
			{ _id: 'theme-2' , desc: 'Cerulean' , css: 'bootstrap-theme-cerulean.css'  },
			{ _id: 'theme-3' , desc: 'Cosmo'    , css: 'bootstrap-theme-cosmo.css'     },
			{ _id: 'theme-4' , desc: 'Cyborg'   , css: 'bootstrap-theme-cyborg.css'    },
			{ _id: 'theme-5' , desc: 'Journal'  , css: 'bootstrap-theme-journal.css'   },
			{ _id: 'theme-6' , desc: 'Readable' , css: 'bootstrap-theme-readable.css'  },
			{ _id: 'theme-7' , desc: 'Slate'    , css: 'bootstrap-theme-slate.css'     },
			{ _id: 'theme-8' , desc: 'Spacelab' , css: 'bootstrap-theme-spacelab.css'  },
			{ _id: 'theme-9' , desc: 'Superhero', css: 'bootstrap-theme-superhero.css' },
			{ _id: 'theme-10', desc: 'United'   , css: 'bootstrap-theme-united.css'    }
		]
	}

	var modelFunctions = {
		findAll: function( tenant, callback ){
			if (callback) callback( undefined, this )
			return this
		},

		findById: function( tenant, id, callback ){
			if (callback) callback( undefined, this.find({_id: id}) )
			return this.find({_id: id})
		},

		findByText: function( tenant, text, callback ){
			var regex = new RegExp( text, 'i')
			callback( undefined, this.find({desc: regex}) )
		},

		options: function(query){
			var self = this
			  , options = []

			if (query){
				options = self.findAll(function(r){
		            return r.desc.toLowerCase().has(query.toLowerCase())
		        })
			} else {
				options = self
			}

	        options = options.sortBy('desc')

	        return options;
		}
	}
	
	models.each(function(name, model){
		model.merge(modelFunctions)
	})

	return models
}