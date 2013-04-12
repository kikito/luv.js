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

        trigger(el, "touchstart", {targetTouches: [{identifier: 1, pageX: 10, pageY: 20}]});
        expect(onPressed).to.have.been.calledWith(1,10,20);
      });

      it("gets called twice when multiple fingers touch the screen", function() {
        var onPressed = sinon.spy(touch, 'onPressed');

        trigger(el, "touchstart", {targetTouches: [
                {identifier: 1, pageX: 10, pageY: 20, radius: 1, force: 2},
                {identifier: 2, pageX: 30, pageY: 40, radius: 3, force: 4}
        ]});
        expect(onPressed).to.have.been.calledWith(1,10,20,1,2);
        expect(onPressed).to.have.been.calledWith(2,30,40,3,4);
      });
    });

    describe('.isPressed', function() {
      it("returns true when a finger is pressed, false otherwise", function() {
        expect(touch.isPressed(1)).to.equal(false);

        trigger(el, "touchstart", {targetTouches: [{identifier: 1, pageX: 10, pageY: 20}]});
        expect(touch.isPressed(1)).to.equal(true);

        trigger(el, "touchend", {targetTouches: [{identifier: 1, pageX: 10, pageY: 20}]});
        expect(touch.isPressed(1)).to.equal(false);
      });
    });

  });
});
