module.exports = {
    name: 'user',
    label: 'Usuários',
    format: '{{name}} {{lastname}}',
    onlyFor: ['admin'],
    routeTo10tcl: true,
    keepCache: true,
    fields: [
        { name: 'usr', label: 'Usuário', checks: ['hasValue', 'unique', 'unchanged'] },
        { name: 'pwd', label: 'Senha', type: 'password', checks: ['hasValue'] },
        { name: 'name', label: 'Nome', checks: ['hasValue'] },
        { name: 'lastName', label: 'Sobrenome', checks: ['hasValue'] },
        { name: 'email', label: 'e-mail', type: 'email', checks: ['hasValue'] },
        { name: 'theme', label: 'Tema', type: 'reference', to: 'themes' },
        { name: 'role', label: 'Perfil', onlyFor: 'admin' }
    ],
    mock: [
    	{
		    "usr": "didi",
		    "pwd": "moco",
		    "name": "Didi",
		    "lastName": "Mocó",
            "theme": { "_id": "theme-2"},
		    "_id": "508e0077d42ka9862f000001"
		}
    ]
}