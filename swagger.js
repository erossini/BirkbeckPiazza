const swaggerAutogen = require('swagger-autogen')({openapi: '3.0.0'});

const doc = {
  info: {
    title: 'Piazza API',
    description: 'Documentation for the Piazza API for Cloud Computing Concepts Coursework at Birkbeck University',
    version: '1.0.0'
  },
  host: 'localhost:3000'
};

const outputFile = './swagger.json';
const routes = ['./routes/posts.js', './routes/users.js'];

/* NOTE: If you are using the express Router, you must pass in the 'routes' only the 
root file where the route starts, such as index.js, app.js, routes.js, etc ... */

swaggerAutogen(outputFile, routes, doc);