(function($){
	
	$.view = {

		start: function(){
			
			this.adjustHeights()
			this.startFields()
			this.startShortcuts()
			
			$.model.watch('pageNr', function(prop, oldVal, newVal){
				var n = $.model.pages.length
				$.model.page = $.model.pages[newVal - 1]
				if (newVal === 1){ $('#prev-page').addClass('disabled')	} else { $('#prev-page').removeClass('disabled') }
				if (newVal === n){ $('#next-page').addClass('disabled') } else { $('#next-page').removeClass('disabled') }
				$.view.applyTemplates()
				return newVal
			})

			$.model.query()

		},

		editLinkClick: function(id){
			$.model.getById(id)
			$('.list-row.well').removeClass('well')
			$('.list-row[data-id={1}]'.assign(id)).addClass('well')
			$('#form-wrapper').show('fast')
		},

		addLinkClick: function(){
			$.model.newRecord()
			$('#form-wrapper').show('fast')
		},

		searchFieldChange: function(){
			var value = $('#search-field').val()
			$.model.query(value)
		},

		cancelBtnClick: function(){
			$('#form-wrapper').hide('fast')
			$('.control-group').removeClass('error')
		},

		saveBtnClick: function(){
			$.model.save(function(){
				$('#form-wrapper').hide('fast')
				$.view.applyTemplates()
				$('.control-group').removeClass('error')
			})
		},

		prevPageClick: function(){
			if ($.model.pageNr > 1) $.model.pageNr--
		},

		nextPageClick: function(){
			if ($.model.pageNr < $.model.pages.length) $.model.pageNr++
		},

		selectPrev: function(){
			var selected = $('.list-row.well').attr('data-idx').toNumber()
			if (selected === 0) return
			selected--
			$('.list-row.well').removeClass('well')
			$('.list-row[data-idx={1}]'.assign(selected)).addClass('well')
		},

		selectNext: function(){
			var rows = $('.list-row').length - 1
			  , selected = $('.list-row.well').attr('data-idx').toNumber()
			if (selected === rows) return
			selected++
			$('.list-row.well').removeClass('well')
			$('.list-row[data-idx={1}]'.assign(selected)).addClass('well')	
		},

		escKeyAction: function(){
			$.view.cancelBtnClick()
			$('#help-icon').popover('hide')
		},

		searchFocus: function(){ 
			$('#search-field').focus()
			return false
		},

		editSelected: function(){ 
			var id = $('.list-row.well').attr('data-id')
			$.model.getById(id)
			$('#form-wrapper').show('fast')
			return false
		},

		popShortcuts: function(){
			$('#help-icon').popover('toggle')
		},

		startShortcuts: function(){
			Mousetrap.bind( ['+', 'n'],     this.addLinkClick   )
			Mousetrap.bind( 'right',        this.nextPageClick  )
			Mousetrap.bind( 'left',         this.prevPageClick  )
			Mousetrap.bind( 'up',           this.selectPrev     )
			Mousetrap.bind( 'down',         this.selectNext     )
			Mousetrap.bind( 'esc',          this.escKeyAction   )
			Mousetrap.bind( 'f',            this.searchFocus    )
			Mousetrap.bind( ['e', 'enter'], this.editSelected   )
			Mousetrap.bind( '?',            this.popShortcuts   )

			$('#help-icon').click($.view.popShortcuts)
			var html = $('#shortcuts').html()
			$('#help-icon').popover({content: html, trigger: 'manual', placement: 'bottom'})
		},

		applyTemplates: function(){
			$('[data-tpl]').each(function(i, el){
				var tplId = '#{1}'.assign($(el).attr('data-tpl'))
				  , targetId = '#{1}'.assign($(el).attr('id'))
				  , data = $.model

				$(tplId)
				.mu(data)
				.stacheOver(targetId)

				$('.list-row').first().addClass('well')
			})
		},

		adjustHeights: function(){
			var windowH   = $(window).height()
			  , topH = 180
			  , rowH = 38
			  , listH = windowH - 225
			  , rowsPerPage = Math.floor(listH / rowH)

			$.model.rowsPerPage = rowsPerPage
			$('#action-row').attr('style', 'height: {1}px;'.assign(windowH - topH));
		},

		startFields: function(){

			$('.datepicker').datepicker()
			
			htmlEditor = {}
			$('.html-editor').each(function(idx, el){
				var name = $(el).attr('name')
				htmlEditor[name] = $('textarea[name={1}]'.assign(name)).wysihtml5().data('wysihtml5').editor
			})

			// TODO - encapsulate fk fields
			$.cacheFor = {}
			$('.ref-desc')
			.each(function(idx, el){
				el = $(el)
				el.typeahead({
					source: function(query, process){
						var model, url, data
						  , contentType = 'application/json'
						  , el = this.$element
						  , fieldName = el.attr('data-field')

						if (query.length < 3) return

						if ($.cacheFor[fieldName] && $.cacheFor[fieldName].options && query.has($.cacheFor[fieldName].query)){
							data = $.cacheFor[fieldName].options.map(function(item){ return item.name })
							process(data)
							return
						}

						model = el.attr('data-ref')
						url = '/autocomplete/{1}/{2}'.assign(model, query) 
						
						$.ajax({ 
							url: url, 
							type: 'GET', 
							contentType: 'json',
							context: this,
							success: function(data){ 
								var fieldName = this.$element.attr('data-field')
								$.cacheFor[fieldName] = { options: data, query: this.query }
								var descs = data.map(function(item){ return item.desc })
								process(descs) 
							}
						})
					},
					updater: function(item){

						var fieldName = this.$element.attr('data-field')
						  , option = $.cacheFor[fieldName].options.find({desc: item})

						if (option){
							$.model.setFieldValue(fieldName, option)
						}

						return option.desc
					}
				})
			})

		}
	}

})(jQuery)