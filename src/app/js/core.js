/**
 * Created by wupeng on 2015/7/16.
 */
define(function (require, exports, module) {
    var path = requireNode("path");
    var fs = requireNode('fs-extra');
    var core = angular.module('core', []);

    core.directive('ngModelDrop', function ($parse, $q, fs) {
        return {
            restrict: 'A',
            require: '^ngModel',
            link: function(scope, element, attr, ngModelCtrl) {
                console.info('ngModelDrop', scope, element, attr);

                element.on('drop', function (e) {
                    e.preventDefault();
                    var files = e.originalEvent.dataTransfer.files;
                    var file = files[0];
                    console.info('drop files:', files)

                    $q.when(function () {
                        //确保拖拽的是单个文件夹
                        if (files.length > 1) {
                            throw new Error('不支持多个文件夹');
                        } else if (files.length == 1) {
                            var stat = fs.statSync(file.path);

                            if (!stat.isDirectory()) {
                                throw new Error('目标不是文件夹');
                            } else {
                                return file.path;
                            }
                        }
                    }).then(function () {
                        console.info('drop set value', file);
                        //赋值
                        ngModelCtrl.$setViewValue(file.path);
                        ngModelCtrl.$render();

                        console.info('drop value setted', scope);
                    }).catch(function(err) {
                        console.err(err);
                    })

                });



            }
        }
    });

    core.factory('ensureDir', function ($q) {
        return function ensureDir(dir) {
            return $q(function (resolve, reject) {
                fs.ensureDir(dir, function (err) {
                    err ? reject(err) : resolve();
                });
            });
        }
    });

    core.factory('mkdirp', function () {
        var bd = requireNode('bluebird');
        var mkdirp = requireNode('mkdirp');

        return bd.promisifyAll(mkdirp);
    });

    core.factory('fs', function () {
        var bd = requireNode('bluebird');
        var fs = requireNode("fs-extra");
        return bd.promisifyAll(fs);
    });

    core.factory('rimraf', function () {
        var bd = requireNode('bluebird');
        var rimraf = requireNode('rimraf');
        return bd.promisifyAll(rimraf);
    });

    core.service('fsUtil', function ($q) {
        var fs = requireNode('fs-extra');


        this.copy = thunk(fs.copy);
        this.output = thunk(fs.output);
        this.outputJson = thunk(fs.outputJson);

        this.outputJson = function (file, json) {
            var w = this;

            return new Promise(function (resolve, reject) {
                fs.ensureFile(file, function (err) {
                    if (err) {
                        reject(err);
                    } else {
                        w.output(file, JSON.stringify(json, null, 4)).then(resolve).catch(resolve);
                    }
                });
            });
        };

        this.output = function (file, content) {
            return new Promise(function (resolve, reject) {
                fs.writeFile(file, content, 'utf8', function (err) {
                    if (err) {
                        reject(err);
                    } else {
                        resolve();
                    }
                });
            });
        };


        this.remove = function (path) {
            return new Promise(function (resolve, reject) {
                fs.stat(path, function (err, stat) {
                    if (stat) {
                        fs.removeSync(path);
                    }

                    resolve();
                });
            });
        };
        //this.remove = thunk(fs.remove);
        this.ensureFile = thunk(fs.ensureFile);
        this.ensureDir = thunk(fs.ensureDir);
    });

    core.factory('ensureFile', function ($q) {
        return function ensureFile(file) {
            return $q(function (resolve, reject) {
                fs.ensureFile(file, function (err) {
                    err ? reject(err) : resolve();
                })
            })
        }
    });

    core.factory('output', function ($q) {
        return function output(file, content) {
            return $q(function (resolve, reject) {
                fs.outputFile(file, content, 'utf8', function (err) {
                    console.debug('write file', err, file, content);
                    err ? reject(err) : resolve();
                });
            })
        };
    });

    core.factory('remove', function ($q) {
        return function (dir) {
            return $q(function (resolve, reject) {
                fs.remove(dir, function (err) {
                    err ? reject(err) : resolve();
                });
            });
        }
    });

    core.factory('Virtual', function () {
        function Virtual(dir) {
            if (!dir) {
                throw new Error('filepath must be string');
            }

            this.path = dir.toLowerCase();
            this.exists = fs.existsSync(dir);

            if (this.exists) {
                this.configed = fs.existsSync(this.pkgfile) && fs.existsSync(this.cfgfile);
            }
        }

        Virtual.prototype = {
            pkg: null,
            cfg: null,
            get pkgfile() {
                return path.join(this.path, 'package.json');
            },
            get cfgfile() {
                return path.join(this.path, '.ui', 'grunt');
            }
        };

        return Virtual;
    });

    core.factory('Abstract', function ($q, Virtual, fs, output, $timeout) {
        "use strict";

        var _ = requireNode('underscore');
        var child_process = requireNode('child_process');

        function Abstract(dir) {
            Virtual.call(this, dir);

            this.pkg = fs.readJsonSync(this.pkgfile, {throws: false});
            this.cfg = fs.readJsonSync(this.cfgfile, {throws: false});

            if (!this.pkg || !this.cfg) {
                this.configed = false;
            }
        }

        Abstract.prototype = {
            __proto__: Virtual.prototype,
            get applicationPkgFile() {
                //todo must be implementation by sub class
                throw new Error('this function not implementation');
            },
            get applicationCfgFile() {
                //todo must be implementation by sub class
                throw new Error('this function not implementation');
            },
            get name() {
                return path.basename(this.path);
            },
            open() {
                var spaceReg = /\s/;
                var p = this.path;
                var cmd = 'explorer ' + spaceReg.test(p) ? `"${p}"` : p;
                gui.Shell.openItem(cmd);
                // gui.Shell.openItem(this.path);
            },
            getDefaultPkg() {
                return fs.readJsonSync(this.applicationPkgFile);
            },
            getDefaultCfg() {
                return fs.readJsonSync(this.applicationCfgFile);
            },
            writeToDisk() {
                var w = this;
                var cfgContent = this.pkg ? JSON.stringify(this.cfg, null, 4) : '';
                var pkgContent = this.cfg ? JSON.stringify(this.pkg, null, 4) : '';

                return $q(function (resolve, reject) {
                    $q.all(
                        output(w.cfgfile, cfgContent),
                        output(w.pkgfile, pkgContent)
                    ).then(function () {
                            $timeout(resolve, 100);
                        })
                        .catch(reject);
                });
            },
            exportGruntfile: function () {
                var w = this;
                "use strict";
                return $q(function (resolve) {
                    var gulp = requireNode('gulp');
                    var stream = gulp.src('.ui/Gruntfile.js')
                        .pipe(gulp.dest('./', {cwd: w.path}));

                    stream.on('end', function () {
                        resolve();
                    });
                })
            },
            runTask: function (taskName, stdout) {
                //todo 运行程序，输出到日志面板，并监听关闭事件
                "use strict";

                console.info('runTask', this.path);

                var me = this;
                var sandbox = path.resolve('gruntBuildFolder');
                var worker;

                function clearSandbox() {
                    return Promise.all([
                        fs.removeAsync(path.join(sandbox, '.ui')),
                        fs.removeAsync(path.join(sandbox, 'Gruntfile.js')),
                        fs.removeAsync(path.join(sandbox, 'package.json'))
                    ]);
                }

                function initSandboxEnvironment() {
                    return Promise.all([
                        fs.outputJsonAsync(path.join(sandbox, '.ui/grunt'), me.cfg),
                        fs.copyAsync('.ui/Gruntfile.js', path.join(sandbox, 'Gruntfile.js')),
                        fs.outputJsonAsync(path.join(sandbox, 'package.json'), me.pkg)
                    ]);
                }

                function createProccess() {
                    worker = child_process.spawn(
                        path.resolve('node.exe'),
                        [path.join(process.cwd(), 'app', './js/child.js'), taskName, me.path],
                        {
                            cwd: sandbox
                        });

                    stdout.open();

                    return Promise.resolve();
                }

                function listenProccess() {
                    return new Promise(function (resolve, reject) {
                        worker.stdout.on('data', function (data) {
                            var msg = data.toString().replace(/\[\d+m/gi, "");
                            stdout.write(msg);
                            console.log(msg);
                        });

                        worker.stderr.on('data', function (data) {
                            var msg = data.toString();
                            stdout.write(msg);
                            console.error(msg);
                            reject(msg);
                        });

                        worker.on('close', function (code) {
                            worker = null;
                            if (code === 0) {
                                //success

                            } else {
                                //error
                            }

                            resolve();
                        });

                        stdout.emitter.once('closed', function () {
                            worker && worker.kill('SIGINT');
                            reject('interrupt');
                        });
                    });
                }

                return new Promise(function (resolve, reject) {
                    console.info('run task', me.path);
                    clearSandbox()
                        .then(initSandboxEnvironment)
                        .then(createProccess)
                        .then(listenProccess)
                        .then(resolve)
                        .catch(reject);
                });
            },
            watch: function() {
                let gaze = requireNode('gaze');


            }
        };

        return Abstract;
    });

    core.factory('VirtualProject', function ($q, $timeout, Virtual, ensureDir, ensureFile, output) {

        function VirtualProject(dir) {
            Virtual.call(this, dir);
        }

        VirtualProject.prototype = {
            __proto__: Virtual.prototype,
            writeToDisk() {
                var w = this;
                var dir = w.path;
                var htmls = path.join(dir, 'htmls');
                var src = path.join(dir, 'src');
                var editorConfig = fs.readFileSync('.ui/.editorconfig');
                var editorConfigFile = path.join(dir, '.editorconfig');

                return $q(function (resolve, reject) {
                    $q.all(
                        ensureDir(htmls),
                        ensureDir(src)
                    ).then($q.all(
                            output(w.cfgfile, JSON.stringify(w.cfg, null, 4)),
                            output(w.pkgfile, JSON.stringify(w.pkg, null, 4)),
                            output(editorConfigFile, editorConfig)
                        ))
                        .then(function () {
                            $timeout(resolve, 100);
                        })
                        .catch(reject);
                });
            }
        };
        return VirtualProject;
    });

    core.factory('VirtualComponent', function ($q, $timeout, Virtual, Component, ensureDir, ensureFile, output) {
        function VirtualComponent(dir) {
            Virtual.call(this, dir);
        }

        VirtualComponent.prototype = {
            __proto__: Virtual.prototype,
            writeToDisk() {
                var w = this;
                var componentDir = w.path;
                var images = path.join(componentDir, 'images');
                var less = path.join(componentDir, 'less');
                var js = path.join(componentDir, 'js');
                var html = path.join(componentDir, 'html');

                return $q(function (resolve, reject) {
                    $q.all(
                        ensureDir(html),
                        ensureDir(images),
                        ensureDir(less),
                        ensureDir(js),
                        output(w.cfgfile, JSON.stringify(w.cfg, null, 4)),
                        output(w.pkgfile, JSON.stringify(w.pkg, null, 4))
                    ).then(function () {
                            $timeout(resolve, 100);
                        })
                        .catch(reject);
                });
            }
        };

        return VirtualComponent;
    });

    core.factory('Project', function ($q, Abstract, Component) {
        console.group('Project initializing');
        function Project(folder) {
            Abstract.call(this, folder);
        }

        Project.prototype = {
            __proto__: Abstract.prototype,

            get applicationPkgFile() {
                return path.resolve('./.ui/create.project.json');
            },
            get applicationCfgFile() {
                return path.resolve('./.ui/project.json');
            },
            get componentsDir() {
                return path.join(this.path, 'src');
            },
            get name() {
                return path.basename(this.path);
            },
            get childrenDirectories() {
                //获取项目的组件目录下所有目录
                var w = this;
                var componentsDir = w.componentsDir;

                if (!fs.existsSync(componentsDir)) {
                    return [];
                } else {
                    var filenames = fs.readdirSync(componentsDir);
                    filenames = filenames.filter(function (filename) {
                        var filepath = path.join(componentsDir, filename);
                        if (!filename.startsWith('.')) {
                            var stat = fs.statSync(filepath);
                            return stat.isDirectory();
                        }
                    });

                    return filenames.map(function (filename) {
                        return path.join(componentsDir, filename);
                    });
                }
            },
            get children() {
                var me = this;
                var componentsDir = this.componentsDir;
                var components = [];
                var files = me.childrenDirectories;

                if (files.length) {
                    files.forEach(function (p) {
                        var component = new Component(p);
                        console.log('children', component);
                        component.parent = me;
                        components.push(component);
                    });
                }

                return components;
            },
            remove() {

            }
        };

        console.groupEnd();

        return Project;
    });

    core.factory('Component', function ($q, Abstract) {

        function Component(filepath) {
            Abstract.call(this, filepath);
        }

        Component.prototype = {
            __proto__: Abstract.prototype,
            parent: null,
            get applicationPkgFile() {
                return fs.readJsonSync('.ui/create.module.json');
            },
            get applicationCfgFile() {
                return fs.readJsonSync('.ui/module.json');
            },
            get name() {
                return path.basename(this.path);
            },
            get lessResource() {
                "use strict";
                var dir = path.join(this.path, 'less');

                if (fs.existsSync(dir)) {
                    var filenames = fs.readdirSync(dir);
                    filenames = filenames.filter(function (f) {
                        return f.endsWith('.less');
                    });

                    var files = filenames.map(function (f) {
                        var absolute = path.join(dir, f);
                        return {
                            absolute: absolute,
                            relative: path.relative(dir, absolute)
                        }
                    });

                    return files;
                } else {
                    return [];
                }
            },

            get imageResource() {
                "use strict";
                var dir = path.join(this.path, 'images');
                if (fs.existsSync(dir)) {
                    var filenames = fs.readdirSync(dir);
                    filenames = filenames.filter(function (f) {
                        return f.endsWith('.jpg') || f.endsWith('.png') || f.endsWith('.gif') || f.endsWith('.ico');
                    });

                    var files = filenames.map(function (f) {
                        var absolute = path.join(dir, f);
                        return {
                            absolute: absolute,
                            relative: path.relative(dir, absolute)
                        }
                    });
                    return files;
                } else {
                    return [];
                }
            },
            get coffeeResource() {
                "use strict";
                var dir = path.join(this.path, 'coffee');
                if (fs.existsSync(dir)) {
                    var filenames = fs.readdirSync(dir);
                    filenames = filenames.filter(function (f) {
                        return f.endsWith('.coffee');
                    });

                    var files = filenames.map(function (f) {
                        var absolute = path.join(dir, f);
                        return {
                            absolute: absolute,
                            relative: path.relative(dir, absolute)
                        }
                    });
                    return files;
                } else {
                    return [];
                }
            },
            get jsResource() {
                "use strict";
                var dir = path.join(this.path, 'js');
                var files = [];
                if (fs.existsSync(dir)) {
                    var filenames = fs.readdirSync(dir);
                    filenames = filenames.filter(function (f) {
                        return f.endsWith('.js');
                    });

                    files = filenames.map(function (f) {
                        var absolute = path.join(dir, f);
                        return {
                            absolute: absolute,
                            relative: path.relative(dir, absolute)
                        }
                    });
                }

                var coffee = this.coffeeResource;

                return files.concat(coffee);
            },

            /*
             * @description remove from physical disk
             * @returns bool
             * */
            remove() {
                var w = this;
                var defer = $q.defer();
                fs.remove(w.path, function (err) {
                    err ? defer.reject(err) : defer.resolve();
                });
                return defer.promise;
            }
        };

        return Component;
    })
});
