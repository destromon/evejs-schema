module.exports = {
    name        : { type: String, required: true },
    slug        : { type: String, required: true },
    email       : { type: String, required: true },
    password    : String,
    birthdate   : Date,
    gender      : { type: String, enum: ['male', 'female', null, ''] },
    website     : String,
    phone       : String,
    address     : [{
        label           : String,
        contact         : String, 
        street          : String, 
        neighborhood    : String, 
        city            : String, 
        state           : String, 
        region          : String, 
        country         : String, 
        postal          : String, 
        phone           : String
    }],

    company     : {
        name    : String,
        title   : String,
        street  : String,
        city    : String,
        state   : String,
        country : String,
        postal  : String,
        phone   : String,
        email   : String
    },
    
    photo       : [{
        name        : String,
        source      : String,
        mime        : String,
        date        : { type: Date, default: Date.now }
    }],
    
    facebook    : String,
    twitter     : String,
    google      : String,
    linkedin    : String,
    
    active: { type: Boolean, default: true },
    created: { type: Date, default: Date.now },
    updated: { type: Date, default: Date.now }
};