describe("luv.Graphics", function(){
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
    var el = document.createElement('canvas');
    var gr = new luv.Graphics(el, 10, 20);
    expect(gr.el).to.be.equal(el);
    expect(gr.width).to.be.equal(10);
    expect(gr.height).to.be.equal(20);
  });
});
