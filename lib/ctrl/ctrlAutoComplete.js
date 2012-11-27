module.exports = function(srvr, base){
	
	function _autocomplete(req, res){
		
		var query   = req.params.query
		  , model   = req.params.model
		  , options = srvr.m[model].options(query)

		res.send(options)
	}

	function _checkModel(req, res, next){

		if (srvr.m[req.params.model]){
			next()
		} else {
			res.send(404)
		}
	}

	srvr.get( '/autocomplete/:model/:query', base.auth, _checkModel, _autocomplete )
}