var router         = require('express').Router();
var auth           = require('../auth');
var { Neode, Event, User, Comment} = require('../../models');
var utils          = require('../../utils');

// GET /events
// Get all events
router.get('/', auth.optional, function(req, res, next) {
  const userId = req.user ? req.user.id : undefined; // auth is optional

  // Sorted by latest creation
  return Event.all({}, { createdAt: 'DESC' }).then(events => {
    // Stringify the event objects
    let eventBodies = [];
    events.forEach(event => {
      body = utils.eventResponse(event, userId);
      eventBodies.push(body.event);
    })
    return res.json({events: eventBodies});
  });
});

// GET /events/#
// Get single event
router.get('/:id', auth.optional, function(req, res, next) {
  const userId = req.user ? req.user.id : undefined; // auth is optional

  return Event.findById(req.params.id).then(event => {
    if (!event) {
      return res.status(404).json({error: "Event not found"});
    }
    // Return event with author json
    return res.json(utils.eventResponse(event, userId));
  });
});

// POST /events
// Create event
router.post('/', auth.required, function(req, res, next){
  const userId = req.user.id;

  // Check for required fields.
  if(!req.body.event.title){
    return res.status(422).json({errors: {title: "can't be blank"}});
  }

  if(!req.body.event.time){
    return res.status(422).json({errors: {time: "can't be blank"}});
  }

  if(!req.body.event.body){
    return res.status(422).json({errors: {body: "can't be blank"}});
  }


  // Build base event. Convert times to ISO format for db
  const time = new Date(req.body.event.time).toLocaleString();
  const now = new Date().toLocaleString();

  var newEvent = {
    title: req.body.event.title,
    time: time,
    body: req.body.event.body,
    createdAt: now,
    updatedAt: now
  }

  // Add optional fields
  if (!!req.body.event.location) {
    newEvent.location = req.body.event.location;
  }

  if (!!req.body.event.link) {
    newEvent.link = req.body.event.link;
  }

  // Get user
  return User.findById(userId).then(user => {
    // Store event in database
    return Event.create(newEvent).then(event => {
      // Form relationship
      return event.relateTo(user, 'posted_by');
    });
  }).then(rel => {
    // Reload the event node to get the updated event w/ author 
    // TODO: Find way to eagerload into `rel`?
    return Event.findById(rel._end.identity());
  }).then(event => {
    return res.json(utils.eventResponse(event, userId));
  }).catch(next);
});

// DEL /events/#
// Delete event
router.delete('/:id', auth.required, function(req, res, next){
  const userId = req.user.id;
  const eventId = req.params.id;
 
  // Check if event belongs to user. Delete if so
  return Event.findById(eventId).then(event => {
    if (!event) {
      return res.status(404).json({error: "Event not found"});
    }

    const author = event.get('posted_by');

    if (utils.sameIdentity(author.identity(), userId)) {
      event.delete().then(() => {
        return res.json({message: "Event deleted"});
      }).catch(err => {
        return res.status(500).json({error: "Failed to delete event. Try again."});
      });
    } else {
      return res.status(401).json({error: "Failed to delete event. Unauthorized."})
    }
  })
});

// PUT /events/#/like
// Adds a like relationship
router.put('/:id/like', auth.required, function(req, res, next){
  const userId = req.user.id;
  const eventId = req.params.id;
  
  // Get user
  return User.findById(userId).then(user => {
    // Get event
    return Event.findById(eventId).then(event => {
      // Form the like relation
      return user.relateTo(event, 'likes');
    });
  }).then(rel => {
    // Reload the event node to get most updated like count. TODO: Find way to eagerload into `rel`?
    return Event.findById(eventId);
  }).then(event => {
    return res.json(utils.eventResponse(event, userId));
  }).catch(next);
});

// DELETE /events/#/like
// Removes a like relationship
router.delete('/:id/like', auth.required, function(req, res, next){
  const userId = req.user.id;
  const eventId = req.params.id;
  // Get user
  return User.findById(userId).then(user => {
    // Get event
    return Event.findById(eventId).then(event => {
      return Neode.removeRelation(user, event, 'LIKES');
    });
  }).then(() => {
    // Reload the event node to get most updated like count. TODO: Find way to load from deletion?
    return Event.findById(eventId);
  }).then(event => {
    return res.json(utils.eventResponse(event, userId));
  }).catch(next);
});

// PUT /events/#/attend
// Adds an attending relationship
router.put('/:id/attend', auth.required, function(req, res, next){
  const userId = req.user.id;
  const eventId = req.params.id;
  
  // Get user
  return User.findById(userId).then(user => {
    // Get event
    return Event.findById(eventId).then(event => {
      // Form the attending relation
      return user.relateTo(event, 'attending');
    });
  }).then(rel => {
    // Reload the event node to get most updated attendees. TODO: Find way to eagerload into `rel`?
    return Event.findById(eventId);
  }).then(event => {
    return res.json(utils.eventResponse(event, userId));
  }).catch(next);
});

// DELETE /events/#/attend
// Removes an attending relationship
router.delete('/:id/attend', auth.required, function(req, res, next){
  const userId = req.user.id;
  const eventId = req.params.id;
  // Get user
  return User.findById(userId).then(user => {
    // Get event
    return Event.findById(eventId).then(event => {
      return Neode.removeRelation(user, event, 'ATTENDING');
    });
  }).then(() => {
    // Reload the event node to get most updated like count. TODO: Find way to load from deletion?
    return Event.findById(eventId);
  }).then(event => {
    return res.json(utils.eventResponse(event, userId));
  }).catch(next);
});

// POST /events/#/comment
// Creates a comment
router.post('/:id/comment', auth.required, function(req, res, next){
  const userId = req.user.id;
  const eventId = req.params.id;
  const now = new Date().toLocaleString();
  
  // Validate comment body is present
  if(!req.body.comment.body){
    return res.status(422).json({errors: {body: "can't be blank"}});
  }

  var newComment = {
    body: req.body.comment.body,
    createdAt: now,
    updatedAt: now
  };
  //Get user
  return User.findById(userId).then(user => {
    //Get event
    return Event.findById(eventId).then(event => {
      // Create comment
      return Comment.create(newComment).then(comment => {
        return Promise.all([
          // Add relationships
          comment.relateTo(event, 'commented_on'),
          comment.relateTo(user, 'comment_by')
        ]);
      })
    })
  }).then(rel => {
    // Reload comment
    return Comment.findById(rel[0]._end.identity());
  }).then(comment => {
    return res.json(utils.commentResponse(comment));
  }).catch(next);
});

module.exports = router;