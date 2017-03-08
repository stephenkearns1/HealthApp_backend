var chai = require('chai'), 
chaiHttp = require('chai-http');
var server = require('../server.js');
var should = chai.should();
var user = require('./models/user.js');
chai.use(chaiHttp);

/* example 

    it('should add a SINGLE blob on /blobs POST', function(done) {
  chai.request(server)
    .post('/blobs')
    .send({'name': 'Java', 'lastName': 'Script'})
    .end(function(err, res){
      res.should.have.status(200);
      res.should.be.json;
      res.body.should.be.a('object');
      res.body.should.have.property('SUCCESS');
      res.body.SUCCESS.should.be.a('object');
      res.body.SUCCESS.should.have.property('name');
      res.body.SUCCESS.should.have.property('lastName');
      res.body.SUCCESS.should.have.property('_id');
      res.body.SUCCESS.name.should.equal('Java');
      res.body.SUCCESS.lastName.should.equal('Script');
      done();
    });
});


*/
describe('Login', function() {
    it('POST /api/auth/login should return invaild creds, if creds are invaild', function(done) {
      user = {username: 'mark', password: 'hi'};
      chai.request(server.app)
        .post('/api/auth/login')
        .send(user)
        .end(function(err, res){
          if(err)throw err;
          res.to.have.string('Invaild credintials');
          done();
        });
    });
});