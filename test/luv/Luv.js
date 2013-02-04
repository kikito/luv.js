describe("Luv", function(){
  it("exists", function(){
    expect(Luv).to.be.a('function');
  });
  describe("constructor options param", function() {
    describe("when it is empty", function() {
      it("does not throw errors", function() {
        expect(function(){new Luv(); }).to.not.Throw(Error);
      });

      it("creates a Luv instance with default attributes", function() {
        var luv = new Luv();
        expect(luv.graphics.el).to.be.ok;
        expect(luv.graphics.width).to.equal(800);
        expect(luv.graphics.height).to.equal(600);
        expect(luv.load).to.be.a('function');
        expect(luv.draw).to.be.a('function');
        expect(luv.update).to.be.a('function');
        expect(luv.run).to.be.a('function');
      });
    });
  });

  describe("Luv.run", function() {
    it("invokes luv callbacks as expected", function() {
      var luv = new Luv();
      var frame  = sinon.stub(window, 'requestAnimationFrame', function(f){ f(1); });
      var load   = sinon.spy(luv, 'load');
      var clear  = sinon.spy(luv.graphics, 'clear');
      var draw   = sinon.spy(luv, 'draw');
      var update = sinon.spy(luv, 'update');

      luv.run();

      expect(frame).to.have.been.called;
      expect(load).to.have.been.called;
      expect(clear).to.have.been.called;
      expect(draw).to.have.been.called;
      expect(update).to.have.been.calledWith(1);

      window.requestAnimationFrame.restore();
    });
  });
});
