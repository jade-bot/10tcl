module.exports = function(srv, base, config){

	function _html(req, res){

		var model = srv.m.user
		  , user  = model.find({usr: req.session.usr})
		  , themeId = (user.theme) ? user.theme._id : 'theme-1'
		  , theme = srv.m.themes.find({_id: themeId})
		  
		res.render(
			config.viewRoot+'/profile', 
			{
				m: {
					name: model.name,
					url: '/{1}'.assign(model.name),
					label: model.label,
					format: model.format,
					fields: model.fields
				},
				brand: config.brand,
				user: user,
				theme: theme.css,
				srv: srv 
			}
		)
	}

	function _update(req, res){
        var model = srv.m.user
          , data  = req.body

        if (data.theme){
        	data.theme = {_id: data.theme}
        }

        function then(err, items){
            (err) ? res.send(500, err) : res.redirect('/')
        }

        model.update(data, then)
    }

	srv.get('/profile', base.auth, _html)
	srv.post('/profile', base.auth, _update)

}