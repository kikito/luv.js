var chai   = require("chai");
var expect = chai.expect;
require("../../luv.js");
var graphics = luv.graphics;

describe("luv.graphics", function(){
  it("exists", function(){
    expect(graphics).to.be.a('object');
  });
});
