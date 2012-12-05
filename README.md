## What is it?

10tcl is a CRUD plugin that will add default routes to your express app, that read and store data in your mongodb.

## How is it?

It works! ...mostly.
Right now I could not recommend it. Give it a few months before serious usage.
It has some limitations and misconceptions, and it is not getting better soon.

## Install

    $ npm install 10tcl

## Config

A config file must contain:
    
    module.exports = {
        // used as title for your pages
        brand: 'Day of the Tentacle IS HERE!',
        // used to assemble the connection string to your mongodb instance
        db: { 
            usr: 'Purple',
            pwd: 'Tentacle',
            srv: 'ds044356.mongolab.com:49842',
            db:  'day_of_the_tentacle',
            par: 'auto_reconnect'
        },
        // __dirname of your root
        root: root, 
        // if not informed it defaults to 'root/models', 'root/controllers' and 'root/views'
        pathToCtrls: '/app/controllers',
        pathToModels: '/app/models',
        pathToViews: '/app/views',
        pathToValidator: 'app/models/validator'
    }
    
## Use

    // __dirname will be the root to locate folders indicated in pathTo... properties
    var app = require('10tcl').attack(__dirname, '/config/yourConfigFile')
    app.listen(yourPortHere)

10tcl attack results in an express app configured with routes based on your models and controllers.

### Database

app.db contains a connection to your database.
It was done by using Mongoskin and the credentials on the config object.

### Controllers

Every .js file under your controllers folder was required, receiving (app, base, config).

An example of controller file would be:

    module.exports = function(app, base, config){

        function hello(req, res){
            res.send('hello world')
        }

        app.get('/hello', base.auth, hello )

        // will be used to create a menu
        return {name: 'hello', label: 'Hello World'}

    }

### Models

Every .js file under your models folder was required as well, no arguments.
Each binded to app.db by the model.name property, so now app.db[modelNameHere] points to a collection capable of restfull crud.

An example of model would be:

    module.exports = {
        // model and db collection name
        name: 'victims',
        // Title for pages and menu
        label: 'Victims',
        // used with mustache to format list and drop down descriptions 
        format: 'Victim {{name}} {{lastName}}',
        // fields to format and forms (see next topic)
        fields: [
            { name: 'name', label: 'Nome', type: 'string', checks: ['hasValue'] },
            { name: 'lastName', label: 'Sobrenome', type: 'string' }
        ],
        // create route '<your-site>.com/victims' pointing to 10tcl CRUD
        routeTo10tcl: true,
        // read the entire collection into the app, changes it before persisting
        keepInCache: true,
        // used if you run 'node myApp.js mock'
        mock: [
            {name: 'Mussum', _id: '508e0077d42bd6182f000001'},
            {name: 'Zacarias', _id: '508e0077d42bd6182f000002'},
            {name: 'Dedé', lastname: 'Santana', _id: '508e0077d42bd6182f000003'},
            {name: 'Didi', lastname: 'Mocó', _id: '508e0077d42bd6182f000004'}
        ]
    }

### Field types

10tcl understands: string, number, email, tel, date, html, text, reference (type: 'reference', ref: 'criminal')
Each will result in a different html element and layout.
A field type different from the above will result in a regular input field.

### Validation

10tcl modelValidator provides type associated checks, that are automatically executed on POST/PUT transactions.
Other than that, a field can contain a property checks: ['hasValue', ...]
Each string in checks array will trigger the correspondent function of the modelValidator.
Defining pathToValidator, you can implement your own validator that will be required instead of the 10tcl one.

### i18n

Nop... sorry.
And I'm outputting static texts in PT-BR.
Not happy with any package I've tried.
Want to keep texts in a cached db for online editing and translation.

### CRUD

The views are made with bootstrap, jquery, and some home-made binding (Angular was just making me angry).
In mobile they are much simpler, made with jquerymobile and jquery.
The decision between mobile and desktop is made by reading request headers.