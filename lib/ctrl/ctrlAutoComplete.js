module.exports = function(srv, base){
	
	function _autocomplete(req, res){
		
		var query     = req.params.query
		  , modelName = req.params.model
		  , model     = srv.m[modelName]
		  , options   = []

		options = model.options(query)
		
		res.send(options)
	}

	function _checkModel(req, res, next){

		if (srv.m[req.params.model]){
			next()
		} else {
			res.send(404)
		}
	}

	srv.get( '/autocomplete/:model/:query', base.auth, _checkModel, _autocomplete )
}