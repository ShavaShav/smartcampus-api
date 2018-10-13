var should     = require('chai').should();
var expect     = require('chai').expect;
var request    = require('supertest');
var app        = require('../app');
var models     = require('../models');

const jwtRegex = /[a-zA-Z0-9\-_]+\.[a-zA-Z0-9\-_]+\.[a-zA-Z0-9\-_]+/;

describe('User', () => {

  it('should return 401 with no token', done => {
    request(app)
      .get('/api/user')
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(401, done);
  });

});