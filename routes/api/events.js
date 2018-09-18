var router   = require('express').Router();
var passport = require('passport');
var auth     = require('../auth');
var models   = require('../../models');

// GET /events
// Get all events
router.get('/', auth.optional, function(req, res, next) {
  models.Event.findAll({
    include: ['author'],
    order: [ ['createdAt', 'DESC'] ] // newly created events first
  }).then(events => {
    return res.json({events: events});
  });
});

// GET /events/#
// Get single event
router.get('/:id', auth.optional, function(req, res, next) {
  models.Event.findById(req.params.id, {include: ['author']}).then(event => {
    if (!event) {
      return res.status(404).json({error: "Event not found"});
    }

    return res.json({event: event});
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

  // Build base event
  var newEvent = {
    authorId: req.user.id,
    title: req.body.event.title,
    time: req.body.event.time,
    body: req.body.event.body
  }

  // Add optional fields
  if (!!req.body.event.location) {
    newEvent.location = req.body.event.location;
  }

  if (!!req.body.event.link) {
    newEvent.link = req.body.event.link;
  }

  // Store in database
  models.Event.create(newEvent).then(event => {
    // eager loading author doesn't work on creation, so reload
    event.reload({include: ['author']}).then(reloadedEvent => {
      return res.json({event: reloadedEvent.toJSON()});
    })
  }).catch(next);
});

// DEL /events/#
// Delete event
router.delete('/:id', auth.required, function(req, res, next){
  // Check if event belongs to user
  models.Event.findById(req.params.id).then(event => {
    if (!event) {
      return res.status(404).json({error: "Event not found"});
    }

    if (event.authorId === req.user.id) {
      event.destroy().then(() => {
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