module.exports = function(grunt) {

  var srcFiles  = ["src/Luv.js", "src/graphics.js", "src/polyfills/*.js"];
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
    }
  });

  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-wrap');
  grunt.loadNpmTasks('grunt-contrib-uglify');

  grunt.registerTask('mocha', 'Run all tests using mocha-phantomjs (needs mocha-phantomjs to be installed globally)', function(){
    shell.exec("mocha-phantomjs test/index.html");
  });

  // Default task(s).
  grunt.registerTask('default', ['jshint', 'concat:dist', 'wrap', 'concat:banner', 'mocha', 'uglify']);
};
