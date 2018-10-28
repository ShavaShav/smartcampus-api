var jwt = require('jsonwebtoken');

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
  // Get eagerly loaded comments
  const comments = event.get('has_comment');
 

  // Append the author's JSON response to event body (as 'author')
  body.author = userResponse(author).user;

  // Append all the comments
  let commentBody = [];
  comments.forEach(element => {
    commentBody.push(commentResponse(element).comment);
  });
  
  body.comments = commentBody;

  return {
    event: body
  }
}

const commentResponse = (comment) => {
  let body = comment.properties();
  // Return string rep of ID for frontend. TODO: use a slug for id
  body.id = comment.identity().toString();

  // Get eagerly loaded author through relation
  const author = comment.get('comment_by');

  // Append the author's JSON response to event body (as 'author')
  body.author = userResponse(author).user;

  return {
    comment: body
  }
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
  commentResponse,
  sameIdentity
}
