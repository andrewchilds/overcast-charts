/*
 * grunt-caveman
 * https://github.com/andrewchilds/grunt-caveman
 */

module.exports = function (grunt) {

  var Caveman = require('caveman');

  grunt.registerMultiTask('caveman', 'Compile caveman templates', function () {
    var path = require('path');
    var templateCount = 0;

    var output = '';
    grunt.file.expand(this.data.src).forEach(function (template) {
      templateCount++;
      var name = path.basename(template, path.extname(template));
      try {
        var compiled = Caveman.compile(grunt.file.read(template) + '');
        output += "Caveman.register('" + name + "', function(Caveman, d) { " +
          compiled + " });\n";
      } catch (e) {
        grunt.log.error(e);
        grunt.fail.warn('Error compiling Caveman template ' + name +
          ' in ' + template);
      }
    });

    grunt.file.write(this.data.dest, output);
    grunt.log.writeln(templateCount + ' templates saved to file "' +
      this.data.dest + '".');
  });

};
