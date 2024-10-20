const express = require('express')
const router = express.Router();

const User = require('../models/user')

router.post('/register', async (req, res) => {
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

module.exports = router;