module.exports = function (grunt) {

  grunt.initConfig({

    watch: {
      files: ['app.js', 'index.html', 'style.css'],
      options: {
        livereload: true
      }
    },

    connect: {
      dev: {
        options: {
          port: 9001
        }
      }
    }

  });

  grunt.loadNpmTasks('grunt-contrib-connect');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.registerTask('default', ['connect:dev', 'watch']);

};
