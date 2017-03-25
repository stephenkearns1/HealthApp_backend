var chai = require('chai'), 
chaiHttp = require('chai-http');
var server = require('../server.js');
var should = chai.should;
var expect = chai.expect;
var user = require('./models/user.js');
chai.use(chaiHttp);

describe('Register endpoint', function() {
    it('POST /register - should return 200 status, if server running and correct request made to endpoint', function(done) {
      user = {username: 'mark', password: 'hi'};
      chai.request(server.app)
        .post('/register')
        .send(user)
        .end(function(err, res){
          if(err)throw err;
           expect(err).to.be.null;
           expect(res).to.have.status(200);
           done();
      
        });
    });
});

describe('Register endpoint', function() {
    it('POST /register - should return invalid username, if username length is less than 3', function(done) {
      user.username="ab";
      user.password= 'superhayez';
      user.firstname= 'paul';
      user.secondname= 'hayes';
      user.email= 'paulhayez@gmail.com';
      user.goal= 'Get fit';
      user.age= '34';
      user.medicalCondition= 'noone'; 
      user.level= '10';
      chai.request(server.app)
        .post('/register')
        .send(user)
        .end(function(err, res){
          if(err)throw err;
           expect(err).to.be.null;
           expect(res.text).to.equal('Invaild username');
           done();
      
        });
    });
});


describe('Register endpoint', function() {
    it('POST /register - should return invalid password, if password length is less than 8', function(done) {
      user.username ="seanautomationtest";
      user.password = 'p';
      user.firstname = 'paul';
      user.secondname= 'hayes';
      user.email= 'paulhayez@gmail.com';
      user.goal= 'Get fit';
      user.age= '34';
      user.medicalCondition= 'noone'; 
      user.level= '10';
      chai.request(server.app)
        .post('/register')
        .send(user)
        .end(function(err, res){
          if(err)throw err;
           expect(err).to.be.null;
           expect(res.text).to.equal('Invaild password');
           done();
      
        });
    });
});


describe('Register endpoint', function() {
    it('POST /register - should return Already taken, if username already exists', function(done) {
      user.username ="seanautomationtest";
      user.password = 'password';
      user.firstname = 'hayes';
      user.secondname= 'hayes';
      user.email= 'paulhayez@gmail.com';
      user.goal= 'Get fit';
      user.age= '34';
      user.medicalCondition= 'noone'; 
      user.level= '10';
      chai.request(server.app)
        .post('/register')
        .send(user)
        .end(function(err, res){
          if(err)throw err;
           expect(err).to.be.null;
           expect(res.text).to.equal('Already taken');
           done();
      
        });
    });
});


describe('Register endpoint', function() {
    it('POST /register - should return success, if registeration was successful', function(done) {
      var unqiueId = Math.floor((Math.random() * 10000000000) + 1);
      user.username ="seanautomationtest"+ unqiueId;
      user.password = 'password';
      user.firstname = 'paul';
      user.secondname= 'hayes';
      user.email= 'paulhayez@gmail.com';
      user.goal= 'Get fit';
      user.age= '34';
      user.medicalCondition= 'noone'; 
      user.level= '10';
      chai.request(server.app)
        .post('/register')
        .send(user)
        .end(function(err, res){
          if(err)throw err;
           expect(err).to.be.null;
           expect(res.text).to.equal('success');
           done();
      
        });
    });
});