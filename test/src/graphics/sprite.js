describe("Luv.Graphics.Sprite", function() {
  var media, gr;
  beforeEach(function(){
    media = Luv.Media();
    gr    = Luv.Graphics(document.createElement('canvas'), media);
  });

  it("exists", function(){
    expect(gr.Sprite).to.be.ok;
  });

  it("has a special toString method", function() {
    media.onAssetError = sinon.stub();
    var image = gr.Image('dummy.png');
    var sprite = gr.Sprite(image, 10,20,30,40);
    expect(sprite.toString()).to.equal('instance of Luv.Graphics.Sprite(instance of Luv.Graphics.Image("dummy.png"), 10, 20, 30, 40)');
  });

});
