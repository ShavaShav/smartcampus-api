var models  = require('../../models');

var router = require('express').Router();
var passport = require('passport');
var auth = require('../auth');

// Get event feed
router.get('/', auth.optional, function(req, res, next) {

});

// Get event
router.get('/#', auth.optional, function(req, res, next){

});

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

// Delete event
router.delete('/#', auth.required, function(req, res, next){

});

module.exports = router;