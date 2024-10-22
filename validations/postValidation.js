const Joi = require('joi');

// Function to validate post creation data
const createPostValidation = (data) => {
    const schema = Joi.object({
        title: Joi.string().required().min(3).max(256),
        body: Joi.string().required().min(3),
        topic: Joi.string().required().valid('Politics', 'Health', 'Sport', 'Tech'),
        expirationTime: Joi.number().positive().min(1).required(),
        owner: Joi.string().required()
    });
    return schema.validate(data);
}

// Function to validate comment data
const commentValidation = (data) => {
    const schema = Joi.object({
        comment: Joi.string().required().min(1).max(1024)
    });
    return schema.validate(data);
}

// check if a post is still valid or it expired
async function checkPostsExpirationTime(post) {
    const currentTime = new Date();

    if(currentTime >= post.expirationTime) {
        return { expired: true }
    }

    return { expired: false, post}
}

// Exporting functions
module.exports.createPostValidation = createPostValidation;
module.exports.commentValidation = commentValidation;
module.exports.checkPostsExpirationTime = checkPostsExpirationTime;