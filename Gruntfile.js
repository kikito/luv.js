module.exports = function(grunt) {
  var shell = require('shelljs');
  var fs    = require('fs');

  // order of these files is important, that's why you can't do src/*
  var srcFiles  = [
    "src/core.js",
    "src/timer.js",
    "src/timer/after.js",
    "src/timer/every.js",
    "src/timer/tween.js",
    "src/keyboard.js",
    "src/mouse.js",
    "src/touch.js",
    "src/media.js",
    "src/audio.js",
    "src/audio/sound.js",
    "src/audio/sound_instance.js",
    "src/audio/null_sound.js",
    "src/graphics.js",
    "src/graphics/*"
  ];
  var testFiles = "test/**/*.js";
  var docFiles = ['README.js.md', 'MIT-LICENSE.md', 'CONTRIBUTING.md'].concat(srcFiles);

  var exec = function(arr) {
    arr = Array.isArray(arr) ? arr : [arr];
    arr.forEach(function(command) {
      shell.exec(command);
    });
  };

  var generateDocco = function(output) {
    exec([
      "rm -rf " + output,
      "cp README.md README.js.md",
      "docco " + docFiles.join(" ") + " -t docco/docco.jst -c docco/docco.css -o " + output,
      "cp -r docco/public " + output + "/public",
      "mv " + output + "/README.js.html " + output + "/index.html",
      "rm README.js.md"
    ]);
  };

  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    banner: "/*! <%= pkg.name %> <%= pkg.version %> (<%= grunt.template.today('yyyy-mm-dd') %>) - <%= pkg.homepage %> */\n" +
            "/*! <%= pkg.description %> */\n" +
            "/*! <%= pkg.author %> */\n",
    jshint: {
      dist: srcFiles,
      test: {
        options: {expr: true}, // needed for sinon-grunt
        files: testFiles
      }
    },
    concat: {
      banner: {
        options: { banner: '<%= banner %>' },
        src: srcFiles,
        dest: '<%= pkg.name %>.js'
      }
    },
    uglify: {
      options: { banner: '<%= banner %>' },
      dist: {
        src:  '<%= pkg.name %>.js',
        dest: '<%= pkg.name %>.min.js'
      },
      illiterate: {
        options: {
          compress: false,
          mangle: false,
          preserveComments: false,
          beautify: true
        },
        src:  '<%= pkg.name %>.js',
        dest: '<%= pkg.name %>.illiterate.js'
      }
    },
    umd: {
      all: {
        src: '<%= pkg.name %>.js',
        objectToExport: 'Luv',
        amdModuleId: 'Luv',
        globalAlias: 'Luv'
      }
    },
    watch: {
      dist: {
        files: srcFiles.concat(testFiles),
        tasks: ['default']
      },
      docs: {
        files: docFiles,
        tasks: ['docs']
      }
    }
  });

  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-umd');

  grunt.registerTask('mocha', 'Run all tests using mocha-phantomjs (needs mocha-phantomjs to be installed globally)', function(){
    exec("mocha-phantomjs test/index.html");
  });

  grunt.registerTask('docs', 'Runs docco and exports the result to docs', function() {
    generateDocco('docs');
  });

  grunt.registerTask('examples', 'generates examples/js/example-data.js', function() {
    var isExample    = function(path) { return (/\.html$/).test(path) && path != "index.html"; },
        removeHtml   = function(path) { return path.slice(0, -5); },
        example_data = {};

    fs.readdirSync('examples').filter(isExample).forEach(function(filename) {
      var id   = removeHtml(filename),
          html = fs.readFileSync('examples/' + filename, 'utf8');
      example_data[id] = html;
    });

    fs.writeFileSync("examples/js/example-data.js", 'var example_data = ' + JSON.stringify(example_data) + ';');
  });

  grunt.registerTask('gh-pages', 'generates the docs with docco and publishes to github pages', function() {
    generateDocco('.git/gh-pages-tmp/docs');
    exec([
      "cp -Rf examples .git/gh-pages-tmp",
      "cp luv.js .git/gh-pages-tmp/",
      "sh ./generate-gh-pages.sh",
      "rm -Rf .git/gh-pages-tmp",
      "git push origin gh-pages"
    ]);
  });

  grunt.registerTask('compile', 'generate luv.js and luv.min.js from src/', ['jshint:dist', 'concat', 'umd', 'uglify']);

  // Default task(s).
  grunt.registerTask('default', ['jshint:test', 'compile', 'mocha']);

};
