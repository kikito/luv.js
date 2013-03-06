describe("Luv.Media.Image", function() {
  var media;
  beforeEach(function(){ media = Luv.Media(); });

  it("exists", function(){
    expect(media.Image).to.be.ok;
  });

  it("has a special toString method", function() {
    media.onAssetError = sinon.stub();
    var image = media.Image('dummy.png');
    expect(image.toString()).to.equal('Luv.Media.Image("dummy.png")');
    expect("" + image).to.equal('Luv.Media.Image("dummy.png")');
  });
});
