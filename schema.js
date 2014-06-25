//require denpendancies
var eden = require('./build/server/node_modules/edenjs/lib/index');

//get schema if theres any
var schemaFiles = eden('array').slice(process.argv, 2);

var paths = require('./config');
var data  = {};
var fs    = require('fs');

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
    console.log('Getting Schema...');
    var dir='./schema/';
    
    //if user specify a schema
    if(eden('string').size(schemaFiles.toString()) >= 1) {
        var c = 0;
        schemaFiles.forEach(function(file) {
            c++;
            fs.readFile(dir+file,'utf-8',function(err, schema) {
                if (err) {
                    console.log('invalid file');
                }

                data[file]=schema;
                if (0===--c) {
                    next();
                }            
            });
        });
    
    //read all schema
    } else {
        fs.readdir(dir, function(err,files) {
            if (err) throw err;
            var c=0;
            files.forEach(function(file){
                c++;
                console.log(file);
                fs.readFile(dir+file,'utf-8',function(err, schema) {
                    if (err) {
                        console.log('invalid file');
                    }

                    data[file]=schema;
                    if (0===--c) {
                        next();
                    }            
                });
            });        
        });    
    }
})

//loop through schema and get properties
.then(function(next) {
    var template     = [],
    startBlock       = "{{#block 'form/fieldset' ",
    endStartBlock    = '}}',
    innerStartBlock  = '{{#block ',
    endBlock         = '}}',
    newLine          = '\n',
    tab              = '\t',
    innerBlock       = '{{{block ',
    innerCloserBlock = '}}}',
    closerBlock      = '{{/block}}';

    var _readKeys = function(content, schema) {
        for(var key in content) {
            var data = '',
            field    = '',
            required = '',
            type     = '';

            //check if there's field property
            if(content[key].field !== undefined) {
                type  = content[key].field;
                field = key;

            //check if its select
            } else if(content[key].hasOwnProperty('enum')) {
                field = key;

                //if theres enum property, default is select
                type  = 'select';
                //otherwise, check if it has field property
                //get its value
                if(content[key].hasOwnProperty('field')) {
                    type = content[key].field.toString();
                }

                //get items
                for(var select in content[key].enum) {
                   data += content[key].enum[select] + '|';
                }

                data = eden('string').substr(data, 0, eden('string').size(data)-1);

            } else if(content[key].hasOwnProperty('data')) {
                //its a collection, recurse
                _readKeys(content[key].data, schema);
            } else {
                //get field according to 'type' property
                if(content[key].hasOwnProperty('type')) {
                    field = content[key].type.toString();
                    field = eden('string').toLowerCase(field);
                } else {
                    //if its not a key
                    if(key != 0) {
                        template += newLine + '<hr />' 
                                 +  newLine + startBlock
                                 +  '\'' + 'Start: Template for ' 
                                 +  eden('string').ucFirst(key) + '\' '
                                 +  endBlock + closerBlock;

                        //its a collection, recurse
                        _readKeys(content[key], key);

                        template += newLine + startBlock
                                 +  '\'' + 'End: Template for ' 
                                 +  eden('string').ucFirst(key) + '\' '
                                 +  endBlock + closerBlock 
                                 +  newLine + '<hr/ >' + newLine;
                    }
                }

                //get type of input
                //if its string then its text
                if (eden('string').indexOf(field, 'string') !== -1 ) {
                    type = 'text';

                //if its boolean then its radio
                } else if(eden('string').indexOf(field, 'boolean') !== -1) {
                    type = 'radio';

                //if its date then its datetime
                } else if(eden('string').indexOf(field, 'date') !== -1) {
                    type = 'date';
                }

                //get the name of the field
                field = key;
            }
            
            //now we got all the data, lets add it to template
            //ignore if property is created or updated
            if(key === 'created' || key === 'updated') {
                continue;
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
            var title = eden('string').ucFirst(field);

            //check field type and assign it to template
            switch(type) {
                //for radio
                case 'radio':
                    template += newLine + tab
                             +  startBlock 
                             +  '\'' + title + required + '\' '
                             +  'errors.' + field + '.message' 
                             +  endStartBlock
                                 +  newLine + tab + tab
                                 +  innerStartBlock
                                 +  '\'field/' + type +'\' '
                                 +  '\'' + field  +  '\' '
                                 +  '../'+ schema + '.' + field
                                 +  endStartBlock
                                 +  closerBlock
                                 +  newLine + tab + tab
                                 +  innerStartBlock
                                 +  '\'field/' + type +'\' '
                                 +  '\'' + field  +  '\' '
                                 +  '../'+ schema + '.' + field
                                 +  endStartBlock
                                 +  closerBlock
                             +  closerBlock
                             +  newLine
                    break;

                //for select
                case 'select':
                    template += newLine + tab
                             +  startBlock 
                             +  '\'' + title + required + '\' '
                             +  'errors.' + field + '.message' 
                             +  endStartBlock
                             +  newLine + tab + tab
                             +  innerBlock
                             +  '\'field/' + type +'\' '
                             +  '\'' + field  +  '\' '
                             +  '\'' + data   +  '\' '
                             +  '../'+ schema + '.' + field
                             +  innerCloserBlock
                             +  newLine + tab
                             +  closerBlock
                             +  newLine;
                    break;

                //default template
                default:
                    //check if it has type before assigning it to templatenotp
                    if(content[key].hasOwnProperty('type')) {
                        template += newLine + tab
                                 +  startBlock 
                                 +  '\'' + title + required + '\' '
                                 +  'errors.' + field + '.message' 
                                 +  endStartBlock
                                 +  newLine + tab + tab
                                 +  innerBlock
                                 +  '\'field/' + type +'\' '
                                 +  '\'' + field  + '\' '
                                 +  '../'+ schema + '.' + field
                                 +  innerCloserBlock
                                 +  newLine + tab
                                 +  closerBlock
                                 +  newLine;
                        break;
                    }
            }
        }
    };

    var createTemplate = function(file, template) {
        fs.writeFile(paths.dev + '/' + paths.schema + '/' + file + '/' +'form.html', template, function(err) {
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
        template = '<form method="post" class="form-horizontal">\n';

        //get file name        
        var file = schema.toString();
        file     = eden('string').substring(file, 0, eden('string').size(file)-3);
        eden('folder', paths.dev + '/' + paths.schema + '/' + file).mkdir(0777, function(err) {});
        
        //traverse through property
        _readKeys(content, file);
        
        schema   = eden('string').replace(schema, '.js', '.html');
        template += '\n</form>';

        //create html template
        createTemplate(file, template);
    }
})