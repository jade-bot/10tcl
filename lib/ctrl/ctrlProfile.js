module.exports = function(srv, base, config){

	function profileHTML(req, res){

		var model = srv.m.profile
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
	
	function update(req, res){
		var model = srv.m.profile
		  , data  = req.body

		log(JSON.stringify(data))

		if (req.session.usr !== data.usr){
			res.send(403)
			return
		}

		data.audit = { who: req.session.usr, when: Date.create('now', 'pt-br').format('dd/mm/yyyy', 'pt-br') }

		if (data.theme){
			data.theme = {_id: data.theme}
		}

		function then(err, items){
			(err) ? res.send(500, err) : res.redirect('/')
		}

		model.update(data, then)
	}

	var domain = (config.domain) ? '/{1}/'.assign(config.domain) : '/'

	srv.get (domain+'profile', base.auth, profileHTML)
	srv.post(domain+'profile', base.auth, update     )

}