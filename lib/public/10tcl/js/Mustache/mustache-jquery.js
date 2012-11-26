(function($) {
	$.fn.mu = function(data){
		return {
			tpl: this.html(),
			stache: function(target){
				$(target).append(Mustache.render(this.tpl, data))
			},
			stacheOver: function(target){
				$(target).html(Mustache.render(this.tpl, data))
			}
		}
	}

})(jQuery)