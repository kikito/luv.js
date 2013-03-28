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


## Found a bug?

Please file it using the [issue tracker](https://github.com/kikito/luv.js/issues?)

## Want to help?

Head on to the [issue tracker](https://github.com/kikito/luv.js/issues?). If there's
an issue that picks your interest, add a comment there saying "I'm working on this one".

If you want to propose an enhancement, start by opening an issue.

### Dependencies & tools

The original source is inside the `src` folder. It needs to be assembled into `luv.js` and `luv.min.js`. In order to do that:

1. Install [node.js](http://nodejs.org/)
2. Install the top-level packages: `npm install grunt-cli mocha-phantomjs docco -g`
3. Install the project dependencies `cd /path/to/luv.js/folder && npm install`
4. Once done,
  1. `grunt` will build `luv.js` and execute the test suite
  2. `grunt compile` will just generate `luv.js` and `luv.min.js` from `src`, with no tests.
  3. `grunt docs` will generate the documentation.

### Contributing

1. Fork the project
2. Create a branch for the issue/feature you want to fix
3. Use concise git commits, for each important change you make
4. Add tests for the new features/fixes, and make sure they pass
5. When done, send a pull request.

More information:

* [How to Fork a repo](https://help.github.com/articles/fork-a-repo)
* [Using pull requests](https://help.github.com/articles/using-pull-requests)





