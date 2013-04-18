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
                {identifier: 1, pageX: 10, pageY: 20},
                {identifier: 2, pageX: 30, pageY: 40}
        ]});
        expect(onPressed).to.have.been.calledWith(1,10,20);
        expect(onPressed).to.have.been.calledWith(2,30,40);
      });
    });
  });
});
