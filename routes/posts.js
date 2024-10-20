const express = require('express');
const router = express.Router();

const post = require('../models/post');

router.get('/', async (req, res) => {
    /*
       #swagger.tags = ['Posts']
       #swagger.path = '/api/posts'
       #swagger.summary = 'Get all posts'
       #swagger.description = 'Get all the posts from the collection'
    */
    console.log('Posts');
})

module.exports = router;