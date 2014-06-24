module.exports = {
    slug    : { type: String, required: true },
    title   : { type: String, required: true },
    detail  : {
        data : { type: String, required: true },
        field: 'wysiwyg'
    },
revision: [{
    data: {
        title   : { type: String },
        detail  : { type: String },
        created : { type: String }
    }
}],
    
    status      : { type: String, enum: ['draft', 'review', 'published', 'other'] },
    visibility  : { type: String, enum: ['public', 'private'] },
    active      : { type: Boolean, default: true },
    published   : { type: String, default: Date.now },
    created     : { type: Date, default: Date.now },
    updated     : { type: Date, default: Date.now },

};