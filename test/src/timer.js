describe("Luv.Timer", function(){

  it('exists', function() {
    expect(Luv.Timer).to.be.a('function');
  });

  describe(".methods", function(){
    var timer;

    beforeEach(function(){
      this.clock = sinon.useFakeTimers(0, "setTimeout", "clearTimeout", "Date");
      timer = Luv.Timer();
    });

    afterEach(function() {
      this.clock.restore();
    });

    describe("deltaTimeLimit", function() {
      it("has a getter and a setter, and defaults to 0.25", function() {
        expect(timer.getDeltaTimeLimit()).to.equal(0.25);

        timer.setDeltaTimeLimit(0.20);

        expect(timer.getDeltaTimeLimit()).to.equal(0.2);
      });
    });

    describe(".getDeltaTime()", function() {
      it("returns 0 by default", function() {
        expect(timer.getDeltaTime()).to.equal(0);
      });

      it("returns the time passed between steps, in seconds", function() {
        timer.update(0.005);
        expect(timer.getDeltaTime()).to.equal(0.005);
      });

      it("is limited by maxDeltaTime", function() {
        timer.update(5);
        expect(timer.getDeltaTime()).to.equal(0.25);
      });

      it("can not go back in time", function() {
        timer.update(-10);
        expect(timer.getDeltaTime()).to.equal(0);
      });
    });

    describe(".getFPS()", function() {
      it("returns 0 when no data is available", function() {
        expect(timer.getFPS()).to.equal(0);
      });

      it("returns the frames per second", function() {
        timer.update(0.050);
        expect(timer.getFPS()).to.equal(20);

        timer.update(0.025);
        expect(timer.getFPS()).to.equal(40);
      });

      it("returns 0 if the dt is made 0", function() {
        timer.update(0);
        expect(timer.getFPS()).to.equal(0);
      });
    });
  });

});
