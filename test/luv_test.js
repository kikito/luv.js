var chai      = require("chai"),
    sinonChai = require("sinon-chai"),
    expect    = chai.expect,
    sinon     = require("sinon");
chai.use(sinonChai);

require("../luv.js");

describe("luv", function(){
  it("exists", function(){
    expect(luv).to.be.a('object');
  });
});
