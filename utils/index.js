var jwt      = require('jsonwebtoken');
var instance = require('../models').instance; 

// Generates a json web token for a given user
const generateJWT = (user) => {
  var today = new Date();
  var exp = new Date(today);
  exp.setDate(today.getDate() + 60); // expire in 60 days

  return jwt.sign({
    id: user.identity(),
    exp: parseInt(exp.getTime() / 1000),
  }, process.env.JWT_SECRET);
}

const userResponse = (user) => {
  let body = user.properties(); // all fields
  // Return string rep of ID for frontend. TODO: use a slug for id
  body.id = user.identity().toString();
  return {
    user: body
  }
}

const userAuthResponse = (user) => {
  let response = userResponse(user);
  response.user.token = generateJWT(user); // append token
  return response;
}

const eventResponse = (event, author) => {
  let body = event.properties();
  // Return string rep of ID for frontend. TODO: use a slug for id
  body.id = event.identity().toString();

  if (!author) {
    // No user given, attempt to eager load through relation
    author = event.get('posted_by');
  }

  // Replace 'user' with 'author' and append to event
  body.author = userResponse(author).user;

  return {
    event: body
  }
}

// Gets all node related through relationship label.
const getRelatedNodes = (node, relationship) => {
  const nodeLabel = node.labels()[0];
  const nodeId = event.identity();

  // get related nodes through raw cypher query
  return instance.cypher(
      'MATCH (n:' + nodeLabel + ')-[' + relationship + ']-(r) ' + 
      'WHERE ID(n)=' + nodeId + ' ' + 
      'RETURN r');
}

// Common utility functions
module.exports = {
  generateJWT, 
  userResponse, 
  userAuthResponse,
  eventResponse
}
