module.exports = function(){

	var chk = require('validator').check

	function msgFmt(key, msg){
		return 'Erro no campo {1}: {2}'.assign(key, msg)
	}

	return {
		validate: {
			hasValue: function(field, value){
				try{ chk(value, msgFmt(field.label, 'valor obrigatório')).notNull().notEmpty() }
				catch(e){ throw(e) }
			},
			byType: {
				email: function(field, value){
					try{ chk(value, msgFmt(field.label, 'formato de e-mail inválido')).isEmail().len(10) }
					catch(e){ throw(e) }
				},
				url: function(field, value){
					try{ chk(value, msgFmt(field.label, 'formato de URL inválido')).isUrl() }
					catch(e){ throw(e) }
				},
				tel: function(field, value){
					try{ chk(value, msgFmt(field.label, 'telefone inválido')).len(8) }
					catch(e){ throw(e) }
				},
				number: function(field, value){
					try{ chk(value, msgFmt(field.label, 'numero inválido')).isNumeric() }
					catch(e){ throw(e) }
				},
				date: function(field, value){
					var dateValue = Date.create(value, 'pt-br')
					try{ chk(dateValue, msgFmt(field.label, 'data inválida')).isDate() }
					catch(e){ throw(e) }
				},
				decimal: function(field, value){
					try{ chk(value, msgFmt(field.label, 'valor inválido')).isDecimal() }
					catch(e){ throw(e) }
				}			  
			}

		}
	}
}