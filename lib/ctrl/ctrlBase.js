module.exports = function(srv, config){

    return {
        auth: function(req, res, next){
            if ( req.header('user-agent').toLowerCase().has('mobile') ) req.isMobile = true
            if (req.session.userId) {
                next()
            } else {
                var viewFile = (req.isMobile) ? '/login_mobile' : '/login'
                res.render( config.viewRoot+viewFile, {path:req.path, brand:config.brand} )
            }
        },

        checkMob: function(req, res, next){
            if ( req.header('user-agent').toLowerCase().has('mobile') ) req.isMobile = true
            next()
        },

        login: function(req, res){
            function hasUser(u){
                return (u.usr.toLowerCase() === req.body.usr && u.pwd === req.body.pwd)
            }
            if ( config.users.find(hasUser) ){
                req.session.userId = req.body.usr
                res.redirect(req.body.path)
            } else {
                res.send(401)
            }
        },

        idx: function(req, res){
            if (req.isMobile) {
                res.render(config.viewRoot+'/index_mobile', {brand: config.brand})
            } else {
                res.render(config.viewRoot+'/index', {brand: config.brand})
            }
        },

        headerTest: function(req, res){
            res.send('<html><body><p>'+req.header('user-agent')+'</p></body></html>')
        },

        checkModel: function(req, res, next){
            url = req.originalUrl
            modelName = url.split('/')[1]
            req.params.model = modelName
            if ( srv.m[req.params.model] ) {
                next()
            } else {
                res.send(404)
            }
        }
    }
}