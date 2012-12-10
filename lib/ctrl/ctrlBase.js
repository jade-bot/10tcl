module.exports = function(srv, config){

    return {
        auth: function(req, res, next){
            if ( req.header('user-agent').toLowerCase().has('mobile') ) req.isMobile = true
            if (req.session.usr) {
                next()
            } else {
                var viewFile = (req.isMobile) ? '/login_mobile' : '/login'
                res.render( config.viewRoot+viewFile, {path:req.path, brand:config.brand, user: null} )
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
            if ( srv.m.user.find(hasUser) ){
                req.session.usr = req.body.usr
                res.redirect(req.body.path)
            } else {
                res.send(401)
            }
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