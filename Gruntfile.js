module.exports = function (grunt) {

  // Project configuration.
  grunt.initConfig({
    concat: {
      'public/bundled/lib.js': [
        'public/bower/jquery/dist/jquery.min.js',
        'public/bower/fastbinder/jquery.fastbinder.js',
        'public/bower/collectionize/collectionize.js',
        'public/bower/d3/d3.js',
        'public/bower/nvd3/nv.d3.js',
        'node_modules/caveman/caveman.js',
        'node_modules/lodash/dist/lodash.min.js'
      ],
      'public/bundled/app.js': [
        'app/client/js/app.js',
        'app/client/js/*/*.js'
      ]
    },
    less: {
      app: {
        files: {
          'public/bundled/app.css': [
            'public/bower/nvd3/nv.d3.css',
            'public/bower/normalize-css/normalize.css',
            'public/bower/less-elements/elements.less',
            'app/client/less/app.less'
          ]
        },
        options: {
          yuicompress: true
        }
      }
    },
    fingerprint: {
      assets: {
        src: [
          'public/bundled/*'
        ],
        filename: 'fingerprint'
      }
    },
    caveman: {
      compile: {
        src: ['app/views/templates/*.html'],
        dest: 'public/bundled/templates.js'
      }
    },
    uglify: {
      app: {
        files: {
          'public/bundled/app.min.js': ['public/bundled/app.js']
        }
      },
      lib: {
        files: {
          'public/bundled/lib.min.js': ['public/bundled/lib.js']
        }
      }
    },
    jshint: {
      options: {
        browser: true,
        curly: true,
        eqeqeq: true,
        evil: true,
        forin: true,
        indent: 2,
        jquery: true,
        quotmark: 'single',
        undef: true,
        unused: false,
        trailing: true,
        globals: {
          _: true,
          App: true,
          Collectionize: true,
          Caveman: true,
          d3: true,
          nv: true
        }
      },
      app: [
        'app/client/js/*.js',
        'app/client/js/*/*.js'
      ]
    },
    watch: {
      files: [
        'app/client/less/*',
        'app/client/js/**',
        'app/views/**',
        'test/integration/**',
        'test/unit/**'
      ],
      tasks: 'default',
      options: {
        livereload: true
      }
    }
  });

  // Autoload tasks.
  require('load-grunt-tasks')(grunt);

  // Register tasks.
  grunt.registerTask('default', ['jshint', 'caveman', 'less', 'concat', 'fingerprint']);
  grunt.registerTask('dist', ['default', 'uglify']);

};
