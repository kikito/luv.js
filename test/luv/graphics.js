describe("Luv.Graphics", function(){
  it("exists", function(){
    expect(Luv.Graphics).to.be.a('function');
  });

  describe("constructor", function() {
    it("initializes parameters", function(){
      var gr = new Luv.Graphics();
      expect(gr.el).to.be.ok;
      expect(gr.width).to.be.equal(800);
      expect(gr.height).to.be.equal(600);
    });

    it("accepts an dom element, a width and a height", function() {
      var el = document.createElement('canvas');
      var setAttribute = sinon.spy(el, 'setAttribute');
      var getContext   = sinon.spy(el, 'getContext');

      var gr = new Luv.Graphics(el, 10, 20);
      expect(gr.el).to.be.equal(el);
      expect(setAttribute).to.have.been.calledWith('width', 10);
      expect(setAttribute).to.have.been.calledWith('height', 20);
      expect(getContext).to.have.been.calledWith('2d');

      expect(gr.ctx).to.be.ok;
      expect(gr.width).to.be.equal(10);
      expect(gr.height).to.be.equal(20);
    });
  });

  describe(".print", function() {
    it("prints using the context", function() {
      var gr       = new Luv.Graphics();
      var fillText = sinon.spy(gr.ctx, 'fillText');

      gr.print("hello, luv", 100, 200);
      expect(fillText).to.have.been.calledWith('hello, luv', 100, 200);
    });
  });

});
