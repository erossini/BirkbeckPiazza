const express = require('express')
const app = express()

const bcryptjs = require('bcryptjs')
const jsonwebtoken = require('jsonwebtoken')

// import the settings from the .env file
require('dotenv').config()

const mongoose = require('mongoose')

// Importing the body-parser to parse the json
const bodyParser = require('body-parser');

// importing routes (middleware)
const authRoute = require('./routes/auth')
const postRoute = require('./routes/posts')
const userRoute = require('./routes/users')

// add body-parser to the app
app.use(bodyParser.json());

// add routes
app.use('/api/auth', authRoute)
app.use('/api/posts', postRoute);
app.use('/api/users', userRoute);

// open the connection with the database
mongoose.connect(process.env.DB_CONNECTOR)
    .then(() => {
        console.log('Connected with MongoDB')
    })
    .catch((err) => {
        console.error('Error connection to MongoDB', err)
    });

// add Swagger 
const swaggerUi = require('swagger-ui-express')
const swaggerDocument = require('./swagger.json');
app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

app.listen(3000, () => {
    console.log('The application Piazza is up and running')
});