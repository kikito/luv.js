module.exports = function(grunt) {

  var srcFiles  = ["src/core.js", "src/graphics.js"];
  var testFiles = "src/**/*.js";


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
    simplemocha: {
      all: { src: 'test/**/*.js' }
    },
    concat: {
      options: { banner: '<%= banner %>' },
      dist: {
         src:  'src/*.js',
         dest: '<%= pkg.name %>.js'
      }
    },
    uglify: {
      options: { banner: '<%= banner %>' },
      dist: {
        src: '<%= pkg.name %>.js',
        dest:  '<%= pkg.name %>.min.js'
      }
    }
  })

  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-simple-mocha');
  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-contrib-uglify');


  // Default task(s).
  grunt.registerTask('default', ['jshint', 'concat', 'simplemocha', 'uglify']);
}
