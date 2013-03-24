describe("Luv.Graphics.SpriteSheet", function() {
  var media, gr;
  beforeEach(function(){
    media = Luv.Media();
    gr    = Luv.Graphics(document.createElement('canvas'), media);
  });

  it("exists", function(){
    expect(gr.SpriteSheet).to.be.ok;
  });

  describe("constructor", function() {
    it("sets the spritesheets attributes", function(){
      var img = {};
      var sheet = gr.SpriteSheet(img, 10,20,30,40,50);
      expect([10,20,30,40,50]).to.deep.equal([
        sheet.width, sheet.height, sheet.left, sheet.top, sheet.border
      ]);
    });
    it("defaults width, height and border to 0", function(){
      var img = {};
      var sheet = gr.SpriteSheet(img, 10,20);
      expect([10,20,0,0,0]).to.deep.equal([
        sheet.width, sheet.height, sheet.left, sheet.top, sheet.border
      ]);
    });
  });

  describe("getSprites", function() {
    var img, sheet;
    beforeEach(function() {
      var img = {};
    });
    describe("when given several numbers", function(){
      it("returns sprites given two numbers", function() {
        var sheet = gr.SpriteSheet(img, 16,16);
        var arr = sheet.getSprites(0,0,1,1);
        expect(arr[0].getBoundingBox()).to.deep.equal({
          left: 0, top: 0, width: 16, height: 16
        });
        expect(arr[1].getBoundingBox()).to.deep.equal({
          left: 16, top: 16, width: 16, height: 16
        });
      });

      it("takes border into account", function() {
        var sheet = gr.SpriteSheet(img, 16,16,0,0,1);
        var arr = sheet.getSprites(0,0,1,1);
        expect(arr[0].getBoundingBox()).to.deep.equal({
          left: 1, top: 1, width: 16, height: 16
        });
        expect(arr[1].getBoundingBox()).to.deep.equal({
          left: 18, top: 18, width: 16, height: 16
        });
      });

      it("takes left and top into account", function() {
        var sheet = gr.SpriteSheet(img, 16,16,10,5);
        var arr = sheet.getSprites(0,0,1,1);
        expect(arr[0].getBoundingBox()).to.deep.equal({
          left: 10, top: 5, width: 16, height: 16
        });
        expect(arr[1].getBoundingBox()).to.deep.equal({
          left: 26, top: 21, width: 16, height: 16
        });
      });
    });
  });

});
