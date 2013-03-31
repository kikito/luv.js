# Contributing

## Dependencies & tools

The original source is inside the `src` folder. It needs to be assembled into `luv.js` and `luv.min.js`. In order to do that:

1. Install [node.js](http://nodejs.org/)
2. Install the top-level packages: `npm install grunt-cli mocha-phantomjs docco -g`
3. Install the project dependencies `cd /path/to/luv.js/folder && npm install`
4. Once done,
  1. `grunt` will build `luv.js` and execute the test suite
  2. `grunt compile` will just generate `luv.js` and `luv.min.js` from `src`, with no tests.
  3. `grunt docs` will generate the documentation.

## Sending changes

1. Fork the project
2. Create a branch for the issue/feature you want to fix
3. Use concise git commits, for each important change you make
4. Add tests for the new features/fixes, and make sure they pass
5. When done, send a pull request.

More information:

* [How to Fork a repo](https://help.github.com/articles/fork-a-repo)
* [Using pull requests](https://help.github.com/articles/using-pull-requests)




