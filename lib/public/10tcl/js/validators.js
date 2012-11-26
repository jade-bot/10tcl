this.get = function(){
	return {
		presence: function(field, value){
			if (value) return ''
			return 'Field {1} is required.'.assign(field.label)
		}
	}
}