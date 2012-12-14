module.exports = {
    name: 'profile',
    collection: 'user',
    label: 'Perfil',
    format: '{{name}} {{lastname}}',
    keepCache: true,
    fields: [
        { name: 'usr', label: 'Usuário', type: 'read only' },
        { name: 'pwd', label: 'Senha', type: 'password', checks: ['hasValue'] },
        { name: 'name', label: 'Nome', checks: ['hasValue'] },
        { name: 'lastName', label: 'Sobrenome', checks: ['hasValue'] },
        { name: 'email', label: 'e-mail', type: 'email', checks: ['hasValue'] },
        { name: 'theme', label: 'Tema', type: 'reference', to: 'themes' },
        { name: 'role', label: 'Perfil', type: 'read only' }
    ],
    mock: [
    	{
		    "usr": "didi",
		    "pwd": "moco",
		    "name": "Didi",
		    "lastName": "Mocó",
		    "_id": "508e0077d42ka9862f000001"
		}
    ]
}