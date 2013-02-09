describe("Luv.Mouse", function(){
  it("exists", function(){
    expect(Luv.Mouse).to.be.a('function');
  });
  describe("constructor", function(){
    it("expects an element and hooks mouse events on it", function() {
      var el = document.createElement('canvas');

      var mouse = new Luv.Mouse(el);

      expect(el.onmousemove).to.be.a('function');
      expect(el.onmousedown).to.be.a('function');
      expect(el.onmouseup).to.be.a('function');
    });
  });
});
