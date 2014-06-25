//require denpendancies
var eden      = require('./build/server/node_modules/edenjs/lib/index');

//get schema if theres any
var schemaFiles = eden('array').slice(process.argv, 2);

var paths = require('./config'),
fs        = require('fs'),
data      = {},
fileCount = 0;

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
                fileCount++;
                if (err) {
                    console.log('invalid file');
                    return;
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
                fileCount++;
                c++;
                fs.readFile(dir+file,'utf-8',function(err, schema) {
                    if (err) {
                        console.log('invalid file');
                        return;
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

//loop through schema file and get properties
.then(function(next) {
    //create form template
    var template     = [],
    startBlock       = "{{#block 'form/fieldset' ",
    endStartBlock    = '}}',
    innerStartBlock  = '{{#block ',
    endBlock         = '}}',
    newLine          = '\n',
    tab              = '\t',
    innerBlock       = '{{{block ',
    innerCloserBlock = '}}}',
    closerBlock      = '{{/block}}',

    innerForm        = false,
    innerKey         = '';

    var setTemplate = function(data, field, schema, value, title, required, type) {
        //set template accoding to type
        if(type === 'checkbox' || type === 'radio') {
            
            //start template block
            template += newLine + tab
                +  startBlock 
                +  '\'' + title + required + '\' '
                +  'errors.' + value + '.message' 
                +  endStartBlock;

            if(data) {
                //if data is set, loop through it
                data = eden('string').split(data, '|');
                for (var i = 0; i < eden('array').size(data); i++) {
                    template += newLine + tab + tab
                        +  innerStartBlock
                        +  '\'field/' + type +'\' '
                        +  '\'' + field  +  '\' '
                        +  '../'+ schema + '.' + value
                        +  endStartBlock
                        +  eden('string').ucFirst(data[i])
                        +  closerBlock;
                }
            } else {
                template += newLine + tab + tab
                    +  innerStartBlock
                    +  '\'field/' + type +'\' '
                    +  '\'' + field  +  '\' '
                    +  '../'+ schema + '.' + value
                    +  endStartBlock
                    +  'True'
                    +  closerBlock
                    +  newLine + tab + tab
                    +  innerStartBlock
                    +  '\'field/' + type +'\' '
                    +  '\'' + field  +  '\' '
                    +  '../'+ schema + '.' + value
                    +  endStartBlock
                    +  'False'
                    +  closerBlock;
            }

            //close template block
            template += newLine + tab
                +  closerBlock
                +  newLine;
        } else if(type === 'select') {
            //template for select
            template += newLine + tab
                +  startBlock 
                +  '\'' + title + required + '\' '
                +  'errors.' + value + '.message' 
                +  endStartBlock
                +  newLine + tab + tab
                +  innerBlock
                +  '\'field/' + type +'\' '
                +  '\'' + field  +  '\' '
                +  '\'' + data   +  '\' '
                +  '../'+ schema + '.' + value
                +  innerCloserBlock
                +  newLine + tab
                +  closerBlock
                +  newLine;
        } else {
            //default template
            template += newLine + tab
                +  startBlock 
                +  '\'' + title + required + '\' '
                +  'errors.' + value + '.message' 
                +  endStartBlock
                +  newLine + tab + tab
                +  innerBlock
                +  '\'field/' + type +'\' '
                +  '\'' + field  + '\' '
                +  '../'+ schema + '.' + value
                +  innerCloserBlock
                +  newLine + tab
                +  closerBlock
                +  newLine;
        }
        
    };

    var _readKeys = function(content, schema) {
        for(var key in content) {
            var data = '',
            field    = '',
            required = '',
            title    = '',
            type     = '',
            value    = '';

            //check if there's field property
            if(content[key].field !== undefined) {
                type  = content[key].field;
                if(content[key].hasOwnProperty('enum')) {

                    //get items
                    for(var items in content[key].enum) {
                       data += content[key].enum[items] + '|';
                    }
                    
                    data = eden('string').substr(data, 0, eden('string').size(data)-1);
                }

            //check if its select
            } else if(content[key].hasOwnProperty('enum')) {
                
                //if theres enum property, default is select
                type  = 'select';
                
                //otherwise, check if it has field property
                //get its value
                if(content[key].hasOwnProperty('field')) {
                    type = content[key].field.toString();
                }

                //get items
                for(var items in content[key].enum) {
                   data += content[key].enum[items] + '|';
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
                        innerForm = true;
                        innerKey  = key;
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
                        innerForm = false;
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
            }

            //get the field, title, value
            field = key;            
            title = eden('string').ucFirst(field);
            value = field;

            //if its a collection, add collection name
            if(innerForm) {
                field = innerKey + '[' + field + ']';
            }

            //now we got all the data, lets add it to template
            //ignore if field is created or updated
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
            }

            //check field type and assign it to template
            switch(type) {
                //for radio
                case 'radio':
                    setTemplate(data, field, schema, value, title, required, type);
                    break;

                //for checkbox
                case 'checkbox':
                    setTemplate(data, field, schema, value, title, required, type);
                    break;
                //for select
                case 'select':
                    setTemplate(data, field, schema, value, title, required, type);
                    break;

                //default template
                default:
                    //check if it has type before assigning it to template
                    if(content[key].hasOwnProperty('type')) {
                        setTemplate(data, field, schema, value, title, required, type);
                        break;
                    }
            }
        }
    };

    var subSequence = eden('sequence');

    var createTemplate = function(file, template) {
        fs.writeFile(paths.dev + '/' + paths.schema + '/' + file + '/control' + '/' +'form.html', template, function(err) {
            fileCount--;
            if (err) {
                console.log('failed to create',file, 'template');
            } else {
                console.log(file, 'Form template has been created.');
                if(fileCount === 0) {
                    next();
                }
            }            
        });
    }

    var createIndexTemplate = function(file) {
        console.log('Creating Index page for', file);

        //read template
        subSequence.then(function(subNext) {
            fs.readFile(paths.dev + '/package/control/template/index.html', 'utf-8', function(err, data){
                var indexTemplate = data;
                indexTemplate     =  eden('string').replace(indexTemplate, 'temp', file);
                subNext(file, indexTemplate);
            });
        })
        //create index template
        .then(function(file, indexTemplate, subNext) {
            fs.writeFile(paths.dev + '/' + paths.schema + '/' + file + '/control/' + 'index.html', indexTemplate, function(err) {
                if (err) {
                    console.log('failed to create',file, 'template');
                } else {
                    console.log(file, 'Index template has been created.');
                    subNext();
                }          
            });
        });
    };

    var createServerEvent = function(file) {
        console.log('Creating Server Event for', file);
    };

    //loop through schema folder
    for(var schemas in data)  {
        (function(){ 
            var schema = schemas;
            subSequence.then(function(subNext) {
            //get file name        
            var file = schema.toString();
            file     = eden('string').substring(file, 0, eden('string').size(file)-3),
            content  = require('./schema/' + schema);

            //reset template
            template = '<form method="post" class="form-horizontal">\n';
            subNext(file, content);
            })

            //create control folder
            .then(function(file, content, subNext) {
                console.log('Creating Control folder for', file, 'package');
                eden('folder', paths.dev + '/' + paths.schema + '/' + file + '/control')
                .mkdir(0777, function(err) {
                    subNext(file, content);
                });
            })

            //create server folder
            .then(function(file, content, subNext) {
                console.log('Creating Server folder for', file, 'package');
                eden('folder', paths.dev + '/' + paths.schema + '/' + file + '/server')
                .mkdir(0777, function(err) {
                    subNext(file, content);
                });
            })

            //read properties and create template
            .then(function(file, content, subNext) {
                _readKeys(content, file);
                createTemplate(file, template);
                createIndexTemplate(file);
                subNext(file);

            //create server template
            }).then(function(file, subNext) {
                createServerEvent(file);
                subNext();
            });
        })(schemas);
    }
}); 