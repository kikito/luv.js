describe("Luv.Media.Image", function() {
  var media;
  beforeEach(function(){ media = Luv.Media(); });

  it("exists", function(){
    expect(media.Image).to.be.a('function');
  });

  it("invokes a custom callback when loaded", function(){
    var callback = sinon.spy();
    var image = media.Image(null, callback);
    trigger(image.source, 'load');
    expect(callback).to.have.been.calledWith(image);
    expect(image.isLoaded()).to.be.True;
  });

  it("invokes a custom callback when fails to load", function(){
    media.onLoadError = sinon.stub();
    var callback = sinon.spy();
    var image = media.Image(null, null, callback);
    trigger(image.source, 'error');
    expect(callback).to.have.been.calledWith(image);
    expect(media.onLoadError).to.have.been.calledWith(image);
    expect(image.isError()).to.be.True;
  });

  it("has a toString method", function() {
    media.onLoadError = sinon.stub();
    var image = media.Image('dummy.png');
    expect(image.toString()).to.equal('Luv.Media.Image("dummy.png")');
    expect("" + image).to.equal('Luv.Media.Image("dummy.png")');
  });
});

describe("Luv.Media", function(){
  var media;
  beforeEach(function(){
    media = Luv.Media();
    media.Asset = function(loadCallback,errorCallback) {
      var asset = {};
      media.newAsset(asset,loadCallback,errorCallback);
      return asset;
    };
  });

  it("exists", function(){
    expect(Luv.Media).to.be.a('function');
  });

  describe(".onAssetLoaded(asset)", function(){
    it("is called when a new asset is loaded", function() {
      var onAssetLoaded = sinon.spy(media, 'onAssetLoaded');
      var asset = media.Asset();
      media.registerLoad(asset);
      expect(onAssetLoaded).to.have.been.calledWith(asset);
    });
  });

  describe(".onLoadError(asset)", function(){
    it("throws an error by default", function() {
      var peter = {toString: function(){return "Peter"; }};
      expect(function(){ media.onLoadError(peter); }).to.Throw(Error);
    });

    it("is called when a new asset fails to load", function() {
      var onLoadError = sinon.stub(media, 'onLoadError');
      var asset = media.Asset();
      media.registerError(asset);
      expect(onLoadError).to.have.been.calledWith(asset);
    });
  });

  describe(".onLoaded()", function(){
    it("is called when all assets are loaded", function() {
      var onLoaded = sinon.spy(media, 'onLoaded'),
          r1       = media.Asset(),
          r2       = media.Asset();

      media.pending = 2;
      media.registerLoad(r1);
      media.registerLoad(r2);

      expect(onLoaded).to.have.been.calledOnce;
    });
  });

  describe(".isLoaded()", function(){
    it("returns true when all pending assets are loaded", function() {
      expect(media.isLoaded()).to.equal(true);
      var r1       = media.Asset(),
          r2       = media.Asset();

      expect(media.isLoaded()).to.equal(false);

      media.registerLoad(r1);
      expect(media.isLoaded()).to.equal(false);

      media.registerLoad(r2);
      expect(media.isLoaded()).to.equal(true);
    });
  });

  describe(".getPending()", function(){
    it("is called when all ", function() {
      expect(media.getPending()).to.equal(0);
      var r1       = media.Asset(),
          r2       = media.Asset();

      expect(media.getPending()).to.equal(2);

      media.registerLoad(r1);
      expect(media.getPending()).to.equal(1);

      media.registerLoad(r2);
      expect(media.getPending()).to.equal(0);
    });
  });

});
