var chai      = require("chai"),
    sinonChai = require("sinon-chai"),
    expect    = chai.expect,
    sinon     = require("sinon"),
    Browser   = require("zombie");

chai.use(sinonChai);

require("../../luv.js");

document = null;
el       = null;

describe("luv.Graphics", function(){
  before(function(done){
    var browser = new Browser();
    browser
      .visit("../pages/empty.html")
      .then(function() {
        document = browser.document;
        el       = document.createElement('canvas');
      })
      .then(done,done);
  });
  after(function(){
    el       = null;
    document = null;
  });

  it("exists", function(){
    expect(luv.Graphics).to.be.a('function');
  });
  it("initializes parameters", function(){
    var gr = new luv.Graphics();
    expect(gr.el).to.be.ok;
    expect(gr.width).to.be.equal(800);
    expect(gr.height).to.be.equal(600);
  });
  it("accepts an dom element, a width and a height", function() {
    var gr = new luv.Graphics(el, 10, 20);
    expect(gr.el).to.be.equal(el);
    expect(gr.width).to.be.equal(10);
    expect(gr.height).to.be.equal(20);
  });
});
