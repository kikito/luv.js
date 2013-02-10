Luv.Media = function() {
  this.pending = 0;

  var media = this;

  this.Resource = function(source, callback) {
    var resource = this;
    media.pending++;

    source.addEventListener("load", function() {
      media.pending--;
      if(callback) { callback(resource); }
      media.onResourceLoaded(resource);
      if(media.isLoaded()) { media.onLoaded(); }
    });

    source.addEventListener("error", function(evt) {
      media.pending--;
      media.onLoadError(resource, evt);
    });
  };
};

var media = Luv.Media.prototype;

media.isLoaded            = function() { return this.pending === 0; };
media.getPending          = function() { return this.pending; };
media.onResourceLoaded    = function(resource) {};
media.onLoadError         = function(resource) { throw new Error("Could not load " + resource); };
media.onLoaded            = function() {};
