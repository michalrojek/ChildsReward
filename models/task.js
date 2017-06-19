let mongoose = require('mongoose');

let taskSchema = mongoose.Schema({
    name: {
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
    desc: {
        type: String,
        required: true
    },
    score: {
        type: Number,
        required: true
    },
    type: {
        type: Number,
        required: true
    },
    deadline: {
        type: Date,
        required: true
    },
    nextDeadline: {
        type: Date,
        required: false
    },
    typeOfDeadline: {
        type: String,
        required: false
    },
    isActive: {
        type: Boolean,
        required: false
    },
    imgurl: {
        type: String,
        required: true
    }
    
});

let Task = module.exports = mongoose.model('Task', taskSchema);