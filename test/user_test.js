process.env.NODE_ENV = 'test'

var should     = require('chai').should();
var expect     = require('chai').expect;
var request    = require('supertest');
var app        = require('../app');
var models     = require('../models');
var testConfig = require('../config/db').test;

const testUser = {
  username: 'TestUser',
  email: 'test_user@fakemail.com',
  password: 'my_pass_2345',
}

const jwtRegex = /[a-zA-Z0-9\-_]+\.[a-zA-Z0-9\-_]+\.[a-zA-Z0-9\-_]+/;

describe('User', () => {

  // Clear DB before each test
  beforeEach(done => {
    models.sequelize.sync({ force: true, match: /_test$/ })
      .then(() => { done() });
  });

  it('should return 401 with no token', done => {
    request(app)
      .get('/api/user')
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(401, done);
  });

  it('should register a new user', done => {
    request(app)
      .post('/api/user/register')
      .set('Accept', 'application/json')
      .send({user: testUser})
      .expect('Content-Type', /json/)
      .expect(200)
      .end((err, res) => {
        expect(res.body.user).to.have.property('id');
        expect(res.body.user).to.have.property('created_at');
        expect(res.body.user).to.have.property('updated_at');
        expect(res.body.user.username).to.equal(testUser.username);
        expect(res.body.user.email).to.equal(testUser.email);
        expect(res.body.user.token).to.match(jwtRegex);
        done();
      });
  });

  it('should login user with valid credentials', done => {
    // Create a test user, login with it
    models.User.create(testUser).then(user => {
      user.setPassword(testUser.password); // generate hash/salt
      return user.save();
    }).then(() => {
      request(app)
        .post('/api/user/login')
        .set('Accept', 'application/json')
        .send({user: testUser})
        .expect('Content-Type', /json/)
        .expect(200)
        .end((err, res) => {
          expect(res.body.user).to.have.property('id');
          expect(res.body.user).to.have.property('created_at');
          expect(res.body.user).to.have.property('updated_at');
          expect(res.body.user.username).to.equal(testUser.username);
          expect(res.body.user.email).to.equal(testUser.email);
          expect(res.body.user.token).to.match(jwtRegex);
          done();
        });
    });
  });
});