let mongoose = require('mongoose');

let achievmentSchema = mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    score: {
        type: Number,
        required: true
    },
    desc: {
        type: String,
        required: true
    },
    imgurl: {
        type: String,
        required: true
    }
});

let Achievment = module.exports = mongoose.model('Achievment', achievmentSchema);