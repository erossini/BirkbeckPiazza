const express = require('express');
const router = express.Router();

const Posts = require('../models/post');

const verifyToken = require('../validations/verifyToken.js')

router.get('/', async (req, res) => {
    /*
       #swagger.tags = ['Posts']
       #swagger.path = '/api/posts'
       #swagger.summary = 'Get all posts'
       #swagger.description = 'Get all the posts from the collection'
    */
    const posts = await Posts.find()
                             .populate('owner', 'username')
                             .populate({
                                path: 'comments.user',
                                select: 'username -_id'
                             })
                             .lean()
                             .exec();
    if(!posts){
        return req.status(404).json({ error: 'No posts found' })
    }

    posts.forEach(post => {
        post.commentsCount = post.comments.length;
        post.comments = post.comments.map(comment => {
            return {
                _id: comment._id,
                comment: comment.comment,
                user: comment.user.username,
                timestamp: comment.timestamp
            }
        })
    })

    res.status(200).json(posts);
});

router.get('/:topic', async (req, res) => {
    /*
       #swagger.tags = ['Posts']
       #swagger.path = '/api/posts/{topic}'
       #swagger.summary = 'Get all posts for a specific topic'
       #swagger.description = 'Get all the posts from the collection'
       #swagger.parameters['topic'] = { description: 'This is the topic to filter the posts from the collection' }
    */
    const posts = await Posts.find({ topic: req.params.topic })
                             .populate('owner', 'username')
                             .populate({
                                path: 'comments.user',
                                select: 'username -_id'
                             })
                             .lean()
                             .exec();
    if(!posts){
        return req.status(404).json({ error: 'No posts found' })
    }

    posts.forEach(post => {
        post.commentsCount = post.comments.length;
        post.comments = post.comments.map(comment => {
            return {
                _id: comment._id,
                comment: comment.comment,
                user: comment.user.username,
                timestamp: comment.timestamp
            }
        })
    })

    res.status(200).json(posts);
});

router.post('/', async (req, res) => {
    /*
       #swagger.tags = ['Posts']
       #swagger.path = '/api/posts'
       #swagger.summary = 'Add a new post'
       #swagger.description = 'Add a new post to the collection'
    */
    
    const expirationMinutes = Number(req.body.expirationTime);

    // convert minutes to millisecond
    const expirationTime = new Date(Date.now() + expirationMinutes * 60000);

    const newPost = new Posts({
        title: req.body.title,
        body: req.body.body,
        topic: req.body.topic,
        owner: req.body._id,
        expirationTime: expirationTime
    });

    const savedPost = await newPost.save();
    res.status(201).json(savedPost);
})

module.exports = router;