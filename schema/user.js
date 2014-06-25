module.exports = {
    name        : { type: String, required: true },
    slug        : { type: String, required: true },
    email       : { type: String, required: true },
    password    : { type: String, field:'password' },
    birthdate   : { type: Date },
    gender      : { type: String, enum: ['male', 'female', null], field: 'radio' },
    food        : { type: String, enum: ['meat', 'veggy', 'seafood'], field: 'checkbox' },
    foodtrip    : { type: String, field: 'checkbox' },
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