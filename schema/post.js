module.exports = {
    slug    : { type: String, required: true },
    title   : { type: String, required: true },
    detail  : { type: String, required: true, field: 'wysiwyg' },

revision: [{
    data: {
        title   : { type: String },
        detail  : { type: String, field: 'wysiwyg'},
        created : { type: Date }
    }
}],
    
    status      : { type: String, enum: ['draft', 'review', 'published', 'other'] },
    visibility  : { type: String, enum: ['public', 'private'] },
    active      : { type: Boolean, default: true },
    published   : { type: Date, default: Date.now },
    created     : { type: Date, default: Date.now },
    updated     : { type: Date, default: Date.now },

    autocomplete : { type: String, field: 'autocomplete' },
    button       : { type: String, field: 'button' },
    checkbox     : { type: String, field: 'checkbox' },
    color        : { type: String, field: 'color' },
    combobox     : { type: String, field: 'combobox' },
    file         : { type: String, field: 'file' },
    tag          : { type: String, field: 'tag' },
    textarea     : { type: String, field: 'textarea' },
    wysiwyg      : { type: String, field: 'wysiwyg' },
    country      : { type: String, field: 'country' }

};