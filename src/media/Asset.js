// # media/asset.js
(function() {

// ## Luv.Media.Asset
// This just a method holding object, to be extended by specialized assets
// like Image or Sound
Luv.Media.Asset = {
  getType:   function() { return 'Luv.Media.Asset'; },
  isPending: function() { return this.status == "pending"; },
  isLoaded:  function() { return this.status == "loaded"; },
  isError:   function() { return this.status == "error"; }
};

}());
