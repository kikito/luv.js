luv.js
======
A javascript/coffeescript html5 game library heavily inspired by [LÖVE](http://love2d.org).

## Minimal example

The minimal example requires one two files: `luv.js` and `index.html`. You can download luv.js directly from this repository. Here's a sample html:

    <!doctype html>
    <html>
    <head>
      <meta charset="utf-8" />
      <title>Basic luv.js example</title>
      <script src="luv.js"></script>
    </head>
    <body>
      <script>
        var luv = Luv();

        luv.draw = function() {
          luv.graphics.print("Hello, my luv", 200, 300);
        };

        luv.run();
      </script>
    </body>
    </html>


## Found a bug? / Want to help?

If you have found a problem, or you want to help, the first place to go should be the
[issue tracker](https://github.com/kikito/luv.js/issues?). You can report new issues there,
as well as take responsibility of some of them (just comment on the issue and say "I'd like
to help with this issue").

If you want to send code to Luv.js, please see the CONTRIBUTING.md for more instructions.

## Documentation

* [Annotated source code](http://kikito.github.com/luv.js/docs/)






