//require denpendancies
var eden      = require('./build/server/node_modules/edenjs/lib/index');

//get schema if theres any
var schemaFiles = eden('array').slice(process.argv, 2);

//require modules
var paths    = require('./config'),
fs           = require('fs'),
data         = {},
fileCount    = 0;

//start sequence
eden('sequence')

//Create schema folder inside build
.then(function(next) {
    console.log('Creating Schema Folder..');

    eden('folder', paths.dev + '/' + paths.schema)
    .mkdir(0777, function() {
        next();
    });
})

//Loop through schema folder in root directory
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
    
    //else, read all schema
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

//loop through each schema file and get its properties
.then(function(next) {
    var subSequence = eden('sequence');

    //form handlebars template
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

            //if data is set, it has multiple data, so loop through it
            if(data) {
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

            //otherwise, just set the template.
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

        //template for select
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

        //default template
        } else {
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
                //and et its value
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

            //if no field property is set, get its type property
            } else {

                //get field according to type property
                if(content[key].hasOwnProperty('type')) {
                    field = content[key].type.toString();
                    field = eden('string').toLowerCase(field);
                } else {
                    
                    //if its not a key
                    if(key != 0) {

                        //we need to put a block
                        //to group all collections
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

                //if its date then its date
                } else if(eden('string').indexOf(field, 'date') !== -1) {
                    type = 'date';
                }
            }

            //get the field, title, value
            field = key;            
            title = eden('string').ucFirst(field);
            value = field;

            //if its under the collection
            //add the collection name
            if(innerForm) {
                field = innerKey + '[' + field + ']';
            }

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

            //now we got all the data, lets add it to template
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
                    }

                    break;
            }
        }
    };

    //create form template
    var createFormTemplate = function(file, template) {
        fs.writeFile(paths.dev + '/' + paths.schema + '/' + file + '/control/template/' + 'form.html', template, function(err) {
            fileCount--;
            if (err) {
                console.log('failed to create',file, 'template');
            } else {
                console.log(file, 'form.html template has been created.');
                if(fileCount === 0) {
                    next();
                }
            }            
        });
    };

    var createTemplate = function(file, folder, destination, sourceFile, schema) {
        //if its schema
        //read and replace data base on schema
        if(sourceFile === 'store.js') {
            subSequence.then(function(subNext) {
                fs.readFile(paths.dev + folder +  sourceFile, 'utf-8', function(err, dataFile){
                    var currentSchema = eden('string').replace(data[schema], 'module.exports = ', ''),
                    currentTemplate   = eden('string').replace(dataFile, 'temp', currentSchema);
                    subNext(file, currentTemplate);
                });
            })

        //else read and replace data base on file
        } else {
            subSequence.then(function(subNext) {
                fs.readFile(paths.dev + folder +  sourceFile, 'utf-8', function(err, data){
                    var currentTemplate = eden('string').replace(data, 'temp', file);
                    subNext(file, currentTemplate);
                });
            });
        }
           
        //write file
        subSequence.then(function(file, currentTemplate, subNext) {
            //if destination is event folder, filename is file-sourceFile
            if (destination === '/server/event/') {
                fs.writeFile(paths.dev + paths.schema + '/' + file + destination + file +'-' + sourceFile , currentTemplate, function(err) {
                    if (err) {
                        console.log('failed to create event template for', file);
                    } else {
                        console.log(file + destination + sourceFile, 'has been created on');
                        subNext();
                    }        
                });

            //else, filename is file
            } else {
                fs.writeFile(paths.dev + paths.schema + '/' + file + destination + sourceFile , currentTemplate, function(err) {
                    if (err) {
                        console.log('failed to create event template for', file);
                    } else {
                        console.log(file + destination + sourceFile, 'has been created');
                        subNext();
                    }          
                });
            }
        });
    };

    //loop through schema folder
    for(var schemas in data)  {
        (function(){ 
            var schema = schemas;
            
            //get schema data and file
            subSequence.then(function(subNext) {
                //get file name of schema
                var file = schema.toString();
                file     = eden('string').substring(file, 0, eden('string').size(file)-3),
                content  = require('./schema/' + schema);

                //reset template
                template = '<form method="post" class="form-horizontal">\n';
                subNext(file, content);
            })

            //create folder per schema
            //create control folder
            .then(function(file, content, subNext) {
                console.log('Creating Control folder for', file, 'package');
                eden('folder', paths.dev + '/' + paths.schema + '/' + file + '/control')
                .mkdir(0777, function(err) {
                    subNext(file, content);
                });
            })

            //create control/action
            .then(function(file, content, subNext) {
                eden('folder', paths.dev + '/' + paths.schema + '/' + file + '/control/action')
                .mkdir(0777, function(err) {
                    subNext(file, content);
                });
            })

            //create control/template
            .then(function(file, content, subNext) {
                eden('folder', paths.dev + '/' + paths.schema + '/' + file + '/control/template')
                .mkdir(0777, function(err) {
                    subNext(file, content);
                });
            })

            //create control/folder
            .then(function(file, content, subNext) {
                eden('folder', paths.dev + '/' + paths.schema + '/' + file + '/control')
                .mkdir(0777, function(err) {
                    subNext(file, content);
                });
            })

            //create server/folder
            .then(function(file, content, subNext) {
                console.log('Creating Server folder for', file, 'package');
                eden('folder', paths.dev + '/' + paths.schema + '/' + file + '/server')
                .mkdir(0777, function(err) {
                    subNext(file, content);
                });
            })

            //create server/event
            .then(function(file, content, subNext) {
                eden('folder', paths.dev + '/' + paths.schema + '/' + file + '/server/event')
                .mkdir(0777, function(err) {
                    subNext(file, content);
                });
            })

            //create server/action
            .then(function(file, content, subNext) {
                eden('folder', paths.dev + '/' + paths.schema + '/' + file + '/server/action')
                .mkdir(0777, function(err) {
                    subNext(file, content);
                });
            })

            //now all folders has been created
            //read properties of schema and create a form template
            .then(function(file, content, subNext) {
                //read properties
                _readKeys(content, file);
                //create form
                createFormTemplate(file, template);

                subNext(file);
            })

            //get files in control/template and create a control template
            .then(function(file, subNext) {
                console.log('Creating Control Action for', file);
                var dir = './template/control/template/';
                var template = {};
                eden('folder', dir).getFiles(null, false, function(files){
                    var template = files;
                    for (var page in template) {
                        var path = template[page].path;
                        var thisFile = eden('string').substring(path, 
                            eden('string').lastIndexOf(path, '/')+1, 
                            eden('string').size(path));
                        
                        createTemplate(file, eden('string').substr(dir,1, eden('string').size(dir)) , '/control/template/', thisFile);
                    }
                    subNext(file);
                });
            })

            //get files in control/action and create a control action
            .then(function(file, subNext) {
                console.log('Creating Control Action for', file);
                var dir = './template/control/action/';
                var action = {};
                eden('folder', dir).getFiles(null, false, function(files){
                    var action = files;
                    for (var page in action) {
                        var path = action[page].path;
                        var thisFile = eden('string')
                            .substring(path, eden('string').lastIndexOf(path, '/') + 1,
                            eden('string').size(path));
                        
                        createTemplate(file, eden('string').substr(dir,1, eden('string').size(dir)) , '/control/action/', thisFile);
                    }
                    subNext(file);
                });
            })

            //get files in server/event and create server event
            .then(function(file, subNext) {
                console.log('Creating Server Event for', file);

                var dir = './template/server/event/';
                var events = {};
                eden('folder', dir).getFiles(null, false, function(files){
                    events = files;
                    for (var page in events) {
                        var path = events[page].path;
                        var thisFile = eden('string')
                            .substring(path, eden('string').lastIndexOf(path, '/') + 1,
                            eden('string').size(path));
                        
                        createTemplate(file, eden('string').substr(dir,1, eden('string').size(dir)) , '/server/event/', thisFile);
                    }
                    subNext(file);
                });
            })

            //get files in server/action and create a server action
            .then(function(file, subNext) {
                console.log('Creating Server Action for', file);

                var dir = './template/server/action/';
                var action = {};
                eden('folder', dir).getFiles(null, false, function(files){
                    action = files;
                    for (var page in action) {
                        var path = action[page].path;
                        var thisFile = eden('string')
                            .substring(path, eden('string').lastIndexOf(path, '/') + 1,
                            eden('string').size(path));

                        createTemplate(file, eden('string').substr(dir,1, eden('string').size(dir)) , '/server/action/', thisFile);
                    }
                });
                subNext(file);
            })

            // for server/, index, store and factory
            // we need to pass the schema, as store will be using it
            .then(function(file, subNext) {
                var dir = './template/server/';
                var server = {};
                eden('folder', dir).getFiles(null, false, function(files){
                    server = files;
                    for (var page in server) {
                        var path = server[page].path;
                        var thisFile = eden('string')
                            .substring(path, eden('string').lastIndexOf(path, '/') + 1,
                            eden('string').size(path));

                        createTemplate(file, eden('string').substr(dir,1, eden('string').size(dir)) , '/server/', thisFile, schema);
                    }
                });

                subNext();
            });
        })(schemas);
    }
}); 