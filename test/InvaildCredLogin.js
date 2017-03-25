var chai = require('chai'), 
    chaiHttp = require('chai-http');
var server = require('../server.js');
var should = chai.should;
var expect = chai.expect;
var user = require('./models/user.js');
chai.use(chaiHttp);

describe('Login endpoint should return 200 status', function() {
    it('POST /api/auth/login should return invaild creds, if creds are invaild', function(done) {
      user = {username: 'mark', password: 'hi'};
      chai.request(server.app)
        .post('/api/auth/login')
        .send(user)
        .end(function(err, res){
          if(err)throw err;
           expect(err).to.be.null;
           expect(res).to.have.status(200);
           done();
      
        });
    });
});

describe('If user does not exist, they cant sign in', function() {
    it('POST /api/auth/login should return invaild creds, if creds are invaild', function(done) {
      user = {username: 'blue', password: 'password1'};
      chai.request(server.app)
        .post('/api/auth/login')
        .send(user)
        .end(function(err, res){
          if(err)throw err;
           expect(err).to.be.null;
           expect(res.text).to.equal('user does not exist');
           done();
      
        });
    });
});


describe('Invaild password', function() {
    it('POST /api/auth/login should return invaild creds, if creds are invaild', function(done) {
      user = {username: 'test1', password: 'wrongpassword'};
      chai.request(server.app)
        .post('/api/auth/login')
        .send(user)
        .end(function(err, res){
          if(err)throw err;
           expect(err).to.be.null;
           expect(res.text).to.equal('Invalid password');
           done();
      
        });
    });
});

describe('sucessfully logged in', function() {
    it('POST /api/auth/login should return, jsonwebtoken if login is successful', function(done) {
      user.username ="test1";
      user.password = 'password1';
      chai.request(server.app)
        .post('/api/auth/login')
        .send(user)
        .end(function(err, res){
          if(err)throw err;
           expect(err).to.be.null;
           expect(res.text).to.be.jsonwebtoken;
           done();
      
        });
    });
});