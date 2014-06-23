//requrie denpendancies
var eden = require('./build/server/node_modules/edenjs/lib/index');

var paths = require('./config');
var data  = {};

eden('sequence')

//Create schema folder
.then(function(next) {
    console.log('Creating Schema Folder!!');
    eden('folder', paths.dev + '/' + paths.schema)
    .mkdir(0777, function() {
        next();
    });
})

//Loop through schema folder
.then(function(next) {
    console.log('Getting all Files');
    
    // var schema = require('./schema/post.js');
    // console.log(schema);

    var fs=require('fs');

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
                    //console.log(data);  //socket.emit('init', {data: data});
                }
                
            });
        });        
    });
})

//create folder inside build
.then(function(next) {
    var _readKeys = function(content) {
        for(var key in content) {
            if(typeof content[key] === 'object'){        
               //console.log('object-> ', key, content[key])
               console.log('field', key);
                _readKeys(content[key]);
            } 

            if(typeof content[key] === 'function') {
                console.log('type ', content[key].toString().substring(9,content[key].toString().indexOf('(')));  
            }

            if(typeof content[key] === 'string') {
                console.log('string field = ', key);
            }

            if(typeof content[key] === 'boolean') {
                console.log('bool field = ', key);
            }
        }
    }
    //console.log('displaying schemas!', data);
    for(var schema in data)  {
        var content = require('./schema/' + schema);
        //console.log('schema for ->', schema, content);
        console.log('reading schema!');
        _readKeys(content);
    }
})