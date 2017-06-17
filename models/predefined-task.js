let mongoose = require('mongoose');

let predefinedTaskSchema = mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    desc: {
        type: String,
        required: true
    },
    score: {
        type: Number,
        required: true
    }
    
});

let PredefinedTask = module.exports = mongoose.model('PredefinedTask', predefinedTaskSchema);