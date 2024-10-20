const express = require('express')
const router = express.Router();

const User = require('../models/user')

router.get('/', async (req, res) => {
    /*
       #swagger.tags = ['Users']
       #swagger.path = '/api/users'
       #swagger.summary = 'Get all users'
       #swagger.description = 'Get all the users from the collection'
    */
    try {
        const list = await User.find();
        res.send(list);
    }
    catch(err) {
        console.log('Error retrieving the users: ', err);
        res.send('Error retrieving the users: ', err);
    }
})

router.get('/:userId', async (req, res) => {
    /*
       #swagger.tags = ['Users']
       #swagger.path = '/api/users/{userId}'
       #swagger.summary = 'Get a user by userId'
       #swagger.description = 'Get all the users from the collection'
       #swagger.parameters['userId'] = { description: 'This is the UserId in the MongoDB collection' }
    */
    try {
        const userSearchById = await User.findById(req.params.userId);
        res.send(userSearchById);
    }
    catch(err) {
        console.log('User not found: ', err);
    }
});

router.post('/register', async (req, res) => {
    /*
       #swagger.tags = ['Users']
       #swagger.path = '/api/users/register'
       #swagger.summary = 'Register a new user'
       #swagger.description = 'Register a new user in the collection'
       #swagger.parameters['body'] = {
            in: 'body',
            description: 'Register a new user',
            schema: {
                $username: 'test',
                $email: 'test@test.com',
                $password: 'password'
            }
    } */

    // prepare the data to save in the database
    const user = new User({
        username: req.body.username,
        email: req.body.email,
        password: req.body.password
    });

    // save the user in the database and return the saved user
    const savedUser = await user.save();
    res.send(savedUser);
})

router.get('/searchByEmail/:email', async(req, res) => {
    /* 
      #swagger.tags = ['Users']
      #swagger.path = '/api/users/searchByEmail/{email}'
      #swagger.summary = 'Get a user by email'
    */
    console.log(req.params.email);
    const userSearchByEmail = await User.findOne({ email: req.params.email});
    res.send(userSearchByEmail);
})

module.exports = router;