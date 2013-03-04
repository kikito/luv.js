// # media/asset.js
(function() {

// ## Luv.Media.Asset
// This is the superclass of all media assets. It's not supposed to be instantiated, it's just a method holding object
Luv.Media.Asset = Luv.Object.extend({
  getType:   function() { return 'Luv.Media.Asset'; },
  isPending: function() { return this.status == "pending"; },
  isLoaded:  function() { return this.status == "loaded"; },
  isError:   function() { return this.status == "error"; }
});

}());
