const express = require('express')
const router = express.Router();

const bcryptjs = require('bcryptjs')

const User = require('../models/user')
const { registerValidation } = require('../validations/userValidation.js')

const verifyToken = require('../validations/verifyToken.js')

router.delete('/:userId', verifyToken, async (req, res) => {
    /*
        #swagger.tags = ['Users']
        #swagger.path = '/api/users/{userId}'
        #swagger.summary = 'Delete user by userId'
        #swagger.description = 'Delete a user by the userId from the collection'
        #swagger.parameters['userId'] = { description: 'This is the UserId in the MongoDB collection' }
    */
    const userToDelete = await User.findById(req.params.userId);
    if (!userToDelete)
        return res.status(404).json({ error: 'User not found' });

    await User.deleteOne(userToDelete);
    res.status(200).json({ error: 'User deleted' });
})

router.delete('/username/:username', verifyToken, async (req, res) => {
    /*
        #swagger.tags = ['Users']
        #swagger.path = '/api/users/username/{username}'
        #swagger.summary = 'Delete user by username'
        #swagger.description = 'Delete a user by the userId from the collection'
        #swagger.parameters['username'] = { description: 'This is the username for the user to delete in the MongoDB collection' }
    */
    const userToDelete = await User.findOne({ username: req.params.username });
    if (!userToDelete)
        return res.status(404).json({ error: 'User not found' });

    await User.deleteOne(userToDelete);
    res.status(200).json({ error: 'User deleted' });
})

router.delete('/email/:email', verifyToken, async (req, res) => {
    /*
        #swagger.tags = ['Users']
        #swagger.path = '/api/users/email/{email}'
        #swagger.summary = 'Delete user by email'
        #swagger.description = 'Delete a user by the email from the collection'
        #swagger.parameters['username'] = { description: 'This is the email for the user to delete in the MongoDB collection' }
    */
    const userToDelete = await User.findOne({ email: req.params.email });
    if (!userToDelete)
        return res.status(404).json({ error: 'User not found' });

    await User.deleteOne(userToDelete);
    res.status(200).json({ error: 'User deleted' });
})

router.get('/', verifyToken, async (req, res) => {
    /*
       #swagger.tags = ['Users']
       #swagger.path = '/api/users'
       #swagger.summary = 'Get all users'
       #swagger.description = 'Get all the users from the collection'
    */
    try {
        const list = await User.find();
        if(!list || list.length == 0)
            res.status(404).json({ error: 'No users found' });

        res.status(200).send(list);
    }
    catch(err) {
        res.status(500).json({ error: 'Error retrieving the users: ', details: err });
    }
})

router.get('/:userId', verifyToken, async (req, res) => {
    /*
       #swagger.tags = ['Users']
       #swagger.path = '/api/users/{userId}'
       #swagger.summary = 'Get a user by userId'
       #swagger.description = 'Get a user by the UserId from the collection'
       #swagger.parameters['userId'] = { description: 'This is the UserId in the MongoDB collection' }
    */
    try {
        const userSearchById = await User.findById(req.params.userId);
        if(!userSearchById)
            return res.status(404).json({ error: 'User not found' });

        res.status(200).send(userSearchById);
    }
    catch(err) {
        res.status(404).json({ error: 'UserId not found' });
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
        } 
    */

    const error = registerValidation(req.body)
    if(error) {
        return res.status(400).json({ error: 'Validation failed', details: error['details'][0]['message'] })
    }

    const email = req.body.email;
    const userToVerify = await User.findOne({ email: email });
    if(userToVerify) {
        res.status(404).json({ error: 'This email is already in use.'});
        return;
    }
    const usernameToVerify = await User.findOne({ username: req.body.username });
    if(usernameToVerify) {
        res.status(404).json({ error: 'This username is already in use.'});
        return;
    }

    const salt = await bcryptjs.genSalt(5)
    const hashedPassword = await bcryptjs.hash(req.body.password, salt)

    // prepare the data to save in the database
    const user = new User({
        username: req.body.username,
        email: email,
        password: hashedPassword
    });

    // save the user in the database and return the saved user
    try {
        const savedUser = await user.save();
        res.status(200).send(savedUser);
    }
    catch(err) {
        res.status(400).json({ error: 'Error saving the new user', details: err })
    }
})

router.get('/searchByEmail/:email', verifyToken, async(req, res) => {
    /* 
      #swagger.tags = ['Users']
      #swagger.path = '/api/users/searchByEmail/{email}'
      #swagger.summary = 'Get a user by email'
      #swagger.description = 'Search a user by the email'
    */
    const userSearchByEmail = await User.findOne({ email: req.params.email});
    res.status(200).send(userSearchByEmail);
})

module.exports = router;