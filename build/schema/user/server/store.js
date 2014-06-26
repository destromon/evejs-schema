module.exports = function() {
	var c = function() {
		this.__construct.call(this);
	}, public = c.prototype;
	
	/* Public Properties
	-------------------------------*/
	/* Private Properties
	-------------------------------*/
	var mongoose 	= require('mongoose');
	
	var _schema = {
    name        : { type: String, required: true },
    slug        : { type: String, required: true },
    email       : { type: String, required: true },
    password    : { type: String, field:'password' },
    birthdate   : { type: Date },
    gender      : { type: String, enum: ['male', 'female', null], field: 'radio' },
    website     : { type: String },
    phone       : { type: String },
    address     : [{
        data : {
            label           : { type: String },
            contact         : { type: String }, 
            street          : { type: String },
            neighborhood    : { type: String }, 
            city            : { type: String }, 
            state           : { type: String }, 
            region          : { type: String }, 
            country         : { type: String, field: 'country'}, 
            postal          : { type: String }, 
            phone           : { type: String }
        }
    }],

    company     : {
        name    : { type: String },
        title   : { type: String },
        street  : { type: String },
        city    : { type: String },
        state   : { type: String },
        country : { type: String, field: 'country'},
        postal  : { type: String },
        phone   : { type: String },
        email   : { type: String },
    },
    
    photo       : [{
        data : {
            name        : { type: String },
            source      : { type: String, field: 'file' },
            mime        : { type: String },
            date        : { type: Date, default: Date.now }
        }
    }],
    
    facebook    : { type: String },
    twitter     : { type: String },
    google      : { type: String },
    linkedin    : { type: String },
    
    active:  { type: Boolean, default: true },
    created: { type: Date, default: Date.now },
    updated: { type: Date, default: Date.now }
};
	
	/* Loader
	-------------------------------*/
	public.__load = c.load = function() {
		if(!this.__instance) {
			this.__instance = new c();
		}
		
		return this.__instance;
	};
	
	/* Construct
	-------------------------------*/
	public.__construct = function() {
		var schema = mongoose.Schema;
		
		//define schema
		this.schema = new schema(_schema);
		//NOTE: add custom schema methods here
		
		this.store = mongoose.model('post', this.schema);
	};
	
	/* Public Methods
	-------------------------------*/
	public.count = function(query, callback) {
		return this.store.count(query, callback);
	};
	
	public.model = function(data) {
		return new (this.store)(data);
	};
	
	public.find = function(query) {
		return this.store.find(query);
	};
	
	public.findOne = function(query) {
		return this.store.findOne(query);
	};
	
	public.findById = function(id) {
		return this.store.findById(id);
	};
	
	public.remove = function(id, callback) {
		return this.update(id, { active: false }, callback);
	};
	
	public.restore = function(id, callback) {
		return this.store.findOneAndUpdate(
			{_id: id, active: false}, 
			{ $set: { active: true } }, callback);
	};
	
	public.update = function(id, data, callback) {
		return this.store.findOneAndUpdate(
			{_id: id, active: true}, 
			{ $set: data }, callback);
	};
	
	/* Private Methods
	-------------------------------*/
	/* Adaptor
	-------------------------------*/
	return c;  
}();