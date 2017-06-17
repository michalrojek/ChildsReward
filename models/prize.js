const mongoose = require('mongoose');

let prizeSchema = mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    desc: {
        type: String,
        required: true
    },
    author: {
        type: String,
        required: true
    },
    child: {
        type: String,
        required: true
    },
    task: {
        type: String,
        required: true
    }
});

let Prize = module.exports = mongoose.model('Prize', prizeSchema); 