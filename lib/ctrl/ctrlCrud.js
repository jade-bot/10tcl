module.exports = function(srvr, base){

    var crud = {

        html: function(req, res, next) {
            
            if (req.isMobile) {
                next()
            } else {
                var model = srvr.m[req.params.model]
                res.render( config.viewRoot+'/crud', { 
                    m: {
                        name: model.name,
                        url: '/10tcl/{1}'.assign(model.name),
                        label: model.label,
                        format: model.format,
                        fields: model.fields
                    },
                    user: req.session.userId
                })
            }
        },

        getList: function(req, res) {
            
            var model = srvr.m[req.params.model]
              , desc  = (req.params.desc) ? req.params.desc.decodeBase64() : undefined
            res.send( model.options(desc) )
        },

        getPage: function(req, res) {
            
            var model = srvr.m[req.params.model]
              , page  = req.params.desc
            res.send( model.options() )
        },

        getById: function(req, res) {
            
            var model = srvr.m[req.params.model]
              , id    = req.params.id
            res.send( model.find({_id: id}) )
        },

        create: function(req, res, next){
            
            if (req.isMobile) {
                next()
            } else {
                var model = srvr.m[req.params.model]
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
                var model = srvr.m[req.params.model]
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
                var model = srvr.m[req.params.model]
                function then(err, items){
                    log('deleted')
                }
                model.add(req.body)
                model.save(res, then)
            }
        },

        migrationForm: function(req, res){

            var model = srvr.m[req.params.model]
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

            var model = srvr.m[req.params.model]
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
        
            var model = srvr.m[req.params.model]
            res.render( config.viewRoot+'/crud_mobile', { 
                m: {
                    name: model.name,
                    label: model.label,
                    records: model.options()
                }
            })
        },

        editForm:  function(req, res){

            var model  = srvr.m[req.params.model]
              , id     = req.params.id
              , record = model.find({_id: id})
            res.render( config.viewRoot+'/crud_mobile_form', {
                m: {
                    name: model.name,
                    label: model.label,
                    record: record,
                    fields: model.fields
                }
            })

        }, 

        newForm: function(req, res){

            var model  = srvr.m[req.params.model]
            res.render( config.viewRoot+'/crud_mobile_form', {
                m: {
                    name: model.name,
                    label: model.label,
                    fields: model.fields
                }
            })
        },

        create: function(req, res, next){
            
            if (req.body._id) {
                next()
            } else {
                var model = srvr.m[req.params.model]
                  , data  = req.body
                function then(err, items){
                    (err) ? res.send(500, err) : res.redirect('/10tcl/{1}'.assign(model.name))
                }
                model.insert(data, then)
            }
        },

        update: function(req, res){
            
            var model = srvr.m[req.params.model]
              , data  = req.body
            function then(err, items){
                (err) ? res.send(500, err) : res.redirect('/10tcl/{1}'.assign(model.name))
            }
            model.update(data, then)
        },

        remove: function(req, res){
            
            var model = srvr.m[req.params.model]
            function then(err, items){
                log('deleted')
            }
            model.add(req.body)
            model.save(res, then)
        },
    }

    srvr.get   ( '/10tcl/:model'            , base.authReq, base.checkModel, crud.html    , mob.html   )
    srvr.get   ( '/10tcl/:model/mobForm/:id', base.authReq, base.checkModel, mob.editForm              )
    srvr.get   ( '/10tcl/:model/mobForm'    , base.authReq, base.checkModel, mob.newForm               )
    srvr.post  ( '/10tcl/:model/mobForm'    , base.authReq, base.checkModel, mob.create   , mob.update )
    srvr.get   ( '/10tcl/:model/list'       , base.authReq, base.checkModel, crud.getList              )
    srvr.get   ( '/10tcl/:model/list/:desc' , base.authReq, base.checkModel, crud.getList              )
    srvr.get   ( '/10tcl/:model/page/:page' , base.authReq, base.checkModel, crud.getPage              )
    srvr.get   ( '/10tcl/:model/byId/:id'   , base.authReq, base.checkModel, crud.getById              )
    srvr.post  ( '/10tcl/:model'            , base.authReq, base.checkModel, crud.create               )
    srvr.put   ( '/10tcl/:model'            , base.authReq, base.checkModel, crud.update               )
    srvr.delete( '/10tcl/:model/remove/:id' , base.authReq, base.checkModel, crud.remove               )    
    srvr.get   ( '/10tcl/:model/migrate'    , base.authReq, base.checkModel, crud.migrationForm        )
    srvr.post  ( '/10tcl/:model/migrate'    , base.authReq, base.checkModel, crud.migrationData        )
}