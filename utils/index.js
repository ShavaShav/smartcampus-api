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

/**
 * Builds the event object to return to the front end
 * @param {Neode} event   // Event to create a JSON for
 * @param {String} userId // Current user id (can be null)
 */
const eventResponse = (event, userId = undefined) => {
  let body = event.properties();
  // Return string rep of ID for frontend. TODO: use a slug for id
  body.id = event.identity().toString();

  // Add number of likes
  const likeNodes = event.get('liked_by');
  body.likes = likeNodes.length;
  body.liked = false;

  // Determine if user likes
  // TODO: Let client figure it out, or query db again?
  if (userId !== undefined) {
    if (likeNodes._values.find(likeNode => sameIdentity(likeNode.identity(), userId))) {
      body.liked = true;
    }
  }

  // Get eagerly loaded author through relation
  const author = event.get('posted_by');

  // Append the author's JSON response to event body (as 'author')
  body.author = userResponse(author).user;

  return {
    event: body
  }
}

// Counts the number of a given relation to a given node 
// WARNING: Bi-directional counts as 2 relations
// ex. countRelations(Event node, 'LIKES') returns number of likes
const countRelations = (node, relationship) => {
  const nodeLabel = node.labels()[0];
  const nodeId = node.identity();

  // get related nodes through raw cypher query
  return instance.cypher(
      'MATCH (n:' + nodeLabel + ')-[' + relationship + ']-(r) ' + 
      'WHERE ID(n)=' + nodeId + ' ' + 
      'RETURN COUNT(r)');
}

// Gets all node related through relationship label.
const getRelatedNodes = (node, relationship) => {
  const nodeLabel = node.labels()[0];
  const nodeId = node.identity();

  // get related nodes through raw cypher query
  return instance.cypher(
      'MATCH (n:' + nodeLabel + ')-[' + relationship + ']-(r) ' + 
      'WHERE ID(n)=' + nodeId + ' ' + 
      'RETURN r');
}

/**
 * Removes the relation between two nodes
 * @param {Neode object} node 
 * @param {Neode object} otherNode 
 * @param {Name of edge} relationship 
 */
const removeRelation = (node, otherNode, relationship) => {
  const nodeLabel = node.labels()[0];
  const nodeId = node.identity();

  const otherNodeLabel = otherNode.labels()[0];
  const otherNodeId = otherNode.identity();
  return instance.cypher(
    'MATCH (n:' + nodeLabel + ')-[r:' + relationship + ']-(o:' + otherNodeLabel + ') ' + 
    'WHERE ID(n)=' + nodeId + ' AND ID(o)=' + otherNodeId + ' ' +
    'DELETE r'
  );
}

// Compares Neo4J loseless integer ids. Works for string versions as well
const sameIdentity = (firstIdentity, secondIdentity) => {
  return JSON.stringify(firstIdentity) === JSON.stringify(secondIdentity)
}

// Common utility functions
module.exports = {
  generateJWT, 
  userResponse, 
  userAuthResponse,
  eventResponse,
  countRelations,
  getRelatedNodes,
  removeRelation,
  sameIdentity
}
