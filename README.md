luv.js
======
A javascript/coffeescript html5 game library heavily inspired by [LÖVE](http://love2d.org).

Minimal example
===============

The minimal example requires one two files: `luv.js` and `index.html`. You can download luv.js directly from this repository. Here's a sample html:

``` html
<!doctype html>
<html>
<head>
  <title>Basic luv.js example</title>
  <script src="luv.js"></script>
</head>
<body>
  <script>
    var luv = new Luv();

    luv.draw = function() {
      luv.graphics.print("Hello, my luv", 200, 300);
    }

    luv.run();
  </script>
</body>
</html>
```
