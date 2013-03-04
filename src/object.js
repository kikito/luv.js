// # object.js
(function() {

// ## Luv.Object
// The base object that provides common functionality amongst all objects in Luv

Luv.Object = {
  getType : function() { return 'Luv.Object'; },
  toString: function() { return this.getType(); },
  include : function(properties) {
    for(var property in properties) {
      if(properties.hasOwnProperty(property)) {
        this[property] = properties[property];
      }
    }
    return this;
  },
  extend  : function(properties) {
    return Object.create(this).include(properties);
  }
};

}());
