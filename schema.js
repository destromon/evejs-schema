//requrie denpendancies
var eden = require('./build/server/node_modules/edenjs/lib/index');

var paths = require('./config');
var data  = {};
var fs = require('fs');

eden('sequence')

//Create schema folder
.then(function(next) {
    console.log('Creating Schema Folder..');
    eden('folder', paths.dev + '/' + paths.schema)
    .mkdir(0777, function() {
        next();
    });
})

//Loop through schema folder
.then(function(next) {
    console.log('Getting All Schema...');
    var dir='./schema/';

    fs.readdir(dir, function(err,files){
        if (err) throw err;
        var c=0;
        files.forEach(function(file){
            c++;
            fs.readFile(dir+file,'utf-8',function(err, schema){
                if (err) throw err;
                data[file]=schema;
                if (0===--c) {
                    next();
                }            
            });
        });        
    });
})

//loop through schema and get properties
.then(function(next) {
    var template = {};
    var counter  = 0;

    var _readKeys = function(content, schema, parent) {
        for(var key in content) {
            var field    = '';
            var type     = '';
            var required = '';

            //check if there's field property
            if(content[key].field !== undefined) {
                type = content[key].field;
                field = key;
                console.log(key, 'type ->', type);

            //check if its select
            } else if(content[key].hasOwnProperty('enum')) {
                field = key;
                type  = 'select';
                console.log(key, 'type ->', ' select')
            } else {

                //get its type
                if(content[key].hasOwnProperty('type')) {

                    var field = content[key].type.toString().toLowerCase();
                    console.log(field);
                    //case if string
                    if (field.indexOf('string') !== -1 ) {
                        type = 'text';
                        console.log(key, ' field is ', type);

                    //case if boolean
                    } else if(field.indexOf('boolean') !== -1) {
                        type = 'radio';
                        console.log(key, ' field is ', type);

                    //case if date
                    } else if(field.indexOf('date') !== -1) {
                        type = 'datetime';
                        console.log(key, ' field is ', type);
                    } 
                    field = key;
                } else {
                    console.log (key, 'is array so its ewan pa');
                }

                //check if its required!
                if(content[key].hasOwnProperty('required')) {
                    required = '<span>*</span>';
                }
            }
                if(key === 'created' || key === 'updated') {
                    break;
                }
                //add to template
                template += '{{{block '+ '\'field/'+type +'\' ' +field+' ../'+ schema+'.'+field +'}}}';
        }
    }

    for(var schema in data)  {
        var content = require('./schema/' + schema);
        console.log('reading schema!');
        var file = schema.toString().substring(0,schema.toString().length-3);
        _readKeys(content, file, file);
        console.log('printing template!!')
        console.log(template);
        
        fs.writeFile(paths.dev + '/' + paths.schema + '/'+schema, template, function(err) {
            if (err) {
                console.log('failed to create template');
            } else {
                console.log('template successfully created');
            }
        });
        return;
    }
})