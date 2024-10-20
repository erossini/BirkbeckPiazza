// add packages dependencies
const express = require('express')
const mongoose = require('mongoose')

// Importing the body-parser to parse the json
const bodyParser = require('body-parser');

// importing routes (middleware)
const userRoute = require('./routes/users')

// define the application
const app = express()

// add body-parser to the app
app.use(bodyParser.json());

// add routes
app.use('/api/users', userRoute);

// open the connection with the database
mongoose.connect('mongodb+srv://erossi03:pw2JwAaSU1tLi100q@cluster0.j09uw.mongodb.net/PiazzaDatabase?retryWrites=true&w=majority&appName=Cluster0')
    .then(() => {
        console.log('Connected with MongoDB')
    })
    .catch((err) => {
        console.error('Error connection to MongoDB', err)
    });

app.listen(3000, () => {
    console.log('The application Piazza is up and running')
});