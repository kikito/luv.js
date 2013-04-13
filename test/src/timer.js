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

    describe(".after", function() {
      var counter, count, add;
      beforeEach(function() {
        counter = 0;
        count = function()  { counter ++; };
        add   = function(x) { counter += x; };
      });

      it("does not execute a callback before its time has come", function() {
        timer.after(5, count);
        timer.update(2);
        expect(counter).to.equal(0);
      });

      it("executes the callback when its time comes", function() {
        timer.after(5, count);
        timer.update(5);
        expect(counter).to.equal(1);
      });

      it("executes the callback if the update comes late", function() {
        timer.after(5, count);

        timer.update(6);
        expect(counter).to.equal(1);
      });

      it("works even if the callback time is 0", function() {
        timer.after(0, add);
        timer.update(4);
        expect(counter).to.equal(4);
      });

      it("returns the extra time passed as the first callback parameter", function() {
        timer.after(5, add);
        timer.update(10);
        expect(counter).to.equal(5);
      });

      it("uses the third parameter as a ballback context if provided", function() {
        var player = {health: 5};
        timer.after(2, function(){this.health--;}, player);
        timer.update(3);
        expect(player.health).to.equal(4);
      });
    });
  });

});
