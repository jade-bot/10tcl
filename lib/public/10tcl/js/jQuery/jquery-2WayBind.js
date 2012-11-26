$(document).ready(function(){	

	// Form Field -> Model.Record.Property(.Property)
	function change(field){
		var name = $(this).attr('name')
		  , value = $(this).val()

		$.model.setFieldValue(name, value)
	}
	$('[data-bind]').each(function(i, field){ $(field).change(change) })
	
	// Model.Record.Property(.Property) -> Form Field
	function propertyWatcher(propName, oldVal, newVal){
		if (newVal.isString() || newVal.isNumber()){
			$('[name="{1}"][data-bind]'.assign(propName)).val(newVal)
		}
		if (newVal.isObject()){
			newVal.each(function(fieldName, value){
				$('[name="{1}.{2}"][data-bind]'.assign(propName, fieldName)).val(newVal[fieldName])		
			})
		}
		return newVal
	}
	
	// Model.Record -> Form Fields
	function recordWatcher(propName, oldVal, newVal){

		$('[data-bind]').each(function(i, el){
			var fieldName = $(el).attr('name')
			  , value = $.model.getFieldValue(fieldName, newVal)
			  , mainField = fieldName.split('.')[0]
			
			$(el).val(value)
			if (htmlEditor[fieldName]) htmlEditor[fieldName].setValue(value)

			newVal.watch(mainField, propertyWatcher)
			
		})
		return newVal
	}

	$.model.watch('record', recordWatcher)

})