describe("Luv", function(){
  it("exists", function(){
    expect(Luv).to.be.a('function');
  });
  describe("constructor", function() {
    describe("when invoked with no params", function() {
      it("does not throw errors", function() {
        expect(function(){Luv(); }).to.not.Throw(Error);
      });

      it("creates a Luv instance with default attributes", function() {
        var luv = Luv();
        expect(luv.graphics.el).to.be.ok;
        expect(luv.graphics.width).to.equal(800);
        expect(luv.graphics.height).to.equal(600);

        expect(luv.load).to.be.a('function');
        expect(luv.draw).to.be.a('function');
        expect(luv.update).to.be.a('function');
        expect(luv.run).to.be.a('function');

        expect(luv.timer).to.be.ok;
        expect(luv.keyboard).to.be.ok;
        expect(luv.mouse).to.be.ok;
        expect(luv.media).to.be.ok;
      });
    });
  });

  describe("luv.run", function() {
    it("invokes the expected functions", function() {

      this.clock = sinon.useFakeTimers(0, "setTimeout", "clearTimeout", "Date");

      var luv = Luv();

      var load      = sinon.spy(luv,'load'),
          update    = sinon.spy(luv, 'update'),
          step      = sinon.spy(luv.timer, 'step'),
          clear     = sinon.spy(luv.graphics, 'clear'),
          draw      = sinon.spy(luv, 'draw');

      var counter = 0;
      var nextFrame = sinon.stub(luv.timer, 'nextFrame', function(f) {
        if(counter !== 0) { return; }
        counter = counter + 1;
        f(0);
      });

      luv.run();

      expect(step).to.have.been.called;
      expect(load).to.have.been.called;
      expect(update).to.have.been.called;
      expect(clear).to.have.been.called;
      expect(draw).to.have.been.called;
      expect(nextFrame).to.have.been.called;

      this.clock.restore();
    });
  });


});
