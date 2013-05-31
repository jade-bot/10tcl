module.exports = function(srv, base, model, config){

    var baseUrl = '/{1}'.assign( model.name )
    if ( config.domain ) baseUrl = '/{1}{2}'.assign( config.domain,baseUrl )
    if ( config.multiTenant ) baseUrl = '/:tenant{1}'.assign( baseUrl )

    var crud = {

        html: function(req, res, next) {
            
            if (req.isMobile) {
                next()
            } else {

                var user    = req.session.user
                  , tenant  = req.session.tenant
                  , themeId = (user.theme) ? user.theme._id : 'theme-2'
                  , theme   = srv.m.themes.find({_id: themeId})
                  , model   = srv.m[req.params.model]

                res.render( config.viewRoot+'/crud', { 
                    m: {
                        name: model.name,
                        url: baseUrl.replace(':tenant', tenant),
                        label: model.label,
                        format: model.format,
                        form: model.form()
                    },
                    brand: config.brand,
                    user: user,
                    theme: theme.css,
                    srv: srv
                })
            }
        },

        getList: function(req, res) {
            
            var model  = srv.m[req.params.model]
              , desc   = (req.params.desc) ? req.params.desc.decodeBase64() : undefined
              , tenant = req.session.tenant
            
            function then(err, data){
                res.send(data)
            }

            model.options( tenant, desc, then )
        },

        getPage: function(req, res){
            
            var model  = srv.m[req.params.model]
              , page   = req.params.desc
              , tenant = req.session.tenant

            function then( err, data ){
                res.send( data )
            }

            model.options( tenant, undefined, then )
        },

        getById: function( req, res ){
            
            var model  = srv.m[req.params.model]
              , id     = req.params.id
              , tenant = req.session.tenant

            function then( err, data ){
                res.send( data )
            }

            model.getById( tenant, id, then )
        },

        create: function( req, res, next ){
            
            var model  = srv.m[req.params.model]
              , data   = req.body
              , tenant = req.session.tenant

            data.audit = { who: req.session.usr, when: Date.create('now', 'pt-br').format('dd/mm/yyyy', 'pt-br') }

            function then( err, items ){
                (err) ? res.send(500, err) : res.json(items.first())
            }
            model.insert( tenant, data, then )
        },

        update: function(req, res, next){
            
            var model  = srv.m[req.params.model]
              , data   = req.body
              , tenant = req.session.tenant

            data.audit = { who: req.session.usr, when: Date.create('now', 'pt-br').format('dd/mm/yyyy', 'pt-br') }

            function then(err, items){
                (err) ? res.send(500, err) : res.json(req.body)
            }

            model.update(tenant, data, then)
        },

        remove: function(req, res, next){
            
            var model = srv.m[req.params.model]
            function then(err, items){
                log('deleted')
            }
            model.add(req.body)
            model.save(res, then)
        },

        migrationForm: function(req, res){

            var model = srv.m[req.params.model]
            res.render( config.viewRoot+'/migration', {
                m: {
                    name: model.name,
                    label: model.label,
                    fields: model.fields,
                    msg: 'no harm done... yet',
                    records: ''
                }
            })
        }, 

        migrationData: function(req, res){

            var model = srv.m[req.params.model]
              , records = JSON.parse(req.body.records)
            function then(err, items){
                var msg = 'Success: '+items.length+' records included.'
                if (err) msg = err

                res.render( config.viewRoot+'/migration', {
                    m: {
                        name: model.name,
                        label: model.label,
                        fields: model.fields,
                        msg: msg,
                        records: req.body.records
                    }
                })     
            }

            model.insert(records, then)
        }

    }

    var mob = {
        html: function(req, res) {
        
            var model = srv.m[req.params.model]
            res.render( config.viewRoot+'/crud_mobile', { 
                m: {
                    name: model.name,
                    label: model.label,
                    records: model.options()
                },
                brand: config.brand
            })
        },

        editForm:  function(req, res){

            var model  = srv.m[req.params.model]
              , id     = req.params.id
              , record = model.find({_id: id})
            res.render( config.viewRoot+'/crud_mobile_form', {
                m: {
                    name: model.name,
                    label: model.label,
                    record: record,
                    fields: model.fields
                },
                brand: config.brand
            })

        }, 

        newForm: function(req, res){

            var model  = srv.m[req.params.model]
            res.render( config.viewRoot+'/crud_mobile_form', {
                m: {
                    name: model.name,
                    label: model.label,
                    fields: model.fields
                },
                brand: config.brand
            })
        },

        create: function(req, res, next){
            
            if (req.body._id) {
                next()
            } else {
                var model = srv.m[req.params.model]
                  , data  = req.body
                function then(err, items){
                    (err) ? res.send(500, err) : res.redirect('/'+model.name)
                }
                model.insert(data, then)
            }
        },

        update: function(req, res){
            
            var model = srv.m[req.params.model]
              , data  = req.body
            function then(err, items){
                (err) ? res.send(500, err) : res.redirect('/'+model.name)
            }
            model.update(data, then)
        },

        remove: function(req, res){
            
            var model = srv.m[req.params.model]
            function then(err, items){
                log('deleted')
            }
            model.add(req.body)
            model.save(res, then)
        },
    }

    log('adding CRUD controller routes to '+model.name+' at '+baseUrl)

    srv.get   ( baseUrl               , base.checkTenantExists, base.auth, base.checkModel, crud.html    , mob.html   )
    srv.get   ( baseUrl+'/mobForm/:id', base.checkTenantExists, base.auth, base.checkModel, mob.editForm              )
    srv.get   ( baseUrl+'/mobForm'    , base.checkTenantExists, base.auth, base.checkModel, mob.newForm               )
    srv.post  ( baseUrl+'/mobForm'    , base.checkTenantExists, base.auth, base.checkModel, mob.create   , mob.update )
    srv.get   ( baseUrl+'/list'       , base.checkTenantExists, base.auth, base.checkModel, crud.getList              )
    srv.get   ( baseUrl+'/list/:desc' , base.checkTenantExists, base.auth, base.checkModel, crud.getList              )
    srv.get   ( baseUrl+'/page/:page' , base.checkTenantExists, base.auth, base.checkModel, crud.getPage              )
    srv.get   ( baseUrl+'/byId/:id'   , base.checkTenantExists, base.auth, base.checkModel, crud.getById              )
    srv.post  ( baseUrl               , base.checkTenantExists, base.auth, base.checkModel, crud.create               )
    srv.put   ( baseUrl               , base.checkTenantExists, base.auth, base.checkModel, crud.update               )
    srv.delete( baseUrl+'/remove/:id' , base.checkTenantExists, base.auth, base.checkModel, crud.remove               )    
    srv.get   ( baseUrl+'/migrate'    , base.checkTenantExists, base.auth, base.checkModel, crud.migrationForm        )
    srv.post  ( baseUrl+'/migrate'    , base.checkTenantExists, base.auth, base.checkModel, crud.migrationData        )
}