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
    var counter = 0;
    var _readKeys = function(content, schema, parent) {
        for(var key in content) {
            //check and recurse if its an object
            if(typeof content[key] === 'object'){
                console.log('---------------');
                //template[counter] = key;
                template[parent] = key
                counter++;
                console.log('parent = ', parent, 'key = ',key);
                _readKeys(content[key], schema, key);
            } 
            if(typeof content[key] === 'function') {
                var v  = content[key].toString().substring(9,content[key].toString().indexOf('(')).toLowerCase();
                var k  = [];
                k[key] = v;
                template[parent] = k;
                console.log(parent, '->', key,  ' = ', content[key].toString().substring(9,content[key].toString().indexOf('(')).toLowerCase());  
            }

            if(typeof content[key] === 'string') {
                console.log('we are in string', key.length);
                var k  = [];
                k[key] = content[key].toString();
                template[parent] = k;
                console.log('for string!');
                console.log(parent, '->', key,  ' = ',  content[key]);
            }

            if(typeof content[key] === 'boolean') {
                template[parent][key] = content[key];
                console.log(parent, '->', key,  ' = ', content[key]);
            }
            
        }
    }
    for(var schema in data)  {
        var content = require('./schema/' + schema);
        console.log('reading schema!');
        var file = schema.toString().substring(0,schema.toString().length-3);
        _readKeys(content, file, file);
        console.log('printing template!!')
        console.log(template);
        return;
        console.log('next....');
        // fs.writeFile(paths.dev + '/' + paths.schema + '/'+schema, template, function(err) {
        //     if (err) {
        //         console.log('failed to create template');
        //     } else {
        //         console.log('template successfully created');
        //     }
        // });
    }
})