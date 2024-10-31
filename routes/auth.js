const express = require('express')
const router = express.Router()

const bcryptjs = require('bcryptjs')
const {loginValidation} = require('../validations/authValidation')

const User = require('../models/user')
const jsonwebtoken = require('jsonwebtoken')

router.post('/login', async (req, res) => {
    /*
       #swagger.tags = ['Auth']
       #swagger.path = '/api/auth/login'
       #swagger.summary = 'Login in the application'
       #swagger.description = 'Login in the application to obtain the JWT token to use in the next calls'
    */
    const error = loginValidation(req.body)
    if(error) {
        return res.status(400).json({ error: '', details: error['details'][0]['message']})
    }

    const email = req.body.email
    const username = req.body.username
    const password = req.body.password

    const userToValidate = await User.findOne({ username: username })
    if(!userToValidate) {
        return res.status(400).json({ error: 'User does not exists' })
    }

    const passwordValidation = await bcryptjs.compare(password, userToValidate.password)
    if(!passwordValidation) {
        return res.status(400).json({ error: 'The username and password does not match' })
    }

    const token = jsonwebtoken.sign({_id: userToValidate._id}, process.env.TOKEN_SECRET)
    res.header('auth-token', token).send({'auth-token': token})
})

module.exports = router