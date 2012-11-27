exports.attack = function(srv, config){

	// ======================================================
	// prepare attack
	fs       = require('fs')
	mustache = require('mustache')
	log      = console.log
	require('sugar')
	Object.extend()
	var express = require('express')
	
	// ======================================================
	// db
	var mongo  = require('mongoskin')
	  , conStr = 'mongodb://{usr}:{pwd}@{srv}/{db}?{par}'.assign(config.db)
    
    srv.db = mongo.db(conStr)

	// ======================================================
	// controller
	var base        = require('./lib/ctrl/ctrlBase')(srv, config)
	  , pathToCtrls = (config.pathToCtrls) ? config.root+config.pathToCtrls : config.root+'/controllers'
	  , ctrls       = fs.readdirSync(pathToCtrls)
	
	menuItems   = []

	config.viewRoot   = config.root+'/node_modules/10tcl/lib/view'
	config.publicRoot = config.root+'/node_modules/10tcl/lib/public'
	srv.use(express.static( config.publicRoot ))

	srv.get ( '/'      , base.auth, base.idx )
    srv.post( '/login' , base.login          )
    
    ctrls.forEach(function(file){
        if (file.endsWith('.js')){
            var controller_path = '{1}/{2}'.assign(pathToCtrls, file)
            menuItem = require(controller_path)(srv, base, config)
            menuItems.push(menuItem)
        }
    })
    require('./lib/ctrl/ctrlAutoComplete')(srv, base, config)

    // ======================================================
	// model
	var pathToModels = (config.pathToModels) ? config.root+config.pathToModels : config.root+'/models'
	  , models       = fs.readdirSync(pathToModels)
	  , modelExt     = (process.argv.find('mock')) ? require('./lib/model/modelExtMock') : require('./lib/model/modelExt')

	srv.m = {}
	models.forEach(function(file){
		if (file.endsWith('.js')){

			var model_path = '{1}/{2}'.assign(pathToModels, file)
			var model = require(model_path)

			srv.db.bind(model.name)
			srv.m[model.name] = []
			srv.m[model.name].merge(model)
			srv.m[model.name].merge(modelExt)
			srv.m[model.name].srv = srv
			srv.m[model.name].start()
			
			if (model.routeTo10tcl){
				menuItems.push({name: model.name, label: model.label})
				require('./lib/ctrl/ctrlCrud')(srv, base, model, config)	
			} 
		}
	})
}