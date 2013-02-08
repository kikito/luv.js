describe("Luv.Timer", function(){

  it('exists', function() {
    expect(Luv.Timer).to.be.a('function');
  });

  describe(".methods", function(){
    var timer;

    beforeEach(function(){
      this.clock = sinon.useFakeTimers(0, "setTimeout", "clearTimeout", "Date");
      timer = new Luv.Timer();
    });

    afterEach(function() {
      this.clock.restore();
    });

    describe(".getMicroTime()", function() {
      it("returns the time passed, in milliseconds", function() {
        expect(timer.getMicroTime()).to.equal(0);

        timer.step(50);
        expect(timer.getMicroTime()).to.equal(50);

        timer.step(75);
        expect(timer.getMicroTime()).to.equal(75);

        timer.step(-10);
        expect(timer.getMicroTime()).to.equal(75);
      });
    });

    describe(".getTime()", function() {
      it("returns the time passed, in seconds", function() {
        expect(timer.getTime()).to.equal(0);

        timer.step(50);
        expect(timer.getTime()).to.equal(0.05);

        timer.step(75);
        expect(timer.getTime()).to.equal(0.075);

        timer.step(-10);
        expect(timer.getTime()).to.equal(0.075);
      });
    });

    describe(".getDeltaTime()", function() {
      it("returns the time passed between steps, in seconds", function() {
        expect(timer.getDeltaTime()).to.equal(0);

        timer.step(50);
        expect(timer.getDeltaTime()).to.equal(0.05);

        timer.step(75);
        expect(timer.getDeltaTime()).to.equal(0.025);

        timer.step(-10);
        expect(timer.getDeltaTime()).to.equal(0.025);
      });
    });
  });

});