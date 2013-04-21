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

    describe("event methods", function() {
      var counter, count, sum, add;
      beforeEach(function() {
        counter = sum = 0;
        count = function()  { counter ++; };
        add   = function(x) { sum += x; };
      });

      describe(".after", function() {
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
          expect(sum).to.equal(4);
        });

        it("returns the extra time passed as the first callback parameter", function() {
          timer.after(5, add);
          timer.update(10);
          expect(sum).to.equal(5);
        });

        it("uses the third parameter as a callback context", function() {
          var player = {health: 5};
          timer.after(2, function(){this.health--;}, player);
          timer.update(3);
          expect(player.health).to.equal(4);
        });
      });

      describe(".every", function() {

        it("does not execute the callback before its time has come", function() {
          timer.every(5, count);
          timer.update(2);
          expect(counter).to.equal(0);
        });

        it("executes the callback when its time comes, several times as the time passes", function() {
          timer.every(3, count);
          timer.update(5); // 5
          expect(counter).to.equal(1);
          timer.update(1); // 6
          expect(counter).to.equal(2);
          timer.update(8); // 14
          expect(counter).to.equal(4);
        });

        it("passes the time differential as an extra parameter", function() {
          timer.every(3, add);
          timer.update(5); // 5
          expect(sum).to.equal(2);
          timer.update(1); // 6
          expect(sum).to.equal(2);
          timer.update(8); // 14
          expect(sum).to.equal(9);
        });

        it("uses the third parameter as a callback context", function() {
          var player = {health: 5};
          timer.every(1, function(){this.health--;}, player);
          timer.update(3);
          expect(player.health).to.equal(2);
        });

        it("works even if the callback time is 0", function() {
          timer.every(0, add);
          timer.every(0, count);
          timer.update(4);
          expect(sum).to.equal(4);
          expect(counter).to.equal(1);
        });
      });

      describe(".tween", function() {
        it("starts executing the tween right away", function() {
          var obj = {x: 0};
          timer.tween(5, obj, {x: 10});
          timer.update(2);
          expect(obj.x).to.equal(4);
        });
        it("uses the every callback when provided", function() {
          var obj = {x: 0};
          timer.tween(5, 0, 10, {every: function(x){obj.x = x;}});
          timer.update(2);
          expect(obj.x).to.equal(4);
        });
        it("invokes the after callback when provided", function() {
          var called = false;
          timer.tween(5, 0, 10, {after: function() { called = true; }});
          timer.update(6);
          expect(called).to.be.ok;
        });
      });

      describe("clear", function() {
        it("cancels after events before they happen", function() {
          var id = timer.after(5, count);
          timer.clear(id);

          timer.update(5);
          expect(counter).to.equal(0);
        });

        it("cancels every events", function() {
          var id = timer.every(1, count);
          timer.update(2);
          expect(counter).to.equal(2);

          timer.clear(id);

          timer.update(2);
          expect(counter).to.equal(2);
        });

        it("cancels tweens", function() {
          var obj = {x: 0};
          var id = timer.tween(5, obj, {x: 10});
          timer.update(2);
          expect(obj.x).to.equal(4);

          timer.clear(id);
          timer.update(2);
          expect(obj.x).to.equal(4);
        });
      });
    });
  });

});
