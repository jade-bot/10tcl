module.exports = function(srv, base, model, config){

    var crud = {

        html: function(req, res, next) {
            
            if (req.isMobile) {
                next()
            } else {
                var model = srv.m[req.params.model]
                res.render( config.viewRoot+'/crud', { 
                    m: {
                        name: model.name,
                        url: '/{1}'.assign(model.name),
                        label: model.label,
                        format: model.format,
                        fields: model.fields
                    },
                    brand: config.brand,
                    user: req.session.userId
                })
            }
        },

        getList: function(req, res) {
            
            var model = srv.m[req.params.model]
              , desc  = (req.params.desc) ? req.params.desc.decodeBase64() : undefined
            res.send( model.options(desc) )
        },

        getPage: function(req, res) {
            
            var model = srv.m[req.params.model]
              , page  = req.params.desc
            res.send( model.options() )
        },

        getById: function(req, res) {
            
            var model = srv.m[req.params.model]
              , id    = req.params.id
            res.send( model.find({_id: id}) )
        },

        create: function(req, res, next){
            
            if (req.isMobile) {
                next()
            } else {
                var model = srv.m[req.params.model]
                  , data  = req.body
                function then(err, items){
                    (err) ? res.send(500, err) : res.json(items.first())
                }
                model.insert(data, then)
            }
        },

        update: function(req, res, next){
            
            if (req.isMobile) {
                next()
            } else {
                var model = srv.m[req.params.model]
                  , data  = req.body
                function then(err, items){
                    (err) ? res.send(500, err) : res.json(req.body)
                }
                model.update(data, then)
            }
        },

        remove: function(req, res, next){
            
            if (req.isMobile) {
                next()
            } else {
                var model = srv.m[req.params.model]
                function then(err, items){
                    log('deleted')
                }
                model.add(req.body)
                model.save(res, then)
            }
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

    srv.get   ( '/'+model.name               , base.auth, base.checkModel, crud.html    , mob.html   )
    srv.get   ( '/'+model.name+'/mobForm/:id', base.auth, base.checkModel, mob.editForm              )
    srv.get   ( '/'+model.name+'/mobForm'    , base.auth, base.checkModel, mob.newForm               )
    srv.post  ( '/'+model.name+'/mobForm'    , base.auth, base.checkModel, mob.create   , mob.update )
    srv.get   ( '/'+model.name+'/list'       , base.auth, base.checkModel, crud.getList              )
    srv.get   ( '/'+model.name+'/list/:desc' , base.auth, base.checkModel, crud.getList              )
    srv.get   ( '/'+model.name+'/page/:page' , base.auth, base.checkModel, crud.getPage              )
    srv.get   ( '/'+model.name+'/byId/:id'   , base.auth, base.checkModel, crud.getById              )
    srv.post  ( '/'+model.name               , base.auth, base.checkModel, crud.create               )
    srv.put   ( '/'+model.name               , base.auth, base.checkModel, crud.update               )
    srv.delete( '/'+model.name+'/remove/:id' , base.auth, base.checkModel, crud.remove               )    
    srv.get   ( '/'+model.name+'/migrate'    , base.auth, base.checkModel, crud.migrationForm        )
    srv.post  ( '/'+model.name+'/migrate'    , base.auth, base.checkModel, crud.migrationData        )
}