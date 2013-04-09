describe("Luv.Touch", function(){
  it("exists", function(){
    expect(Luv.Touch).to.be.a('function');
  });


  describe("methods", function(){
    var el, touch;
    beforeEach(function(){
      el    = document.createElement('canvas');
      touch = Luv.Touch(el);
    });

    describe('.onPressed', function(){
      it("gets called once when a single finger presses the screen", function() {
        var onPressed = sinon.spy(touch, 'onPressed');

        trigger(el, "touchstart", {changedTouches: [{identifier: 1, pageX: 10, pageY: 20}]});
        expect(onPressed).to.have.been.calledWith(1,10,20);
      });

      it("gets called twice when multiple fingers touch the screen", function() {
        var onPressed = sinon.spy(touch, 'onPressed');

        trigger(el, "touchstart", {changedTouches: [
                {identifier: 1, pageX: 10, pageY: 20},
                {identifier: 2, pageX: 30, pageY: 40}
        ]});
        expect(onPressed).to.have.been.calledWith(1,10,20);
        expect(onPressed).to.have.been.calledWith(2,30,40);
      });
    });

    describe('.onReleased', function(){
      it("gets called once when a finger leaves the screen", function() {
        var onReleased = sinon.spy(touch, 'onReleased');

        trigger(el, "touchend", {changedTouches: [{identifier: 1, pageX: 10, pageY: 20}]});
        expect(onReleased).to.have.been.calledWith(1,10,20);
      });

      it("gets called twice when multiple fingers leave the screen", function() {
        var onReleased = sinon.spy(touch, 'onReleased');

        trigger(el, "touchend", {changedTouches: [
                {identifier: 1, pageX: 10, pageY: 20},
                {identifier: 2, pageX: 30, pageY: 40}
        ]});
        expect(onReleased).to.have.been.calledWith(1,10,20);
        expect(onReleased).to.have.been.calledWith(2,30,40);
      });
    });

    describe('.isPressed', function() {
      it("returns true when a finger is pressed, false otherwise", function() {
        expect(touch.isPressed(1)).to.equal(false);

        trigger(el, "touchstart", {changedTouches: [{identifier: 1, pageX: 10, pageY: 20}]});
        expect(touch.isPressed(1)).to.equal(true);

        trigger(el, "touchend", {changedTouches: [{identifier: 1, pageX: 10, pageY: 20}]});
        expect(touch.isPressed(1)).to.equal(false);
      });
    });

  });
});
