const mongoose = require('mongoose');

const postSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    body: {
        type: String,
        required: true
    },
    topic: {
        type: String,
        required: true,
        enum: [
            "Politics",
            "Health",
            "Sport",
            "Tech"
        ]
    },
    timestamp: {
        type: Date,
        default: Date.Now
    },
    expirationTime: {
        type: Date,
        required: true
    },
    status: {
        type: String,
        default: 'Live',
        enum: [
            'Live',
            'Expired'
        ]
    },
    owner: {
        type: mongoose.Schema.Types.ObjectId, ref: 'User'
    },
    likes: [{
        type: mongoose.Schema.Types.ObjectId, ref: 'User'
    }],
    dislikes: [{
        type: mongoose.Schema.Types.ObjectId, ref: 'User'
    }],
    comments: [{
        user: {
            type: mongoose.Schema.Types.ObjectId, ref: 'User'
        },
        comment: {
            type: String
        },
        timestamp: {
            type: Date,
            default: Date.now
        }
    }]
});

module.exports = mongoose.model('Post', postSchema);