module.exports = function(srv, config){

    var baseUrl = '/'
    if ( config.domain ) baseUrl = '/{1}{2}'.assign( config.domain,baseUrl )
    if ( config.multiTenant ) baseUrl = '/:tenant{1}'.assign( baseUrl )

    var base = {
        auth: function(req, res, next){
            if ( req.header('user-agent').toLowerCase().has('mobile') ) req.isMobile = true
            if (req.session.user) {
                next()
            } else {
                var viewFile = (req.isMobile) ? '/login_mobile' : '/login'
                  , domain = '/'

                if (config.domain) domain = '/'+config.domain+domain
                if (req.params.tenant) domain = '/'+req.params.tenant+domain

                var viewData = {path:req.path, brand:config.brand, domain: domain, user: null}
                res.render( config.viewRoot+viewFile, viewData )
            }
        },

        checkMob: function(req, res, next){
            if ( req.header('user-agent').toLowerCase().has('mobile') ) req.isMobile = true
            next()
        },

        checkTenantExists: function(req, res, next){
            if (!config.multiTenant){
                next()
            } else {

                function afterFind( err, data ){
                    var exists = data.length > 0

                    if ( exists ){ next() } 
                    else { res.send(404) } 
                }
                srv.m.tenant.collection().find( { key: req.params.tenant } ).toArray( afterFind )
            }
        },

        checkSessionTenant: function(req, res, next){
            if (!config.multiTenant){
                next()
            } else {
                if (req.params.tenant === req.session.tenant){
                    next()
                } else {
                    res.send(401)
                }
            }
        },

        login: function(req, res){

            var tenant     = req.params.tenant
              , credential = { usr: req.body.usr, pwd: req.body.pwd }

            function afterCheck( user ){
                if ( user ){
                    req.session.user = user
                    if ( config.multiTenant ) req.session.tenant = tenant
                    res.redirect(req.body.path)
                } else {
                    res.send(401)
                }
            }

            srv.m.user.checkUser( tenant, credential, afterCheck )

        },

        logout: function(req, res){
            delete req.session.user
            res.redirect('/')
        },

        idx: function(req, res){
            var user = srv.m.user.find({usr: req.session.usr})
              , themeId = (user.theme) ? user.theme._id : 'theme-1'
              , theme = srv.m.themes.find({_id: themeId})

            if (req.isMobile) {
                res.render(config.viewRoot+'/index_mobile', {brand: config.brand, user: user, theme: theme.css})
            } else {
                res.render(config.viewRoot+'/index', {brand: config.brand, user: user, theme: theme.css})
            }
        },

        headerTest: function(req, res){
            res.send('<html><body><p>'+req.header('user-agent')+'</p></body></html>')
        },

        checkModel: function(req, res, next){
            var url = req.originalUrl.remove('/'+config.domain)
              , modelName = url.split('/')[2]
              , model = srv.m[modelName]

            req.params.model = modelName

            if ( model ) {
                if (model.onlyFor){

                    var user = srv.m.user.find({usr: req.session.usr})
                    
                    function notForYou(){
                        if (!user.role) return true
                        return (model.onlyFor.none(user.role))
                    }

                    if (notForYou()){
                        res.send(401)
                        return
                    }
                }

                next()
            } else {
                log('model "'+modelName+'" not found')
                res.send(404)
            }
        }
    }

    srv.get ( baseUrl         , base.checkSessionTenant, base.auth, base.idx )
    srv.post( baseUrl+'login' , base.checkTenantExists, base.login )
    srv.get ( baseUrl+'logout', base.checkSessionTenant, base.logout )

    return base
}