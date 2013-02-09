Luv.Media = function() {
  this.pending = 0;

  var media = this;

  this.Resource = function(source, callback) {
    var resource = this;
    media.pending++;

    source.onload = function() {
      media.pending--;
      if(callback) { callback(resource); }
      media.onResourceLoaded(resource);
      if(media.isLoaded()) { media.onLoaded(); }
    };
  };
};

var media = Luv.Media.prototype;

media.isLoaded         = function() { return this.pending === 0; };
media.getPending       = function() { return this.pending; };
media.onResourceLoaded = function(resource) {};
media.onLoaded         = function() {};
