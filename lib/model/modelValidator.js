module.exports = function(srv){

	var chk = require('validator').check

	function msgFmt(key, msg){
		return 'Erro no campo {1}: {2}'.assign(key, msg)
	}

	return {
		validate: {
			hasValue: function(field, record){
				var value = record[field.name]

				try{ chk(value, msgFmt(field.label, 'valor obrigatório')).notNull().notEmpty() }
				catch(e){ throw(e) }
			},
			unique: function(field, record, model){
				var par = {}
				  , value = record[field.name]

				par[field.name] = value
				if (record._id){
					var result = model.find(par)
					if (result && result._id !== record._id){
						throw({ message: 'O {1} "{2}" já está cadastrado.'.assign(field.label, value) })
					}
				}else{
					var result = model.find(par)
					if (result){
						throw({ message: 'O {1} "{2}" já está cadastrado.'.assign(field.label, value) })
					}
				}
			},
			byType: {
				email: function(field, record){
					var value = record[field.name]

					try{ chk(value, msgFmt(field.label, 'formato de e-mail inválido')).isEmail().len(10) }
					catch(e){ throw(e) }
				},
				url: function(field, record){
					var value = record[field.name]

					try{ chk(value, msgFmt(field.label, 'formato de URL inválido')).isUrl() }
					catch(e){ throw(e) }
				},
				tel: function(field, record){
					var value = record[field.name]

					try{ chk(value, msgFmt(field.label, 'telefone inválido')).len(8) }
					catch(e){ throw(e) }
				},
				number: function(field, record){
					var value = record[field.name]

					try{ chk(value, msgFmt(field.label, 'numero inválido')).isNumeric() }
					catch(e){ throw(e) }
				},
				date: function(field, record){
					var value = record[field.name]
					  , dateValue = Date.create(value, 'pt-br')
					
					try{ chk(dateValue, msgFmt(field.label, 'data inválida')).isDate() }
					catch(e){ throw(e) }
				},
				decimal: function(field, record){
					var value = record[field.name]

					try{ chk(value, msgFmt(field.label, 'valor inválido')).isDecimal() }
					catch(e){ throw(e) }
				}			  
			}
		}
	}
}