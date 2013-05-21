describe('Luv.Collider.BBox', function() {

  var BBox = Luv.Collider.BBox;

  it("exists", function() {
    expect(BBox).to.be.a('function');
  });

  describe('constructor', function() {
    it("initializes w,h,l,t,x,y,w2 & h2", function(){
      var b = BBox(10,20,100,200);

      expect([
        b.l, b.t, b.w, b.h, b.x, b.y, b.w2, b.h2
      ]).to.deep.equal([
        10,   20, 100, 200,  60,  120, 50, 100
      ]);
    });
  });

});
