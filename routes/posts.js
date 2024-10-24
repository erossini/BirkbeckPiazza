const express = require('express');
const router = express.Router();

const Posts = require('../models/post');
const Users = require('../models/user');
const { createPostValidation, commentValidation, checkPostsExpirationTime } = require('../validations/postValidation.js')

const verifyToken = require('../validations/verifyToken.js')

const mongoose = require('mongoose');

const expiredText = 'Expired';
const errorExpired = 'This post is expired and it is not possible to add any comment.';

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
                                select: 'user -_id'
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
                user: comment.user,
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
                                select: 'user -_id'
                            })
                            .lean()
                            .exec();

    if(!posts){
        return res.status(404).json({ error: 'No posts found' })
    }

    posts.forEach(post => {
        post.commentsCount = post.comments.length;
        post.comments = post.comments.map(comment => {
            return {
                _id: comment._id,
                comment: comment.comment,
                user: comment.user,
                timestamp: comment.timestamp
            }
        })
    })

    res.status(200).json(posts);
});

router.get('/popular/:topic', async (req, res) => {
    /*
       #swagger.tags = ['Posts']
       #swagger.path = '/api/posts/popular/{topic}'
       #swagger.summary = 'Returns the most popular post for a topic'
       #swagger.description = 'Returns the most popular post for a topic in the collection'
       #swagger.parameters['topic'] = { description: 'This is the topic to filter the posts from the collection' }
    */
    const posts = await Posts.find({ topic: req.params.topic });

    if(!posts){
        return req.status(404).json({ error: 'No posts found' })
    }

    const sortedPosts = posts.sort((a,b) => 
        (b.likes.length + b.dislikes.length + b.comments.length) - 
        (a.likes.length + a.dislikes.length + a.comments.length))

    const popular = sortedPosts[0] || null;

    res.status(200).json(popular);
});

router.get('/expired/:topic', verifyToken, async (req, res) => {
    /*
       #swagger.tags = ['Posts']
       #swagger.path = '/api/posts/popular/{topic}'
       #swagger.summary = 'Returns the expired posts for a topic'
       #swagger.description = 'Returns the expired posts for a topic in the collection'
       #swagger.parameters['topic'] = { description: 'This is the topic to filter the posts from the collection' }
    */
    const expiredPosts = await Posts.find({ topic: req.params.topic, status: 'Expired' });
    if(!expiredPosts) {
        res.status(400).json({ error: 'No posts found' });
    }
    else {
        res.status(200).json(expiredPosts);
    }
})

router.post('/', async (req, res) => {
    /*
       #swagger.tags = ['Posts']
       #swagger.path = '/api/posts'
       #swagger.summary = 'Add a new post'
       #swagger.description = 'Add a new post to the collection'
    */
    const { error } = createPostValidation(req.body);
    if(error)
        return res.status(400).json({ error: 'Post not valid', details: error.details[0].message });
 
    // read the expiration time and convert it in minutes
    const expirationMinutes = Number(req.body.expirationTime);
    const expirationTime = new Date(Date.now() + expirationMinutes * 60000);

    const newPost = new Posts({
        title: req.body.title,
        body: req.body.body,
        topic: req.body.topic,
        owner: req.body.owner,
        expirationTime: expirationTime
    });

    try {
        const savedPost = await newPost.save();
        res.status(201).json(savedPost);
    }
    catch(err) {
        res.status(400).json({ error: 'I can not save the post', details: err.message });
    }
})

// common function for retrieve and check the validity of a post
var retrieveAndCheckPost = async function(postId) {
    const postToUpdate = await Posts.findById(postId).populate('likes');

    if(postToUpdate.status == expiredText) {
        return res.status(400).json({ error: errorExpired })
    }

    const { expired } = await checkPostsExpirationTime(postToUpdate);
    if(expired) {
        postToUpdate.status = expiredText;
        postToUpdate.save();

        return res.status(400).json({ error: errorExpired })
    }

    return postToUpdate;
}

router.put('/:id/dislike', verifyToken, async (req, res) => {
    /*
       #swagger.tags = ['Posts']
       #swagger.path = '/api/posts/{id}/dislike'
       #swagger.summary = 'Add a new dislike to a specific post'
       #swagger.description = 'Add a new dislike to a specific post to the collection'
       #swagger.parameters['id'] = { description: 'The id of a posts from the collection' }
       #swagger.parameters['body'] = {
            in: 'body',
            description: 'Dislike a post',
            schema: {
                $userId: '67153b48d9fa9bcddc10769a'
            }
        } 
    */
    const postId = req.params.id;
    const postToUpdate = await retrieveAndCheckPost(postId);

    const userId = req.body.userId;
    if(postToUpdate.owner == userId) {
        return res.status(400).json({ error: 'You cannot dislike your own post.' });
    }

    const arrLikes = postToUpdate.likes.filter((item) => item._id == userId);
    if(arrLikes.length == 0) {
        await Posts.updateOne({ $push: { likes: userId }});
        const updatedPost = await Posts.findById(postId);
        res.status(200).json(updatedPost);
    }
    else {
        res.status(400).json({ error: 'You already disliked this post' })
    }
})

router.put('/:id/like', verifyToken, async (req, res) => {
    /*
       #swagger.tags = ['Posts']
       #swagger.path = '/api/posts/{id}/like'
       #swagger.summary = 'Add a new like to a specific post'
       #swagger.description = 'Add a new like to a specific post to the collection'
       #swagger.parameters['id'] = { description: 'The id of a posts from the collection' }
       #swagger.parameters['body'] = {
            in: 'body',
            description: 'Like a post',
            schema: {
                $userId: '67153b48d9fa9bcddc10769a'
            }
        } 
    */
    const postId = req.params.id;
    const postToUpdate = await retrieveAndCheckPost(postId);

    const userId = req.body.userId;
    if(postToUpdate.owner == userId) {
        return res.status(400).json({ error: 'You cannot like your own post.' });
    }

    const arrLikes = postToUpdate.likes.filter((item) => item._id == userId);
    if(arrLikes.length == 0) {
        await Posts.updateOne({ $push: { likes: userId }});
        const updatedPost = await Posts.findById(postId);
        res.status(200).json(updatedPost);
    }
    else {
        res.status(400).json({ error: 'You already liked this post' })
    }
})

router.post('/:id/comment', verifyToken, async(req, res) => {
    /*
       #swagger.tags = ['Posts']
       #swagger.path = '/api/posts/{id}/comment'
       #swagger.summary = 'Add a new comment to a specific post'
       #swagger.description = 'Add a new comment to a specific post to the collection'
       #swagger.parameters['id'] = { description: 'The id of a posts from the collection' }
       #swagger.parameters['body'] = {
            in: 'body',
            description: 'New comment to a post',
            schema: {
                $user: '67153b48d9fa9bcddc10769a',
                $comment: 'Comment'
            }
        } 
    */
    const postId = req.params.id;
    const postToUpdate = await retrieveAndCheckPost(postId);

    const commentToAdd = req.body.comment;
    if(commentToAdd.length == 0) {
        return res.status(400).json({ error: 'The text of the comment must be specified' });
    }

    await Posts.updateOne({ $push: { comments: req.body }});
    const updatedPost = await Posts.findById(postId);
    res.status(200).json(updatedPost);
})

module.exports = router;