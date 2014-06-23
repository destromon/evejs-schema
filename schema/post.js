module.exports = {
    slug    : { type: String, required: true },
    title   : { type: String, required: true },
    detail  : {
        data : { type: String, required: true },
        field: 'textarea'
    },
    revision: [{
        title   : String,
        detail  : String, 
        created : String }],
    
    status      : { type: String, enum: ['draft', 'review', 'published'] },
    visibility  : { type: String, enum: ['public', 'private'] },
    active      : { type: Boolean, default: true },
    published   : { type: Date, default: Date.now },
    created     : { type: Date, default: Date.now },
    updated     : { type: Date, default: Date.now }
};