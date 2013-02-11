Luv.Media = function() {
  this.pending = 0;

  var media = this;

  media.Image = function(src, loadCallback, errorCallback) {
    var image = this,         // Luv image
        source = new Image(); // html image

    Luv.Media.Resource.call(this, media, source, loadCallback, errorCallback);

    source.addEventListener('load',  function() { image.registerLoad(); });
    source.addEventListener('error', function() { image.registerError(); });

    this.source.src = src;
  };
  media.Image.prototype = Luv.Media.Resource.prototype;

};

var media = Luv.Media.prototype;

media.isLoaded            = function() { return this.pending === 0; };
media.getPending          = function() { return this.pending; };
media.onResourceLoaded    = function(resource) {};
media.onLoadError         = function(resource) { throw new Error("Could not load " + resource); };
media.onLoaded            = function() {};

////

Luv.Media.Resource = function(media, source, loadCallback, errorCallback) {
  media.pending++;

  this.media          = media;
  this.source         = source;
  this.loadCallback   = loadCallback;
  this.errorCallback  = errorCallback;
  this.status         = "pending";
};

Luv.Media.Resource.prototype = {
  registerLoad: function() {
    this.media.pending--;
    this.status = "loaded";
    if(this.loadCallback) { this.loadCallback(this); }
    this.media.onResourceLoaded(this);
    if(this.media.isLoaded()) { this.media.onLoaded(); }
  },
  registerError: function(evt) {
    this.media.pending--;
    this.status = "error";
    if(this.errorCallback) { this.errorCallback(this); }
    this.media.onLoadError(this);
  },
  isPending: function() { return this.status == "pending"; },
  isLoaded:  function() { return this.status == "loaded"; },
  isError:   function() { return this.status == "error"; }
};
