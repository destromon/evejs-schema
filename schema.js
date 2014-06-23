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
    
    // var schema = require('./schema/post.js');
    // console.log(schema);

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
                    console.log('going next');
                    next();
                }
                
            });
        });        
    });
})

//loop through schema and get properties
.then(function(next) {
    var template  = {};
    var _readKeys = function(content, schema) {
        for(var key in content) {
            //check and recurse if its an object
            if(typeof content[key] === 'object'){
               template += "{{{block 'field/text' '"+key+"' ../"+schema+"."+key+"}}}";
            //   console.log('field', key);
                _readKeys(content[key], schema);
            } 

            if(typeof content[key] === 'function') {
            //    console.log(key,  ' = ', content[key].toString().substring(9,content[key].toString().indexOf('(')));  
            }

            if(typeof content[key] === 'string') {
            //    console.log(key,  ' = ',  content[key]);
            }

            if(typeof content[key] === 'boolean') {
            //    console.log(key,  ' = ', content[key]);
            }
        }
    }
    for(var schema in data)  {
        var content = require('./schema/' + schema);
        template = {};
        console.log('reading schema!');
        var file = schema.toString().substring(0,schema.toString().length-3);
        _readKeys(content, file);
        //console.log(template);
        fs.writeFile(paths.dev + '/' + paths.schema + '/'+schema, template, function(err) {
            if (err) {
                console.log('failed to create template');
            } else {
                console.log('template successfully created');
            }
        });
    }
})