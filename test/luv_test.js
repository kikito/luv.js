var chai      = require("chai");
var sinonChai = require("sinon-chai");
chai.use(sinonChai);
var expect    = chai.expect;
var sinon     = require("sinon");

require("../luv.js");

describe("luv", function(){
  it("exists", function(){
    expect(luv).to.be.a('object');
  });

  describe(".run", function(){
    it("exists", function() {
      expect(luv.run).to.be.a('function');
    });
    describe("options param", function() {
      describe("when it is empty", function() {
        it("does not throw errors", function() {
          expect(function(){ luv.run(); }).to.not.Throw(Error);
        });
        it("executes the load function if it is provided", function(){
          var load = sinon.spy();
          luv.run({load: load});
          expect(load).to.have.been.calledOnce;
        });
      });
    });
  });
});
