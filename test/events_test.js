process.env.NODE_ENV = 'test'

var should     = require('chai').should();
var expect     = require('chai').expect;
var request    = require('supertest');
var app        = require('../app');
var models     = require('../models');
var testConfig = require('../config/db').test;

var token = null      // jwt for test user
var userId = null;    // id of test user
var eventId = null;   // id of test event
var eventTime = null; // timestamp for event

const testUser = {
  name: 'Test User',
  email: 'test_user@fakemail.com'
}

const testEvent = {
  title: 'Test Event',
  time: undefined, 
  location: 'Erie Hall',
  link: 'http://uwindsor.ca/',
  body: 'A super fun test event.',
  authorId: undefined
}

// Assertion wrapper for fields of the test event response
const assertTestEvent = (eventResponse) => {
  expect(eventResponse.id).to.equal(eventId);
  expect(eventResponse.title).to.equal(testEvent.title);
  expect(new Date(eventResponse.time).toLocaleString()).to.equal(eventTime.toLocaleString());
  expect(eventResponse.location).to.equal(testEvent.location);
  expect(eventResponse.link).to.equal(testEvent.link);
  expect(eventResponse.body).to.equal(testEvent.body);
  expect(eventResponse).to.have.property('author');
  expect(eventResponse.author.id).to.equal(userId);
  expect(eventResponse.author.name).to.equal(testUser.name);
  expect(eventResponse.author.email).to.equal(testUser.email);
}

describe('Events', () => {

  before(done => {
    // Clear DB
    models.sequelize.sync({ force: true, match: /_test$/ })
      .then(() => {
        // Create test user
        return models.User.create(testUser);
      }).then(user => {
        // Save user id and token
        userId = user.id;
        token = user.generateJWT();

        // Set test event time to tomorrow
        eventTime = new Date();
        eventTime.setDate(eventTime.getDate() + 1);
        testEvent.time = eventTime;

        // Create test event for user
        testEvent.authorId = user.id;
        return models.Event.create(testEvent);
      }).then(event => {
        // Save event id
        eventId = event.id;
        done();
      });
  });

    it('should return event', done => {
      request(app)
        .get('/api/events/' + eventId)
        .set('Accept', 'application/json')
        .expect('Content-Type', /json/)
        .expect(200)
        .end((err, res) => {
          assertTestEvent(res.body.event);
          done();
        });
    });

    it('should return list of events', done => {
      request(app)
        .get('/api/events')
        .set('Accept', 'application/json')
        .expect('Content-Type', /json/)
        .expect(200)
        .end((err, res) => {
          expect(res.body.events).to.be.an('array');
          expect(res.body.events).to.have.lengthOf(1);
          assertTestEvent(res.body.events[0]);
          done();
        }); 
    });

    it('should post a new event', done => {
      // Create a json request for event occuring a day from now
      const newEventTime = new Date();
      newEventTime.setDate(eventTime.getDate() + 1);
      const requestBody = {
        event: {
          title: 'Test Post Event',
          time: newEventTime,
          location: 'CAW',
          link: 'http://uwindsor.ca/',
          body: 'A superer fun test event.'
        }
      }

      request(app)
        .post('/api/events')
        .set('Accept', 'application/json')
        .set('Authorization', 'Bearer ' + token)
        .send(requestBody)
        .expect('Content-Type', /json/)
        .expect(200)
        .end((err, res) => {
          // Should get back event and author details
          expect(res.body.event).to.have.property('id');
          expect(res.body.event.title).to.equal(requestBody.event.title);
          expect(new Date(res.body.event.time).toLocaleString()).to.equal(requestBody.event.time.toLocaleString());
          expect(res.body.event.location).to.equal(requestBody.event.location);
          expect(res.body.event.link).to.equal(requestBody.event.link);
          expect(res.body.event.body).to.equal(requestBody.event.body);
          expect(res.body.event).to.have.property('author');
          expect(res.body.event.author.id).to.equal(userId);
          expect(res.body.event.author.name).to.equal(testUser.name);
          expect(res.body.event.author.email).to.equal(testUser.email);
          done();
        }); 
    });

    it('should delete an event', done => {
      request(app)
        .delete('/api/events/' + eventId)
        .set('Accept', 'application/json')
        .set('Authorization', 'Bearer ' + token)
        .expect('Content-Type', /json/)
        .expect(200)
        .end((err, res) => {
          expect(res.body.message).to.equal('Event deleted');
          done();
        }); 
    });
});