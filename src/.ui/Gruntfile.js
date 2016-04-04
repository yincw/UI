module.exports = function (grunt) {

    var pkg = grunt.file.readJSON('package.json');

    grunt.initConfig({

        pkg: pkg,
        ui: grunt.file.readJSON('.ui/grunt'),

        sprite: {
            postfix_si: {
                src: ['<%= ui.global.inputDir %>/**/<%= ui.sprite.inputDir %>/*-si.png', '<%= ui.global.inputDir %>/<%= ui.retina.inputDir %>/<%= ui.sprite.inputDir %>/!*-si.png'],
                dest: '<%= ui.global.outputDir %>/<%= ui.sprite.outputDir %>/sprite-si.png',
                destCss: '<%= ui.global.spriteDir %>/sprite-var-si.less',
                imgPath: '<%= ui.sprite.imgPath %>/sprite-si.png',
                algorithm: '<%= ui.sprite.algorithm %>',
                algorithmOpts: {
                    sort: '<%= ui.sprite.algorithmSort %>'
                },
                padding: '<%= ui.sprite.padding %>'
            },
            postfix_s: {
                src: ['<%= ui.global.inputDir %>/**/<%= ui.sprite.inputDir %>/*-s.png', '<%= ui.global.inputDir %>/<%= ui.retina.inputDir %>/<%= ui.sprite.inputDir %>/!*-s.png'],
                dest: '<%= ui.global.outputDir %>/<%= ui.sprite.outputDir %>/sprite-s.png',
                destCss: '<%= ui.global.spriteDir %>/sprite-var-s.less',
                imgPath: '<%= ui.sprite.imgPath %>/sprite-s.png',
                algorithm: '<%= ui.sprite.algorithm %>',
                algorithmOpts: {
                    sort: '<%= ui.sprite.algorithmSort %>'
                },
                padding: '<%= ui.sprite.padding %>'
            },
            postfix_2x: {
                src: '<%= ui.global.inputDir %>/<%= ui.sprite.retina.inputDir %>/<%= ui.sprite.inputDir %>/*.png',
                retinaSrcFilter: '<%= ui.global.inputDir %>/<%= ui.sprite.retina.inputDir %>/<%= ui.sprite.inputDir %>/*-2x.png',
                dest: '<%= ui.global.outputDir %>/<%= ui.sprite.outputDir %>/sprite.png',
                retinaDest: '<%= ui.global.outputDir %>/<%= ui.sprite.outputDir %>/sprite-2x.png',
                destCss: '<%= ui.global.spriteDir %>/sprite-var-2x.less',
                imgPath: '<%= ui.sprite.imgPath %>/sprite.png',
                retinaImgPath: '<%= ui.sprite.imgPath %>/sprite-2x.png',
                algorithm: '<%= ui.sprite.algorithm %>',
                algorithmOpts: {
                    sort: '<%= ui.sprite.algorithmSort %>'
                },
                padding: '<%= ui.sprite.padding %>'
            },
            component_postfix_si: {
                src: '<%= ui.sprite.inputDir %>/*-si.png',
                dest: '<%= ui.global.buildDir %>/<%= ui.sprite.outputDir %>/sprite-si.png',
                destCss: '<%= ui.global.spriteDir %>/sprite-var-si.less',
                imgPath: '<%= ui.sprite.imgPath %>/sprite-si.png',
                algorithm: '<%= ui.sprite.algorithm %>',
                algorithmOpts: {
                    sort: '<%= ui.sprite.algorithmSort %>'
                },
                padding: '<%= ui.sprite.padding %>'
            },
            component_postfix_s: {
                src: '<%= ui.sprite.inputDir %>/*-s.png',
                dest: '<%= ui.global.buildDir %>/<%= ui.sprite.outputDir %>/sprite-s.png',
                destCss: '<%= ui.global.spriteDir %>/sprite-var-s.less',
                imgPath: '<%= ui.sprite.imgPath %>/sprite-s.png',
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
            project: {
                files: [{
                    expand: true,
                    flatten: true,
                    src: '<%= ui.global.inputDir %>/**/<%= ui.less.inputDir %>/*.less',
                    dest: '<%= ui.global.buildDir %>/<%= ui.less.outputDir %>/',
                    ext: '.css'
                }, {
                    src: '<%= ui.global.inputDir %>/cosyless/cosyless.less',
                    dest: '<%= ui.global.buildDir %>/<%= ui.less.outputDir %>/--cosyless.css'
                }]
            },
            component: {
                files: [{
                    expand: true,
                    flatten: true,
                    src: '<%= ui.less.inputDir %>/*.less',
                    dest: '<%= ui.global.buildDir %>/<%= ui.less.outputDir %>/',
                    ext: '.css'
                }]
            }
        },

        coffee: {
            project: {
                options: {
                    bare: '<%= ui.coffee.bare %>'
                },
                files: [{
                    expand: true,
                    flatten: true,
                    src: '<%= ui.global.inputDir %>/**/<%= ui.coffee.inputDir %>/*.coffee',
                    dest: '<%= ui.global.buildDir %>/<%= ui.coffee.outputDir %>/',
                    ext: '.js'
                }]
            },
            component: {
                options: {
                    bare: '<%= ui.coffee.bare %>'
                },
                files: [{
                    expand: true,
                    flatten: true,
                    cwd: '<%= ui.coffee.inputDir %>',
                    src: '*.coffee',
                    dest: '<%= ui.global.buildDir %>/<%= ui.coffee.outputDir %>/',
                    ext: '.js'
                }]
            }
        },

        cmdize: {
            js: {
                files: [{
                    expand: true,
                    flatten: true,
                    src: '<%= ui.global.buildDir %>/<%= ui.coffee.outputDir %>/*.js',
                    dest: '<%= ui.global.buildDir %>/<%= ui.cmdize.outputDir %>/',
                    ext: '.js'
                }, {
                    expand: true,
                    flatten: true,
                    cwd: '<%= ui.cmdize.inputDir %>/',
                    src: ['*.js', '!sea.js', '!sea-*.js', '!seajs-*.js', '!non-*.js'],
                    dest: '<%= ui.global.buildDir %>/<%= ui.cmdize.outputDir %>/',
                    ext: '.js'
                }]
            }
        },

        transport: {
            js: {
                options: {
                    idleading: '<%= pkg.name %>/<%= pkg.version %>/js/',
                    debug: false
                },
                files: [{
                    expand: true,
                    flatten: true,
                    cwd: '<%= ui.global.buildDir %>/<%= ui.cmdize.outputDir %>/',
                    src: '*.js',
                    dest: '<%= ui.global.buildDir %>/<%= ui.transport.outputDir %>/',
                    ext: '.js'
                }]
            }
        },

        concat: {
            // 项目CSS部署（压缩版）
            project_css: {
                options: {
                    noncmd: true
                },
                files: [{
                    src: '<%= ui.global.buildDir %>/<%= ui.less.outputDir %>/*.css',
                    dest: '<%= ui.global.outputDir %>/<%= ui.concat.css.outputDir %>/<%= pkg.name %>.min.css'
                }]
            },
            project_js: {
                options: {
                    noncmd: true
                },
                files: [{
                    expand: true,
                    flatten: true,
                    src: '<%= ui.global.inputDir %>/**/<%= ui.concat.js.inputDir %>/*.js',
                    dest: '<%= ui.global.buildDir %>/<%= ui.concat.js.outputDir %>/',
                    ext: '.js'
                }]
            },
            project_js_total: {
                options: {
                    noncmd: true
                },
                files: [{
                    src: ['<%= ui.global.buildDir %>/<%= ui.coffee.outputDir %>/*.js', '<%= ui.global.buildDir %>/<%= ui.concat.js.outputDir %>/*.js'],
                    dest: '<%= ui.global.buildDir %>/<%= ui.copy.outputDir %>/<%= pkg.name %>.js'
                }]
            },
            // 组件CSS部署（压缩版）
            component_css: {
                options: {
                    noncmd: true
                },
                files: [{
                    src: '<%= ui.global.buildDir %>/<%= ui.less.outputDir %>/*.css',
                    dest: '<%= ui.global.outputDir %>/<%= pkg.name %>/<%= pkg.version %>/css/<%= pkg.name %>.min.css'
                }]
            },
            component_js: {
                options: {
                    include: '<%= ui.concat.include %>',
                    separator: '<%= ui.concat.separator %>'
                },
                files: [{
                    expand: true,
                    flatten: true,
                    cwd: '<%= ui.global.buildDir %>/<%= ui.transport.outputDir %>/',
                    src: '*.js',
                    dest: '<%= ui.global.buildDir %>/<%= ui.concat.outputDir %>/'
                }]
            }
        },

        uglify: {
            // 项目JS部署（压缩版）
            project: {
                options: {
                    beautify: '<%= ui.uglify.beautify %>'
                },
                files: [{
                    expand: true,
                    flatten: true,
                    src: '<%= ui.global.buildDir %>/<%= ui.copy.outputDir %>/*.js',
                    dest: '<%= ui.global.outputDir %>/<%= ui.uglify.outputDir %>/',
                    ext: '.min.js'
                }]
            },
            //组件JS部署（压缩版）
            component: {
                options: {
                    beautify: '<%= ui.uglify.beautify %>'
                },
                files: [{
                    expand: true,
                    flatten: true,
                    cwd: '<%= ui.global.buildDir %>/<%= ui.concat.outputDir %>',
                    src: '*.js',
                    dest: '<%= ui.global.outputDir %>/' + pkg.name + '/' + pkg.version + '/' + '<%= ui.uglify.outputDir %>/',
                    ext: '.min.js'
                }]
            }
        },

        copy: {
            // 项目CSS部署（图片和字体资源）
            project_css: {
                files: [{
                    expand: true,
                    flatten: true,
                    src: ['<%= ui.global.inputDir %>/**/<%= ui.sprite.inputDir %>/*.{png,jpg,gif,ico}',
                        '!<%= ui.global.inputDir %>/<%= ui.sprite.retina.inputDir %>/<%= ui.sprite.inputDir %>/*.png',
                        '!<%= ui.global.inputDir %>/**/<%= ui.sprite.inputDir %>/*-si.png',
                        '!<%= ui.global.inputDir %>/**/<%= ui.sprite.inputDir %>/*-s.png'],
                    dest: '<%= ui.global.outputDir %>/<%= ui.sprite.outputDir %>/'
                }, {
                    expand: true,
                    flatten: true,
                    src: '<%= ui.global.inputDir %>/**/<%= ui.font.inputDir %>/*.{ttf,woff,eot,svg}',
                    dest: '<%= ui.global.outputDir %>/<%= ui.font.outputDir %>/'
                }]
            },
            // 项目JS部署（未压缩版）
            project_js: {
                files: [{
                    expand: true,
                    flatten: true,
                    src: '<%= ui.global.buildDir %>/<%= ui.copy.outputDir %>/*.js',
                    dest: '<%= ui.global.outputDir %>/<%= ui.uglify.outputDir %>/',
                    ext: '.js'
                }]
            },
            project_copy: {
                files: [{
                    src: '<%= ui.global.outputDir %>/**',
                    dest: '<%= ui.copy.copyToDir %>/'
                }]
            },
            // 组件CSS部署（图片和字体资源）
            component_css: {
                files: [{
                    expand: true,
                    flatten: true,
                    src: ['<%= ui.sprite.inputDir %>/*.{png,jpg,gif,ico}',
                        '!<%= ui.sprite.inputDir %>/*-si.png',
                        '!<%= ui.sprite.inputDir %>/*-s.png',
                        '<%= ui.global.buildDir %>/<%= ui.sprite.outputDir %>/*.png'],
                    dest: '<%= ui.global.outputDir %>/' + pkg.name + '/' + pkg.version + '/' + '<%= ui.sprite.inputDir %>/'
                }, {
                    expand: true,
                    flatten: true,
                    src: '<%= ui.font.inputDir %>/*.{ttf,woff,eot,svg}',
                    dest: '<%= ui.global.outputDir %>/' + pkg.name + '/' + pkg.version + '/' + '<%= ui.font.outputDir %>/'
                }]
            },
            // 组件JS部署（未压缩版）
            component_js: {
                files: [{
                    expand: true,
                    flatten: true,
                    cwd: '<%= ui.global.buildDir %>/<%= ui.concat.outputDir %>',
                    src: '*.js',
                    dest: '<%= ui.global.outputDir %>/' + pkg.name + '/' + pkg.version + '/' + '<%= ui.uglify.outputDir %>/',
                    ext: '.js'

                }, {
                    expand: true,
                    flatten: true,
                    cwd: 'js',
                    src: ['sea.js', 'sea-*.js', 'seajs-*.js', 'non-*.js'],
                    dest: '<%= ui.global.outputDir %>/' + pkg.name + '/' + pkg.version + '/' + '<%= ui.uglify.outputDir %>/',
                    ext: '.js'
                }]
            }
        },

        clean: {
            build: ['.sprite', '.build']
        },

        /////////////////////////////

        connect: {
            server: {
                options: {
                    protocol: 'http',
                    hostname: 'localhost',
                    port: '<%= ui.debug.port %>',
                    open: '<%= ui.debug.open %>',
                    livereload: '<%= ui.debug.livereload %>'
                }
            }
        },

        watch: {
            options: {
                livereload: '<%= ui.debug.livereload %>'
            },
            files: '<%= ui.global.inputDir %>/**',
            tasks: '<%= ui.debug.tasks %>'
        },

        /////////////////////////////

        compress: {
            options: {
                archive: '<%= pkg.name %>_<%= pkg.version %>.zip'
            },
            files: {
                src: '<%= ui.compress.inputDir %>',
                dest: '<%= pkg.name %>'
            }
        }

    });


    grunt.loadNpmTasks('grunt-spritesmith');
    grunt.loadNpmTasks('grunt-contrib-less');
    grunt.loadNpmTasks('less-plugin-autoprefix');
    grunt.loadNpmTasks('less-plugin-clean-css');

    grunt.loadNpmTasks('grunt-contrib-coffee');
    grunt.loadNpmTasks('grunt-cmd-transport');
    grunt.loadNpmTasks('grunt-cmd-concat');
    grunt.loadNpmTasks('grunt-contrib-concat');
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

            arr.push('define( function (require, exports, module) { \n\n');
            arr.push(content + '\n');
            arr.push('}); \n\n');

            grunt.file.write(dest, arr.join(''));
        });
    });


    // CSS 部署
    grunt.registerTask('project_deploy_css', ['sprite:postfix_si', 'sprite:postfix_s', 'sprite:postfix_2x', 'less:project', 'copy:project_css', 'concat:project_css', 'clean']);

    // 项目部署（CSS & JS）
    grunt.registerTask('project_deploy', ['coffee:project', 'concat:project_js', 'concat:project_js_total', 'copy:project_js', 'uglify:project', 'project_deploy_css']);

    // JS 部署
    grunt.registerTask('component_deploy_js', ['coffee:component', 'cmdize', 'transport', 'concat:component_js', 'uglify:component', 'copy:component_js', 'clean']);

    // 组件部署（CSS & JS）
    grunt.registerTask('component_deploy', ['sprite:component_postfix_si', 'sprite:component_postfix_s', 'less:component', 'copy:component_css', 'concat:component_css', 'component_deploy_js']);


    // 项目调试
    grunt.registerTask('project_debug', ['connect', 'watch']);

    // 项目拷贝到...
    grunt.registerTask('project_copy_to', ['project_deploy', 'copy:project_copy']);

    // 项目导出
    grunt.registerTask('project_export', ['project_deploy', 'compress']);

};
