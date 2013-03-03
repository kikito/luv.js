module.exports = function(grunt) {
  var shell = require('shelljs');
  var fs    = require('fs');

  // order of these files is important, that's why you can't do src/*
  var srcFiles  = [
    "src/shims.js",
    "src/Luv.js",
    "src/timer.js",
    "src/keyboard.js",
    "src/mouse.js",
    "src/media.js",
    "src/media/asset.js",
    "src/media/image.js",
    "src/graphics.js"
  ];
  var testFiles = "test/**/*.js";
  var docFiles = ['README.md', 'MIT-LICENSE.md'].concat(srcFiles);

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
    },
    groc: {
      local: {
        src: docFiles,
        options: {
          out:  'docs/'
        }
      },
      github: {
        src: docFiles,
        options: {
          github: true
        }
      }
    }
  });

  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-groc');
  grunt.loadNpmTasks('grunt-contrib-watch');

  grunt.registerTask('mocha', 'Run all tests using mocha-phantomjs (needs mocha-phantomjs to be installed globally)', function(){
    shell.exec("mocha-phantomjs test/index.html");
  });

  // make an alias to groc subtasks because I never remember 'groc'
  grunt.registerTask('docs',     ['groc:local']);
  grunt.registerTask('gh-pages', ['groc:github']);

  grunt.registerTask('compile', 'generate luv.js and luv.min.js from src/', ['jshint:dist', 'concat', 'uglify']);

  // Default task(s).
  grunt.registerTask('default', ['jshint:test', 'compile', 'mocha']);

};
