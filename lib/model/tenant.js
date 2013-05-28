module.exports = {
	name: 'tenant',
	label: 'Inquilino',
	format: '{{name}} - pousadas.ottersys.com.br/{{key}}',
	routeTo10tcl: true,
	keepCache: true,
	onlyFor: ['landlord'],
	fields: [
		{ name: 'name', label: 'Nome' },
		{ name: 'key', label: 'Chave', checks: ['hasValue', 'unique', 'unchanged', 'isKey'] },
		{ name: 'responsible', label: 'Responsável', type: 'instance', of: 'person' },
		{ name: 'payment', label: 'Pagamento', type: 'instance', of: 'payment' }
	],
	mock: [
		{
			"name": "Morada dos Sisais",
			"key": "sisais",
			"responsible": {
				"name": "Rosa dos Sisais",
				"phone": "2345678",
				"email": "rosa@moradadossisais.com.br"
			}
		}
	]
}