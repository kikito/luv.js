describe("Luv.Media", function(){
  var media;
  beforeEach(function(){
    media = Luv.Media();
    media.FakeAsset = function() {
      var asset = {};
      media.newAsset(asset);
      return asset;
    };
    this.clock = sinon.useFakeTimers(0, "setTimeout", "clearTimeout", "Date");
  });

  afterEach(function() {
    this.clock.restore();
  });

  it("exists", function(){
    expect(Luv.Media).to.be.a('function');
  });

  describe(".onAssetLoaded(asset)", function(){
    it("is called when a new asset is loaded", function() {
      var onAssetLoaded = sinon.spy(media, 'onAssetLoaded');
      var asset = media.FakeAsset();
      media.registerLoad(asset);
      expect(onAssetLoaded).to.have.been.calledWith(asset);
    });
  });

  describe(".onAssetError(asset)", function(){
    it("throws an error by default", function() {
      var peter = {toString: function(){return "Peter"; }};
      expect(function(){ media.onAssetError(peter); }).to.Throw(Error);
    });

    it("is called when a new asset fails to load", function() {
      var onAssetError = sinon.stub(media, 'onAssetError');
      var asset = media.FakeAsset();
      media.registerError(asset);
      expect(onAssetError).to.have.been.calledWith(asset);
    });
  });

  describe(".onLoaded()", function(){
    it("is called when all assets are loaded and 0.5s have passed", function() {
      var count = 0,
          r1       = media.FakeAsset(),
          r2       = media.FakeAsset();

      media.onLoaded = function() { count++; };
      media.pending = 2;
      media.registerLoad(r1);
      media.registerLoad(r2);

      expect(count).to.equal(0);

      this.clock.tick(500);

      expect(count).to.equal(1);
    });
  });

  describe(".isLoaded()", function(){
    it("returns true when all pending assets are loaded", function() {
      expect(media.isLoaded()).to.equal(true);
      var r1       = media.FakeAsset(),
          r2       = media.FakeAsset();

      expect(media.isLoaded()).to.equal(false);

      media.registerLoad(r1);
      expect(media.isLoaded()).to.equal(false);

      media.registerLoad(r2);
      expect(media.isLoaded()).to.equal(false);

      this.clock.tick(500);
      expect(media.isLoaded()).to.equal(true);
    });
  });

  describe(".getPending()", function(){
    it("is called when all ", function() {
      expect(media.getPending()).to.equal(0);
      var r1       = media.FakeAsset(),
          r2       = media.FakeAsset();

      expect(media.getPending()).to.equal(2);

      media.registerLoad(r1);
      expect(media.getPending()).to.equal(1);

      media.registerLoad(r2);
      expect(media.getPending()).to.equal(0);
    });
  });

});
