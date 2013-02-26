module.exports = function(grunt) {

  // order of these files is important, that's why you can't do src/*
  var srcFiles  = [
    "src/shims.js",
    "src/Luv.js",
    "src/timer.js",
    "src/keyboard.js",
    "src/mouse.js",
    "src/media.js",
    "src/graphics.js"
  ];
  var testFiles = "src/**/*.js";
  var shell = require('shelljs');

  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    banner: "/*! <%= pkg.name %> <%= pkg.version %> (<%= grunt.template.today('yyyy-mm-dd') %>) - <%= pkg.homepage %> */\n" +
            "/*! <%= pkg.description %> */\n" +
            "/*! <%= pkg.author %> */\n",
    jshint: {
      src: srcFiles,
      test: {
        options: {expr: true}, // needed for sinon-grunt
        files: testFiles
      }
    },
    concat: {
      dist: {
        src:  srcFiles,
        dest: '<%= pkg.name %>.js'
      },
      banner: {
        options: { banner: '<%= banner %>' },
        src: '<%= pkg.name %>.js',
        dest: '<%= pkg.name %>.js'
      }
    },
    wrap: {
      dist: {
        src: ['<%= pkg.name %>.js'],
        dest: ['<%= pkg.name %>.js'],
        wrapper: ['(function(){\n', '\n}());']
      }
    },
    uglify: {
      options: { banner: '<%= banner %>' },
      dist: {
        src: '<%= pkg.name %>.js',
        dest:  '<%= pkg.name %>.min.js'
      }
    },
    docco: {
      dist: {
        src: srcFiles,
        options: {
          output: 'docs/'
        }
      }
    }
  });

  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-wrap');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-docco');

  grunt.registerTask('mocha', 'Run all tests using mocha-phantomjs (needs mocha-phantomjs to be installed globally)', function(){
    shell.exec("mocha-phantomjs test/index.html");
  });

  grunt.registerTask('gh-pages', 'Regenerate the github pages branch', function(){
    shell.exec("git checkout gh-pages && git merge -s subtree master && git commit -m 'updated docs' && git push origin gh-pages && git checkout master");
  });

  // Default task(s).
  grunt.registerTask('default', ['jshint', 'concat:dist', 'wrap', 'concat:banner', 'mocha', 'uglify']);
};
