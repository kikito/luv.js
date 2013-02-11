describe("Luv.Media.Image", function() {
  var media;
  beforeEach(function(){ media = new Luv.Media(); });

  it("exists", function(){
    expect(media.Image).to.be.a('function');
  });

  it("invokes a custom callback when loaded", function(){
    var callback = sinon.spy();
    var image = new media.Image(null, callback);
    trigger(image.source, 'load');
    expect(callback).to.have.been.calledWith(image);
    expect(image.isLoaded()).to.be.True;
  });

  it("invokes a custom callback when fails to load", function(){
    sinon.stub(media, 'onLoadError');
    var callback = sinon.spy();
    var image = new media.Image(null, null, callback);
    trigger(image.source, 'error');
    expect(callback).to.have.been.calledWith(image);
    expect(image.isError()).to.be.True;
  });
});

describe("Luv.Media.Resource", function() {
  var media;
  beforeEach(function(){ media = new Luv.Media(); });

  it("exists", function(){
    expect(Luv.Media.Resource).to.be.a('function');
  });

  it("invokes a custom callback when a resource is loaded", function(){
    var callback = sinon.spy();
    var resource = new Luv.Media.Resource(media, {}, callback);
    resource.registerLoad();
    expect(callback).to.have.been.calledWith(resource);
    expect(resource.isLoaded()).to.be.True;
  });

  it("invokes a custom callback when a resource fails to load", function(){
    sinon.stub(media, 'onLoadError');
    var callback = sinon.spy();
    var resource = new Luv.Media.Resource(media, {}, null, callback);
    resource.registerError();
    expect(callback).to.have.been.calledWith(resource);
    expect(resource.isError()).to.be.True;
  });
});

describe("Luv.Media", function(){
  var media;
  beforeEach(function(){ media = new Luv.Media(); });

  it("exists", function(){
    expect(Luv.Media).to.be.a('function');
  });

  describe(".onResourceLoaded(resource)", function(){
    it("is called when a new resource is loaded", function() {
      var onResourceLoaded = sinon.spy(media, 'onResourceLoaded');
      var resource = new Luv.Media.Resource(media, {});
      resource.registerLoad();
      expect(onResourceLoaded).to.have.been.calledWith(resource);
    });
  });

  describe(".onLoadError(resource)", function(){
    it("throws an error by default", function() {
      var peter = {toString: function(){return "Peter"; }};
      expect(function(){ media.onLoadError(peter); }).to.Throw(Error);
    });

    it("is called when a new resource fails to load", function() {
      var onLoadError = sinon.stub(media, 'onLoadError');
      var resource = new Luv.Media.Resource(media, {});
      resource.registerError();
      expect(onLoadError).to.have.been.calledWith(resource);
    });
  });

  describe(".onLoaded()", function(){
    it("is called when all resources are loaded", function() {
      var onLoaded = sinon.spy(media, 'onLoaded'),
          r1       = new Luv.Media.Resource(media, {}),
          r2       = new Luv.Media.Resource(media, {});
      r1.registerLoad();
      r2.registerLoad();

      expect(onLoaded).to.have.been.calledOnce;
    });
  });

  describe(".isLoaded()", function(){
    it("returns true when all pending resources are loaded", function() {
      expect(media.isLoaded()).to.equal(true);
      var r1       = new Luv.Media.Resource(media, {}),
          r2       = new Luv.Media.Resource(media, {});

      expect(media.isLoaded()).to.equal(false);

      r1.registerLoad();
      expect(media.isLoaded()).to.equal(false);

      r2.registerLoad();
      expect(media.isLoaded()).to.equal(true);
    });
  });

  describe(".getPending()", function(){
    it("is called when all ", function() {
      expect(media.getPending()).to.equal(0);
      var r1       = new Luv.Media.Resource(media, {}),
          r2       = new Luv.Media.Resource(media, {});

      expect(media.getPending()).to.equal(2);

      r1.registerLoad();
      expect(media.getPending()).to.equal(1);

      r2.registerLoad();
      expect(media.getPending()).to.equal(0);
    });
  });

});
