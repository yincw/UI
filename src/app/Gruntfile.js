module.exports = function (grunt){

    grunt.initConfig({

        pkg: grunt.file.readJSON('package.json'),
        bower: {
            install: {
                options: {
                    targetDir: "./bower",
                    layout: "byComponent",
                    install: true,
                    verbose: false,
                    cleanTargetDir: false,
                    cleanBowerDir: false
                }
            }
        },
        copy: {
            image: {
                files: [
                    {
                        expand: true,
                        flatten: true,
                        cwd: 'src/',
                        src: ['**/src/images/*.{gif,jpg,png}', '!**/src/images/*_s.png', '!**/src/images/*_si.png', '!**/src/images/*_sb.png'],
                        dest: 'dest/images/'
                    }
                ]
            },
            deploy: {
                files: [
                    {
                        expand: true,
                        cwd: 'dest/',
                        src: '**/*',
                        dest: 'resources/'
                    }
                ]
            }
        },

        sprite: {
            //sprite
            s: {
                src: 'src/**/src/images/*_s.png',
                destImg: 'dest/images/sprite_s.png',
                destCSS: '.sprite/sprite_s.less',
                engine: 'pngsmith',
                algorithm: 'binary-tree',
                padding: 2
            },
            //sprite icon
            si: {
                src: 'src/**/src/images/*_si.png',
                destImg: 'dest/images/sprite_si.png',
                destCSS: '.sprite/sprite_si.less',
                engine: 'pngsmith',
                algorithm: 'binary-tree',
                padding: 2
            },
            //sprite button
            sb: {
                src: 'src/**/src/images/*_sb.png',
                destImg: 'dest/images/sprite_sb.png',
                destCSS: '.sprite/sprite_sb.less',
                engine: 'pngsmith',
                algorithm: 'binary-tree',
                padding: 2
            }
        },

        less: {
            options: {
                compress: false,
                modifyVars: {
                    cosyless: '"../../../cosyless"',
                    spriteVar: '"../../../../.sprite/sprite"',
                    image_s: '"../images/sprite_s.png"',
                    image_si: '"../images/sprite_si.png"',
                    image_sb: '"../images/sprite_sb.png"'
                }
            },
            files: {
                expand: true,
                flatten: true,
                cwd: 'src/',
                src: '**/src/less/*.less',
                dest: '.build/_css/',
                ext: '.css'
            },
            cosyless: {
                src: 'src/cosyless/cosyless.less',
                dest: '.build/_css/0_cosyless.css'
            }
        },

        autoprefixer: {
            options: {
                browsers: ['> 1%', 'last 2 versions', 'Firefox ESR', 'Opera 12.1']
            },
            files: {
                expand: true,
                cwd: '.build/_css/',
                src: '*.css',
                dest: '.build/_precss/',
                ext: '.css'
            }
        },

        concat: {
            less: {
                options: {
                    stripBanners: true
                },
                files: [{
                    src: ['.sprite/*_s.less', '.sprite/*_si.less', '.sprite/*_sb.less'],
                    dest: '.sprite/sprite.less'
                }]
            },
            css: {
                options: {
                    stripBanners: true
                },
                files: [{
                    src: '.build/_precss/*.css',
                    dest: 'dest/css/<%= pkg.name %>-debug.css'
                }]
            },
            js: {
                options: {},
                files: [
                    {
                        src: ['.build/_cmdjs/*.js', '!.build/_cmdjs/*-debug.js'],
                        dest: '.build/js/<%= pkg.name %>.js'
                    },
                    {
                        src: '.build/_cmdjs/*-debug.js',
                        dest: 'dest/js/<%= pkg.name %>-debug.js'
                    }
                ]
            }
        },

        cssmin: {
            options: {},
            files: {
                src: '.build/_precss/*.css',
                dest: 'dest/css/<%= pkg.name %>.css'
            }
        },

        coffee: {
            options: {
                bare: true
            },
            files: {
                expand: true,
                flatten: true,
                cwd: 'src/',
                src: '**/src/coffee/*.coffee',
                dest: '.build/_js/',
                ext: '.js'
            }
        },

        transport: {
            options: {
                idleading: '<%= pkg.family %>/<%= pkg.name %>/<%= pkg.version %>/',
                alias: {},
                debug: true
            },
            //coffee > _js > _cmdjs
            js: {
                files: [{
                    expand: true,
                    cwd: '.build/_js/',
                    src: '*.js',
                    dest: '.build/_cmdjs/',
                    ext: '.js'
                }]
            },
            //js > _cmdjs
            cmdjs: {
                files: [{
                    expand: true,
                    cwd: 'src/',
                    src: '**/src/js/*.js',
                    dest: '.build/_cmdjs/',
                    ext: '.js'
                }]
            }
        },

        uglify: {
            options: {
                mangle: true
            },
            files: {
                expand: true,
                cwd: '.build/js/',
                src: '*.js',
                dest: 'dest/js/',
                ext: '.js'
            }
        },

        clean: {
            build: {
                src: '.build'
            },
            sprite: {
                src: '.sprite'
            },
            dest: {
                src: 'dest'
            }
        },

        watch: {
            options: {
                livereload: true
            },
            files: 'src/**',
            tasks: ['copy:image', 'sprite', 'concat:less', 'less', 'autoprefixer', 'concat:css', 'cssmin', 'clean:build']
        },

        connect: {
            options: {
                livereload: true,
                protocol: 'http',
                hostname: 'localhost',
                port: '8000',
                open: false
            }
        },

        compress: {
            options: {
                archive: '<%= pkg.name %>_<%= pkg.version %>.zip'
            },
            files: {
                src: ['resources/**', 'sea-modules/**'],
                dest: '<%= pkg.name %>/'
            }
        }

    });

    grunt.loadNpmTasks('grunt-bower-task');
    grunt.loadNpmTasks('grunt-contrib-copy');
    grunt.loadNpmTasks('grunt-spritesmith');
    grunt.loadNpmTasks('grunt-contrib-less');
    grunt.loadNpmTasks('grunt-autoprefixer');
    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-contrib-cssmin-pre-2.1.0');
    grunt.loadNpmTasks('grunt-contrib-coffee');
    grunt.loadNpmTasks('grunt-cmd-transport');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-clean');

    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-contrib-connect');
    grunt.loadNpmTasks('grunt-contrib-compress');


    grunt.registerTask('css', ['copy:image', 'sprite', 'concat:less', 'less', 'autoprefixer', 'concat:css', 'cssmin', 'clean:build']);
    grunt.registerTask('js', ['coffee', 'transport', 'concat:js', 'uglify', 'clean:build']);

    grunt.registerTask('default', ['css', 'js']);
    grunt.registerTask('deploy', ['default', 'copy:deploy', 'clean']);
    grunt.registerTask('packer', ['deploy', 'compress']);

    grunt.registerTask('dev', ['bower'])

};

//    参考连接
//
//    https://github.com/gruntjs/grunt-contrib-copy
//    https://github.com/Ensighten/grunt-spritesmith
//    https://github.com/gruntjs/grunt-contrib-less
//    https://github.com/nDmitry/grunt-autoprefixer
//    https://github.com/gruntjs/grunt-contrib-concat
//    https://www.npmjs.org/package/grunt-contrib-cssmin-pre-2.1.0
//    https://github.com/gruntjs/grunt-contrib-coffee
//    https://github.com/spmjs/grunt-cmd-transport
//    https://github.com/gruntjs/grunt-contrib-uglify
//    https://github.com/gruntjs/grunt-contrib-clean
//
//    https://github.com/gruntjs/grunt-contrib-watch
//    https://github.com/gruntjs/grunt-contrib-connect
//    https://github.com/gruntjs/grunt-contrib-compress
