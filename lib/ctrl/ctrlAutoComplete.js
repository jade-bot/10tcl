module.exports = function(srvr, base){
	
	function _autocomplete(req, res){
		
		var query   = req.params.query
		  , model   = req.params.model
		  , options = srvr.m[model].options(query)

		res.send(options)
	}

	srvr.get( '/autocomplete/:model/:query', base.authReq, base.checkModel, _autocomplete )
}