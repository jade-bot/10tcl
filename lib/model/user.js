module.exports = {
    name: 'user',
    label: 'Usuários',
    format: '{{name}} {{lastname}}',
    fields: [
        { name: 'usr', label: 'Usuário', type: 'string', checks: ['hasValue'] },
        { name: 'pwd', label: 'Senha', type: 'password', checks: ['hasValue'] },
        { name: 'name', label: 'Nome', type: 'string', checks: ['hasValue'] },
        { name: 'lastName', label: 'Sobrenome', type: 'string', checks: ['hasValue'] },
        { name: 'email', label: 'e-mail', type: 'email', checks: ['hasValue'] },
        { name: 'theme', label: 'Tema', type: 'reference', to: 'themes' },
        { name: 'role', label: 'Perfil', type: 'string' }
    ],
    routeTo10tcl: true,
    onlyForRoles: ['admin'],
    keepCache: true,
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