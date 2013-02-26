/*
luv.js
======
A javascript/coffeescript html5 game library heavily inspired by [LÖVE](http://love2d.org).

Minimal example
===============

The minimal example requires one two files: `luv.js` and `index.html`. You can download luv.js directly from this repository. Here's a sample html:

    <!doctype html>
    <html>
    <head>
      <title>Basic luv.js example</title>
      <script src="luv.js"></script>
    </head>
    <body>
      <script>
        var luv = Luv();

        luv.draw = function() {
          luv.graphics.print("Hello, my luv", 200, 300);
        }

        luv.run();
      </script>
    </body>
    </html>

Development
===========

The original source is inside the `src` folder. It needs to be assembled into `luv.js` and `luv.min.js`. In order to do that:

1. Install [node.js](http://nodejs.org/)
2. Install grunt-cli: `npm install grunt-cli -g`
3. Install the project dependencies `cd /path/to/luv.js/folder && npm install`
4. Execute `grunt compile`

Tests
=====

There are some extra steps to be done if you want to run the tests:

1. Install all the previous packages (make sure that you are able to `grunt compile`)
2. Install [mocha-phantomjs](http://metaskills.net/mocha-phantomjs/): `npm install -g mocha-phantomjs`
3. Execute grunt: `grunt` (the default grunt task runs the tests)

*/