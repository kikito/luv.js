describe("Luv.Media.Image", function() {
  var media;
  beforeEach(function(){ media = Luv.Media(); });

  it("exists", function(){
    expect(media.Image).to.be.ok;
  });

  it("invokes a custom callback when loaded", function(){
    var callback = sinon.spy();
    var image = media.Image(null, callback);
    trigger(image.source, 'load');
    expect(callback).to.have.been.calledWith(image);
    expect(image.isLoaded()).to.be.True;
  });

  it("invokes a custom callback when fails to load", function(){
    media.onAssetError = sinon.stub();
    var callback = sinon.spy();
    var image = media.Image(null, null, callback);
    trigger(image.source, 'error');
    expect(callback).to.have.been.calledWith(image);
    expect(media.onAssetError).to.have.been.calledWith(image);
    expect(image.isError()).to.be.True;
  });

  it("has a toString method", function() {
    media.onAssetError = sinon.stub();
    var image = media.Image('dummy.png');
    expect(image.toString()).to.equal('Luv.Media.Image("dummy.png")');
    expect("" + image).to.equal('Luv.Media.Image("dummy.png")');
  });
});
