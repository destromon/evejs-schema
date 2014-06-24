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
    var template = [];

    var _readKeys = function(content, schema) {
        for(var key in content) {
            var field    = '';
            var type     = '';
            var required = '';
            var data     = '';

            //check if there's field property
            if(content[key].field !== undefined) {
                type = content[key].field;
                field = key;
                //console.log(key, 'type ->', type);

            //check if its select
            } else if(content[key].hasOwnProperty('enum')) {
                field = key;
                type  = 'select';
                for(var select in content[key].enum) {
                   data += content[key].enum[select] +'|';
                }
            } else if(content[key].hasOwnProperty('data')) {
                _readKeys(content[key].data, schema);
            } else {
                //get field according to type property
                if(content[key].hasOwnProperty('type')) {
                } else {
                    //otherwise, its a collection
                    if(key != 0) {
                        _readKeys(content[key], key);    
                    }
                    //console.log(content[key]);
                }
                
                //if its string then its text
                if (field.indexOf('string') !== -1 ) {
                    type = 'text';
                    //console.log(key, ' field is ', type);

                //if its boolean then its radio
                } else if(field.indexOf('boolean') !== -1) {
                    type = 'radio';
                    //console.log(key, ' field is ', type);

                //if its date then its datetime
                } else if(field.indexOf('date') !== -1) {
                    type = 'datetime';
                    //console.log(key, ' field is ', type);
                }

                //get the name of the field
                field = key;
            }
            
            //now we got all the data, lets add it to template
            //ignore if property is created or updated
            if(key === 'created' || key === 'updated') {
                break;
            }

            //check if it has required property!
            if(content[key].hasOwnProperty('required')) {
                required = ' <span>*</span>';
            } else if(content[key].hasOwnProperty('data')) {
                if (content[key].data.hasOwnProperty('required')){
                    required = ' <span>*</span>';
                }
                //_readKeys(content[key], schema);
            }


            //uppercase first letter of title
            var title = field.charAt(0).toUpperCase() + field.substring(1,field.length);

            //check field type and assign it to template
            switch(type) {
                //for radio
                case 'radio':
                    template += '{{#block ' +'\'form/fieldset\' '+  title + required + ' errors.'+field+'.message}}' +
                    '\n\t{{{block '+ '\'field/'+type +'\' ' +field+' ../'+ schema+'.'+field +'}}}';
                     template += '\n\t{{{block '+ '\'field/'+type +'\' ' +field+' ../'+ schema+'.'+field +'}}}' + '\n{{/block}}\n\n';
                    break;

                //for select
                case 'select':
                    data = data.toString().substring(0, data.toString().length-1);
                    template += '{{#block ' +'\'form/fieldset\' '+  title + required + ' errors.'+field+'.message}}' +
                    '\n\t{{{block '+ '\'field/'+type +'\' ' +field+ ' \''+ data +'\' '+ schema+'.'+field +'}}}' + '\n{{/block}}\n\n';
                    break;

                //default template
                default:
                    //check if it has type before assigning the template
                    if(content[key].hasOwnProperty('type')) {
                        template += '{{#block ' +'\'form/fieldset\' '+  title + required + ' errors.'+field+'.message}}' +
                        '\n\t{{{block '+ '\'field/'+type +'\' ' +field+' ../'+ schema+'.'+field +'}}}' + '\n{{/block}}\n\n';
                        break;
                    }
            }
        }
    };

    var createTemplate = function(file, schema, template) {
        fs.writeFile(paths.dev + '/' + paths.schema + '/' + file + '/' +schema, template, function(err) {
            if (err) {
                console.log('failed to create template');
            } else {
                console.log(file, 'template has been created.');
            }
        });
    }
    //loop through schema folder
    for(var schema in data)  {
        //require schema
        var content = require('./schema/' + schema);

        //reset template
        template = [];

        //get file name        
        var file = schema.toString().substring(0,schema.toString().length-3);
        eden('folder', paths.dev + '/' + paths.schema + '/' + file)
        .mkdir(0777, function(err) {

        });
        //traverse through property
        _readKeys(content, file);
        
        //create template'
        schema = schema.replace('.js', '.html');
        createTemplate(file, schema, template);
    }
})