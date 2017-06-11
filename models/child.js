let mongoose = require('mongoose');

let childSchema = mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    parent: {
        type: String,
        required: true
    },
    score: {
        type: Number,
        required: true
    },
    achievments: [],
});

let Child = module.exports = mongoose.model('Child', childSchema);