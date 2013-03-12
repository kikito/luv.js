describe("Luv.Graphics.Image", function() {
  var media, gr;
  beforeEach(function(){
    media = Luv.Media();
    gr    = Luv.Graphics(document.createElement('canvas'), media);
  });

  it("exists", function(){
    expect(gr.Image).to.be.ok;
  });

  it("has a special toString method", function() {
    media.onAssetError = sinon.stub();
    var image = gr.Image('dummy.png');
    expect(image.toString()).to.equal('Luv.Graphics.Image("dummy.png")');
    expect("" + image).to.equal('Luv.Graphics.Image("dummy.png")');
  });
});
