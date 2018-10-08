var router         = require('express').Router();
var auth           = require('../auth');
var { Event, User} = require('../../models');
var utils          = require('../../utils');

// GET /events
// Get all events
router.get('/', auth.optional, function(req, res, next) {
  
  // Sorted by latest creation
  return Event.all({}, { createdAt: 'DESC' }).then(events => {
    // Stringify the event objects
    let eventBodies = [];
    events.forEach(event => {
      body = utils.eventResponse(event);
      eventBodies.push(body.event);
    })
    return res.json({events: eventBodies});
  });
});

// GET /events/#
// Get single event
router.get('/:id', auth.optional, function(req, res, next) {
  return Event.findById(req.params.id).then(event => {
    if (!event) {
      return res.status(404).json({error: "Event not found"});
    }
    // Return event with author json
    return res.json(utils.eventResponse(event));
  });
});

// POST /events
// Create event
router.post('/', auth.required, function(req, res, next){
  
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
  return User.findById(req.user.id).then(user => {
    // Store event in database
    return Event.create(newEvent).then(event => {
      // Form bi-directional relationship
      return event.relateTo(user, 'posted_by').then(rel => {
        // Since author(_start) isn't eagerly loaded yet, pass explicitly
        return res.json(utils.eventResponse(rel._end, rel._start));
      });
    });
  }).catch(next);
});

// DEL /events/#
// Delete event
router.delete('/:id', auth.required, function(req, res, next){
  // Check if event belongs to user. Delete if so
  return Event.findById(req.params.id).then(event => {
    if (!event) {
      return res.status(404).json({error: "Event not found"});
    }

    const author = event.get('posted_by');

    if (JSON.stringify(author.identity()) === JSON.stringify(req.user.id)) {
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

module.exports = router;