var chai   = require("chai");
var expect = chai.expect;
require("../luv.js");

describe("hello luv", function(){
  it("exists", function(){
    expect(luv).to.be.a('object');
  });
});
