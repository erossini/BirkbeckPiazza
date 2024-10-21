const express = require('express');
const router = express.Router();

const post = require('../models/post');

const verifyToken = require('../validations/verifyToken.js')

router.get('/', async (req, res) => {
    /*
       #swagger.tags = ['Posts']
       #swagger.path = '/api/posts'
       #swagger.summary = 'Get all posts'
       #swagger.description = 'Get all the posts from the collection'
    */
    console.log('Posts');
    res.status(200).send();
})

module.exports = router;