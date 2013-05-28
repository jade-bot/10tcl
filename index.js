exports.attack = function(root, pathToConfig){

	// ======================================================
	// prepare attack
	require('sugar')
	Object.extend()

	var express      = require('express')
	  , srv          = express()
	  , staticModels = require('./lib/model/staticModels')()

	log      = console.log
	fs       = require('fs')
	mustache = require('mustache')
	config   = require(root + pathToConfig) 

	// ======================================================
	// configure server	
	var pathToViews   = (config.pathToViews) ? root+config.pathToViews : root+'/views'
	config.viewRoot   = __dirname+'/lib/view'
	config.publicRoot = __dirname+'/lib/public'
	
	srv.configure(function(){
	    srv.set('view engine', 'jade')
		srv.set('views',  pathToViews)
		srv.use(express.favicon())
		srv.use(express.logger())
		srv.use(express.bodyParser())
		srv.use(express.methodOverride())
		srv.use(require('less-middleware')({ src: root + '/public' }))
		srv.use(express.static( root + '/public' ))
		srv.use(express.static( config.publicRoot ))

		srv.use(express.cookieParser())
		srv.use(express.session(config.session))
		srv.use(srv.router)
	})

	// ======================================================
	// db
	var mongo  = require('mongoskin')
	  , conStr = 'mongodb://{usr}:{pwd}@{srv}/{db}?{par}'.assign(config.db)
	
	srv.db = mongo.db(conStr)

	// ======================================================
	// controller
	var base        = require('./lib/ctrl/ctrlBase')(srv, config)
	  , pathToCtrls = (config.pathToCtrls) ? root+config.pathToCtrls : root+'/controllers'
	  , ctrls       = fs.readdirSync(pathToCtrls)
	
	menuItems   = []
	
	ctrls.forEach(function(file){
		if (file.endsWith('.js')){
			var controller_path = '{1}/{2}'.assign(pathToCtrls, file)
			menuItem = require(controller_path)(srv, base, config)
			if (menuItem) menuItems.push(menuItem)
		}
	})
	require('./lib/ctrl/ctrlAutoComplete')(srv, base, config)

	// ======================================================
	// model
	var pathToModels    = (config.pathToModels) ? root+config.pathToModels : root+'/models'
	  , pathToValidator = (config.pathToValidator) ? root+config.pathToValidator : './lib/model/modelValidator'
	  , models          = fs.readdirSync(pathToModels)
	  , modelExt        = (process.argv.find('mock')) ? require('./lib/model/modelExtMock')(srv) : require('./lib/model/modelExt')(srv)
	  , modelValidation = require(pathToValidator)(srv)
	  , ctrlCrud        = require( './lib/ctrl/ctrlCrud' )

	srv.m = staticModels
	
	function requireModel(modelPath){
		var model  = require(modelPath)
		  , domain = (config.domain) ? '/{1}/'.assign(config.domain) : '/'

		model = srv.m[model.name] = model
		model.merge(modelExt, false, false)
		model.merge(modelValidation, false, false)
		
		//log( model.collectionName() )
		
		if (model.routeTo10tcl){
			menuItems.push({url: domain + model.name, label: model.label, onlyFor: model.onlyFor})
			ctrlCrud(srv, base, model, config)	
		}
	}

	if (config.multiTenant){
		requireModel( './lib/model/tenant.js' )
	}
	
	models.forEach(function(file){
		if (file.endsWith('.js')){
			var modelPath = '{1}/{2}'.assign(pathToModels, file)
		 	requireModel(modelPath)
		}
	})

	// ======================================================
	// users
	var pathToUser    = (config.pathToUser) ? root+config.pathToUser+'/user'    : './lib/model/user'
	var pathToProfile = (config.pathToUser) ? root+config.pathToUser+'/profile' : './lib/model/profile'
 	requireModel(pathToUser)
 	requireModel(pathToProfile)
 	srv.m.user.cache = [config.admin]
 	srv.m.profile.cache = [config.admin]

 	require('./lib/ctrl/ctrlProfile')(srv, base, config)

	return srv
}



















