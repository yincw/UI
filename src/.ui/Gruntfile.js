module.exports = function (grunt) {

    var pkg = grunt.file.readJSON('package.json');

    grunt.initConfig({

        pkg: pkg,
        ui: grunt.file.readJSON('.ui/grunt'),

        sprite: {
            normal_si: {
                src: ['<%= ui.sprite.src %>/*-si.png', '<%= ui.sprite.retina.src %>/!*-si.png'],
                dest: '<%= ui.sprite.dest %>/sprite-si.png',
                destCss: '<%= ui.sprite.destCss %>/sprite-var-si.less',
                imgPath: '<%= ui.sprite.imgPath %>/sprite-si.png',
                algorithm: '<%= ui.sprite.algorithm %>',
                algorithmOpts: {
                    sort: '<%= ui.sprite.algorithmSort %>'
                },
                padding: '<%= ui.sprite.padding %>'
            },
            normal_s: {
                src: ['<%= ui.sprite.src %>/*-s.png', '<%= ui.sprite.retina.src %>/!*-s.png'],
                dest: '<%= ui.sprite.dest %>/sprite-s.png',
                destCss: '<%= ui.sprite.destCss %>/sprite-var-s.less',
                imgPath: '<%= ui.sprite.imgPath %>/sprite-s.png',
                algorithm: '<%= ui.sprite.algorithm %>',
                algorithmOpts: {
                    sort: '<%= ui.sprite.algorithmSort %>'
                },
                padding: '<%= ui.sprite.padding %>'
            },
            retina: {
                src: '<%= ui.sprite.retina.src %>/*.png',
                retinaSrcFilter: '<%= ui.sprite.retina.src %>/*-2x.png',
                dest: '<%= ui.sprite.dest %>/sprite.png',
                retinaDest: '<%= ui.sprite.dest %>/sprite-2x.png',
                destCss: '<%= ui.sprite.destCss %>/sprite-var-2x.less',
                imgPath: '<%= ui.sprite.imgPath %>/sprite.png',
                retinaImgPath: '<%= ui.sprite.imgPath %>/sprite-2x.png',
                algorithm: '<%= ui.sprite.algorithm %>',
                algorithmOpts: {
                    sort: '<%= ui.sprite.algorithmSort %>'
                },
                padding: '<%= ui.sprite.padding %>'
            }
        },

        less: {
            options: {
                plugins: [
                    new (require('less-plugin-autoprefix'))({
                        browsers: '<%= ui.less.browsers %>'
                    }),
                    new (require('less-plugin-clean-css'))({
                        keepBreaks: '<%= ui.less.keepBreaks %>',
                        compatibility: '<%= ui.less.compatibility %>'
                    })
                ],
                modifyVars: {
                    'cosyless': '"<%= ui.less.cosyless %>"',
                    'sprite-var-si': '"<%= ui.less.spriteVarSi %>"',
                    'sprite-var-s': '"<%= ui.less.spriteVarS %>"',
                    'sprite-var-2x': '"<%= ui.less.spriteVar2x %>"'
                }
            },
            files: {
                expand: true,
                flatten: true,
                src: '<%= ui.less.src %>/*.less',
                dest: '<%= ui.less.dest %>/',
                ext: '.css'
            },
            cosyless: {
                src: '<%= ui.less.cosylessSrc %>/cosyless.less',
                dest: '<%= ui.less.cosylessDest %>/--cosyless.css'
            }
        },

        //////////////////////////////////

        coffee: {
            options: {
                bare: '<%= ui.coffee.bare %>'
            },
            files: {
                expand: true,
                flatten: true,
                cwd: '<%= ui.coffee.src %>/',
                src: '*.coffee',
                dest: '<%= ui.coffee.dest %>/',
                ext: '.js'
            }
        },

        cmdize: {
            js: {
                files: [
                    {
                        expand: true,
                        flatten: true,
                        cwd: '<%= ui.coffee.dest %>/',
                        src: '*.js',
                        dest: '<%= ui.cmd.dest %>/'
                    },
                    {
                        expand: true,
                        flatten: true,
                        cwd: '<%= ui.cmd.src %>/',
                        src: ['*.js', '!sea.js', '!sea-*.js', '!seajs-*.js', '!normal-*.js'],
                        dest: '<%= ui.cmd.dest %>/'
                    }
                ]
            }
        },

        transport: {
            js: {
                options: {
                    idleading: '<%= pkg.name %>/<%= pkg.version %>/js/',
                    debug: true
                },
                files: [{
                    expand: true,
                    flatten: true,
                    cwd: '<%= ui.cmd.dest %>',
                    src: '*.js',
                    dest: '<%= ui.transport.dest %>/'
                }]
            }
        },

        concat: {
            css: {
                options: {
                    noncmd: true
                },
                files: [{
                    src: '<%= ui.concat.src %>/*.css',
                    dest: '<%= ui.concat.dest %>/<%= pkg.name %>.css'
                }]
            },
            cmd: {
                options: {
                    include: '<%= ui.concat.cmd.include %>',
                    separator: '<%= ui.concat.cmd.separator %>'
                },
                files: [{
                    expand: true,
                    flatten: true,
                    cwd: '<%= ui.transport.dest %>',
                    src: '*.js',
                    dest: '<%= ui.concat.cmd.dest %>/'
                }]
            }
        },

        uglify: {
            files: {
                expand: true,
                flatten: true,
                cwd: '<%= ui.concat.cmd.dest %>',
                src: '*.js',
                dest: '<%= ui.uglify.dest %>/'
            }
        },

        copy: {
            image: {
                files: [{
                    expand: true,
                    flatten: true,
                    src: ['<%= ui.sprite.src %>/*.{png,jpg,gif,ico}',
                        '!<%= ui.sprite.retina.src %>/*.png',
                        '!<%= ui.sprite.src %>/*-si.png',
                        '!<%= ui.sprite.src %>/*-s.png'],
                    dest: '<%= ui.sprite.dest %>/'
                }]
            },
            cmd: {
                files: [
                    {
                        expand: true,
                        flatten: true,
                        cwd: '<%= ui.concat.cmd.dest %>',
                        src: pkg.name + '-debug.js',
                        //src: '*.js',
                        dest: '<%= ui.copy.dest %>/' + '/' + pkg.name + '/' + pkg.version + '/' + 'js/',
                        //rename: function (dest) {
                        //    return dest + '/' + pkg.name + '/' + pkg.version + '/' + 'js' + '/' + pkg.name +'-debug.js';
                        //}
                    },
                    {
                        expand: true,
                        flatten: true,
                        cwd: '<%= ui.uglify.dest %>',
                        src: pkg.name + '.js',
                        dest: '<%= ui.copy.dest %>/' + '/' + pkg.name + '/' + pkg.version + '/' + 'js/',
                        ext: '.js'
                    },
                    {
                        expand: true,
                        flatten: true,
                        cwd: 'js',
                        src: ['sea.js', 'sea-*.js', 'seajs-*.js', 'normal-*.js'],
                        dest: '<%= ui.copy.dest %>' + '/' + pkg.name + '/' + pkg.version + '/' + 'js/'
                    }
                ]
            },
            deploy: {
                files: [
                    {
                        expand: true,
                        cwd: '<%= ui.deploy.src %>/',
                        src: '**/*',
                        dest: '<%= ui.deploy.dest %>'
                    }
                ]
            }
        },

        clean: {
            build: {
                src: ['.sprite', '.build']
            },
            dest: {
                src: 'dest'
            },
            cmd: {
                src: '<%= ui.clean.src %>'
            }
        },

        //////////////////////////////////

        watch: {
            options: {
                livereload: '<%= ui.debug.livereload %>'
            },
            files: '<%= ui.debug.src %>',
            tasks: '<%= ui.debug.tasks %>'
        },

        connect: {
            server: {
                options: {
                    livereload: '<%= ui.debug.livereload %>',
                    protocol: 'http',
                    hostname: 'localhost',
                    port: '<%= ui.debug.port %>',
                    open: '<%= ui.debug.open %>'
                }
            }
        },

        compress: {
            options: {
                archive: '<%= pkg.name %>_<%= pkg.version %>.zip'
            },
            files: {
                src: '<%= ui.compress.src %>',
                dest: '<%= ui.compress.dest %>'
            }
        }

    });


    grunt.loadNpmTasks('grunt-spritesmith');
    grunt.loadNpmTasks('less-plugin-autoprefix');
    grunt.loadNpmTasks('less-plugin-clean-css');
    grunt.loadNpmTasks('grunt-contrib-less');
    grunt.loadNpmTasks('grunt-contrib-concat');

    grunt.loadNpmTasks('grunt-contrib-coffee');
    grunt.loadNpmTasks('grunt-cmd-transport');
    grunt.loadNpmTasks('grunt-cmd-concat');
    grunt.loadNpmTasks('grunt-contrib-uglify');

    grunt.loadNpmTasks('grunt-contrib-copy');
    grunt.loadNpmTasks('grunt-contrib-clean');

    grunt.loadNpmTasks('grunt-contrib-connect');
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-contrib-compress');


    grunt.registerMultiTask('cmdize', 'cmdize js file', function () {
        this.files.forEach(function (file) {
            var src = file.src[0],
                dest = file.dest,
                content = grunt.file.read(src),
                arr = [];

            arr.push('define(function(require, exports, module){ \n');
            arr.push(content);
            arr.push('}); \n\n');

            grunt.file.write( dest, arr.join('') );
        });
    });


    // LESS编译
    grunt.registerTask('lessc', ['sprite', 'less']);

    // CSS构建
    grunt.registerTask('css', ['lessc', 'copy:image', 'concat:css', 'clean:build']);

    // JS构建
    grunt.registerTask('cmd', ['coffee', 'cmdize', 'transport', 'concat:cmd', 'uglify', 'copy:cmd', 'clean:cmd']);

    // 项目调试
    grunt.registerTask('debug', ['connect', 'watch']);

    // 项目部署
    grunt.registerTask('deploy', ['css', 'copy:deploy', 'clean:dest']);

    // 导出项目
    grunt.registerTask('export', ['deploy', 'compress']);

};
