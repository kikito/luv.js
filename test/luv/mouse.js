describe("Luv.Mouse", function(){
  it("exists", function(){
    expect(Luv.Mouse).to.be.a('function');
  });


  describe("methods", function(){
    var el, mouse;
    beforeEach(function(){
      el    = document.createElement('canvas');
      mouse = Luv.Mouse(el);
    });

    describe(".getPosition()", function() {
      it("starts on 0,0", function() {
        expect(mouse.getPosition()).to.deep.equal({x:0, y:0});
      });

      it("moves with the mouse", function() {
        trigger(el, "mousemove", {pageX:10, pageY:20});
        expect(mouse.getPosition()).to.deep.equal({x:10, y:20});
      });
    });

    describe('.onPressed', function(){
      it("gets called when a mouse button is pressed", function() {
        var onPressed = sinon.spy(mouse, 'onPressed');

        trigger(el, "mousedown", {which: 1});
        expect(onPressed).to.have.been.calledWith(0,0,'l');

        trigger(el, "mousedown", {which: 2});
        expect(onPressed).to.have.been.calledWith(0,0,'m');
      });
    });

    describe('.onReleased', function(){
      it("gets called when a mouse button is pressed", function() {
        var onReleased = sinon.spy(mouse, 'onReleased');

        trigger(el, "mouseup", {which: 1});
        expect(onReleased).to.have.been.calledWith(0,0,'l');

        trigger(el, "mouseup", {which: 2});
        expect(onReleased).to.have.been.calledWith(0,0,'m');
      });
    });
  });
});
