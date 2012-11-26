exports.attack = function(srvr, options){

	// ======================================================
	// prepare attack
	fs       = require('fs')
	mustache = require('mustache')
	jade     = require('jade')
	var express = require('express')
	
	// ======================================================
	// db
	var mongo  = require('mongoskin')
	  , conStr = 'mongodb://{usr}:{pwd}@{srv}/{db}?{par}'.assign(options.db)
    
    srvr.db = mongo.db(conStr)

    // ======================================================
	// model
	var pathToModels = (options.pathToCtrls) ? options.pathToCtrls : options.root+'/models'
	  , models       = fs.readdirSync(pathToModels)
	  , modelExt     = (process.argv.find('mock')) ? require('./lib/model/modelExtMock') : require('./lib/model/modelExt')

	srvr.m = {}
	menuItems = []
	models.forEach(function(file){
		if (file.endsWith('.js')){

			var model_path = '{1}/{2}'.assign(pathToModels, file)
			var model = require(model_path)

			srvr.db.bind(model.name)
			srvr.m[model.name] = []
			srvr.m[model.name].merge(model)
			srvr.m[model.name].merge(modelExt)
			srvr.m[model.name].srvr = srvr
			srvr.m[model.name].start()
			
			menuItems.push({name: model.name, label: model.label})
		}
	})

	// ======================================================
	// controller
	var base        = require('./lib/ctrl/ctrlBase')(srvr)
	  , pathToCtrls = (options.pathToCtrls) ? options.pathToCtrls : options.root+'/controllers'
	  , ctrls       = fs.readdirSync(pathToCtrls)

	config.viewRoot   = config.root+'/node_modules/10tcl/lib/view'
	config.publicRoot = config.root+'/node_modules/10tcl/lib/public'
	srvr.use(express.static( config.publicRoot ))

	srvr.get ( '/'      , base.authReq, base.idx )
    srvr.post( '/login' , base.login      )
    srvr.get ( '/header', base.headerTest )
    
    ctrls.forEach(function(file){
        if (file.endsWith('.js')){
            var controller_path = '{1}/{2}'.assign(pathToCtrls, file)
            require(controller_path)(srvr, base)
            log('adding routes from {1}'.assign(file))
        }
    })
    require('./lib/ctrl/ctrlCrud')(srvr, base)
    require('./lib/ctrl/ctrlAutoComplete')(srvr, base)

}