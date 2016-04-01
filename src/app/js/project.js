"use strict";
define(function (require, exports, module) {
    require('layout');
    require('./core');

    var _ = requireNode('underscore');
    angular.module('project', ['layout', 'core'])
        .service('projectService', function ($q, VirtualProject, Project, globalParams, fs,$secondView) {
            var w = this;
            var _ = requireNode('underscore');
            var path = requireNode('path');
            var localDataFile = path.resolve('./.ui/localStorage.txt');
            var fileDelimiter = ";";

            function paths() {
                var result = [];
                if (fs.existsSync(localDataFile)) {
                    var localData = fs.readFileSync(localDataFile, 'utf8');
                    if (localData) {
                        result = localData.split(";");
                    }
                }

                return result;
            }

            this.collection = [];
            this.current = null;

            if(fs.existsSync(localDataFile)) {
                let cache = fs.readFileSync(localDataFile,'utf8', {throws: false});
                console.log('cache', cache);
                if(cache) {
                    this.collection = cache.split(fileDelimiter).map(function (item) {
                        return new Project(item);
                    }).filter(function (item) {
                        return item.exists;
                    });

                    if(this.collection.length) {
                        this.current = this.collection[0];
                    }
                }
            }


            Object.defineProperty(this, '$$files', {
                get () {
                    if (!w.collection) return [];

                    return w.collection.map(function (item) {
                        return item.path;
                    });
                }
            });

            this.getDefaultPkg = function () {
                return fs.readJsonSync('.ui/create.project.json');
            };

            this.getDefaultCfg = function () {
                return fs.readJsonSync('.ui/project.json');
            };

            this.add = function (file) {
                var obj = typeof file == 'string' ? new Project(file) : obj;

                if (obj.exists && obj.configed) {
                    let file = obj.path;
                    let files = w.$$files;

                    console.info('projectService.add', obj);

                    if (~files.indexOf(file)) {
                        console.info('projectService.add exists');
                        return $q.resolve();
                    } else {
                        w.collection.push(obj);
                        w.current = obj;

                        console.info('projectService.add save to disk', w.current, w.collection);

                        w.save();
                        return $q.resolve();
                    }
                } else {
                    globalParams.settingTarget = new VirtualProject(file);
                    $secondView.open('project.add');
                    return $q.resolve();
                }
            };

            this.remove = function (obj) {
                w.collection = w.collection.filter(function (item) {
                    return item.path != obj.path;
                });

                //更新current
                //如果删完了，current为空
                //如果删的只剩一个了，current唯一
                //如果把current删了，current指向剩下的第一个
                if (!w.collection.length) {
                    w.current = null;
                } else if (this.collection.length == 1) {
                    w.current = this.collection[0];
                } else if (this.current.path == obj.path) {
                    w.current = w.collection[0];
                }

                w.save();
                return $q.resolve();
            };

            this.save = function () {
                fs.writeFileSync(localDataFile, w.$$files.join(fileDelimiter), {flag:'w'});
            };
        })
        .controller("ProjectCollectionCtrl", function ($scope, projectService) {
            var $mainViewCtrl = $scope.$parent;

            $scope.collection = [];
            $scope.currentItem = null;

            $scope.select = function (item) {
                projectService.current = item;
            };

            $scope.$watchCollection(function () {
                return projectService.collection;
            }, function (value) {
                console.info('projectService.collection changed', arguments);
                $scope.collection = value;

                if (!value.length) {
                    $mainViewCtrl.showSubView('_blank');
                } else {
                    $mainViewCtrl.showSubView('components');
                }
            });

            $scope.$watch(function () {
                return projectService.current;
            }, function (newItem) {
                console.info('projectService.current changed', arguments);
                $scope.currentItem = newItem;
            });

        })
        .controller("ProjectCtrl", function ($scope, $secondView,$console, $notice, projectService, globalParams) {

            $scope.remove = function () {
                projectService.remove(this.project);
            };

            $scope.openSource = function () {
                this.project.open();
            };

            $scope.edit = function () {
                globalParams.settingTarget = this.project;
                $secondView.open('project.edit');
            };

            $scope.goSetting = function () {
                globalParams.settingTarget = this.project;
                $secondView.open('project.setting');
            };

            $scope.zip = function () {
                this.project.runTask('compress', $console);
            };

            $scope.test = function () {
                var current = this.project;
                if (!current.configed) {
                    if (!current.cfg) {
                        $notice('error', '此项目缺少配置信息，不能构建');
                        return;
                    }

                    if (!current.pkg) {
                        if (!$window.confirm('此项目缺少package.json，可能导致构建失败或未知的构建结果，确定构建吗？')) {
                            return;
                        }
                    }
                }
                this.project.runTask('debug', $console);
            };

            $scope['export'] = function () {
                this.project.exportGruntfile();

                $notice('success', '导出成功')
            };

            $scope.contextmenu = [{
                label: '打开项目目录',
                icon: 'icon-menu icon-open',
                click: 'openSource()'
            }, {
                label: '编辑项目信息',
                icon: 'icon-menu icon-edit',
                click: 'edit()'
            },
            // {
            //     label: '导出构建文件',
            //     icon: 'icon-menu icon-export',
            //     click: 'export()'
            // },
            {
                label: '项目调试',
                icon: 'icon-menu icon-debug',
                click: 'test()'
            }, {
                label: '导出项目',
                icon: 'icon-menu icon-zip',
                click: 'zip()'
            }, {
                label: '项目设置',
                icon: 'icon-menu icon-setting',
                click: 'goSetting()'
            }, {
                label: '移除项目',
                icon: 'icon-menu icon-remove',
                click: 'remove()'
            }];
        })
        .directive('project', function () {
            return {
                restrict: 'E',
                replace: true,
                templateUrl: "./views/projectItem.html",
                scope: {
                    project: '='
                },
                controller: 'ProjectCtrl',
                link: function (scope, element, attrs) {

                }
            };
        })
        .controller("ProjectAddCtrl", function ($scope, $secondView, projectService, globalParams, $notice) {

            var virtual = globalParams.settingTarget;
            if (!virtual) {
                throw new Error('globalParams.settingTarget is missing');
            }

            $scope.setting = angular.copy(projectService.getDefaultPkg());
            $scope.submit = function () {
                virtual.pkg = angular.copy($scope.setting);
                virtual.cfg = projectService.getDefaultCfg();

                console.debug('virtial data', virtual.pkg, virtual.cfg);

                virtual.writeToDisk()
                    .then(function () {
                        projectService.add(virtual.path);
                        $scope.cancel();
                    })
                    .catch(function (error) {
                        console.error(error);
                        $notice('error', error.message || error);
                    })
            };
            $scope.cancel = function () {
                $secondView.close();
            };
        })
        .controller("ProjectEditCtrl", function ($scope, $secondView, $notice, globalParams) {
            var target = globalParams.settingTarget;
            if (!target) {
                $notice('error', 'globalParams.settingTarget is missing');
                return;
            }

            //当前项目package.json缺损时，能正常展示
            $scope.setting = angular.copy(target.pkg || {});
            $scope.submit = function () {

                target.pkg = this.setting;
                target.writeToDisk()
                    .then(function () {
                        $scope.cancel();
                    })
                    .catch(function (err) {
                        $notice('error', err.message);
                    });
            };
            $scope.cancel = function () {
                $secondView.close();
            };
        })
        .controller("ProjectOperations", function ($scope, $console, $q, $notice, projectService) {
            "use strict";

            $scope.gruntTask = function (taskName) {
                if (!projectService.current) return;

                var current = projectService.current;
                if (!current.configed) {
                    if (!current.cfg) {
                        $notice('error', '此项目缺少配置信息，不能构建');
                        return;
                    }

                    if (!current.pkg) {
                        if (!$window.confirm('此项目缺少package.json，可能导致构建失败或未知的构建结果，确定构建吗？')) {
                            return;
                        }
                    }
                }

                //todo 绑定日志面板接口日志信息
                projectService.current.runTask(taskName, $console).then(function () {

                });
            };

            $scope.oneKeyBuild = function () {
                var current = projectService.current;
                if (!current) return;

                if (!current.configed) {
                    if (!current.cfg) {
                        $notice('error', '此项目缺少配置信息，不能构建');
                        return;
                    }

                    if (!current.pkg) {
                        if (!$window.confirm('此项目缺少package.json，可能导致构建失败或未知的构建结果，确定构建吗？')) {
                            return;
                        }
                    }
                }

                let children = current.children;
                let promise = $q.resolve();

                children.forEach(function (c, i) {
                    if(c.configed) {
                        promise = promise.then(function () {
                            return c.runTask('cmd', $console);
                        });
                    }
                });


                promise
                    .then(function () {
                        $console.write('all complete!');
                    })
                    .catch(function (error) {
                        $console.write(error);
                    });
            };

        })
        .directive('projectDrop', function ($notice, projectService) {
            return {
                link: function (scope, element, attrs) {
                    var fs = requireNode('fs');
                    element.on('drop', function (e) {
                        var files = e.originalEvent.dataTransfer.files;
                        //只允许拖拽文件夹，且一次只能拖拽一个
                        if (files.length == 1) {
                            var file = files[0];
                            var stat = fs.statSync(file.path);
                            if (!stat.isDirectory()) {
                                $notice('warning', '请拖拽文件夹');
                            } else {
                                //only add one folder
                                projectService.add(file.path);
                            }
                        } else {
                            $notice('warning', '一次只能添加一个文件');
                        }

                    });
                }
            }
        })
        .directive("projectAddExists", function (projectService, fileDialog) {
            return {
                link: function (scope, element) {
                    element.click(function (e) {
                        fileDialog.openDir(function (file) {
                            projectService.add(file);
                        });
                    });
                }
            };
        });
});
