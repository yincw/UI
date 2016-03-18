"use strict";
define(function (require, exports, module) {
    require("./core");
    angular.module('submodule', ['core','angularSpinner'])
        .service('componentService', function(fs) {
            this.getDefaultPkg = function () {
                var result = fs.readJsonSync('.ui/create.module.json');
                var global = fs.readJsonSync('.ui/global.json', {throws: false});

                if (global) {
                    var c = {};
                    c[global['zw']] = global['name'];
                    angular.extend(result['developer'], c);
                }

                return result;
            };

            this.getDefaultCfg = function () {
                return fs.readJsonSync('.ui/module.json');
            };
        })
        .controller("ComponentCollectionCtrl", function ($scope, projectService) {

            $scope.$componentFilesScope = null;
            $scope.selectedIndex = -1;

            $scope.onComponentSelected = function (index) {
                if ($scope.selectedIndex === index) {
                    $scope.selectedIndex = -1;
                } else {
                    $scope.selectedIndex = index;
                }
            };

            $scope.$on('$component:changed', function () {
                $scope.collection = projectService.current ? projectService.current.children : [];
                console.info('$component.changed triggered', $scope.collection);
            });

            $scope.$watch(function () {
                return projectService.current;
            }, function (newItem) {
                console.log('ComponentColeectionCtrl projectService.current changed', arguments);
                $scope.$componentFilesScope && $scope.$componentFilesScope.close();
                $scope.selectedIndex = -1;
                $scope.collection = newItem ? newItem.children : [];
            });

            $scope.$watch('selectedIndex', function (value) {
                console.log('ComponentColeectionCtrl selectedIndex changed', arguments);
                if(!$scope.$componentFilesScope) return;

                if(value == -1) {
                    $scope.$componentFilesScope.close();
                } else {
                    $scope.$componentFilesScope.open($scope.collection[value]);
                }
            });
        })
        .controller('ComponentCtrl', function ($scope, $rootScope,$secondView, $console, $window, $notice, globalParams) {
            $scope.remove = function () {
                if (confirm('移除会删除当前文件，确定删除吗？')) {
                    $scope.component.remove().then(function () {
                        $rootScope.$broadcast('$component:changed');
                    });
                }
            };

            $scope.openSource = function () {
                this.component.open();
            };

            $scope.goPackage = function () {
                globalParams.component = this.component;
                $secondView.open('component.edit');
            };

            $scope.task = function (taskName) {
                if(!this.component.configed) {
                    if(!this.component.cfg) {
                        $notice('error', '此组件缺少配置信息，不能构建');
                        return;
                    }

                    if(!this.component.pkg) {
                        if(!$window.confirm('此组件缺少package.json，可能导致构建失败或未知的构建结果，确定构建吗？')) {
                            return;
                        }
                    }
                }
                this.component.runTask(taskName, $console);
            };

            $scope.contextmenu = [
                {
                    label: '打开组件目录',
                    icon: 'icon-menu icon-open',
                    click: 'openSource()'
                }, {
                    label: '编辑组件信息',
                    icon: 'icon-menu icon-edit',
                    click: 'goPackage()'
                }, {
                    label: 'JS构建',
                    icon: 'icon-menu icon-build-js',
                    click: 'task("cmd")'
                }, {
                    label: '移除组件',
                    icon: 'icon-menu icon-remove',
                    click: 'remove()'
                }
            ];

        })
        .controller("ComponentFilesCtrl", function ($scope) {
            //todo fileObj struct: string:relative string:absolute
            var curObj;

            $scope.$parent.$componentFilesScope = $scope;
            $scope.opened = false;
            $scope.less = [];
            $scope.images = [];
            $scope.js = [];
            $scope.selectedTab = 'less';

            $scope.selectTab = function (tab) {
                this.selectedTab = tab;
                this.refresh();
            };
            $scope.open = function (componentObj) {
                this.opened = true;

                curObj = componentObj;
                this.less = curObj.lessResource;
                this.images = curObj.imageResource;
                this.js = angular.copy(curObj.jsResource);
            };

            $scope.close = function () {
                this.opened = false;
            };

            $scope.openFile = function (file) {
                let path = requireNode('path');

                gui.Shell.openItem(path.dirname(file));
            };

            $scope.refresh = function (t) {
                this.less = curObj.lessResource;
                this.images = curObj.imageResource;
                this.js = angular.copy(curObj.jsResource);
            };

            $scope.$on('$destroy', function () {
                curObj = null;
            });
        })
        .directive("component", function () {
            return {
                restrict: "A",
                replace: true,
                templateUrl: './views/componentItem.html',
                scope: {
                    component: '='
                },
                controller: 'ComponentCtrl',
                link: function (scope, element) {
                }
            }
        })
        .controller("ComponentImportCtrl", function($scope, $notice, $log, projectService, Component, ImportComponentService, $rootScope,$secondView) {
            var IMPORTTYPE_PROJECT = 'project';
            var IMPORTTYPE_CUSTOM = 'custom';

            $scope.importType = IMPORTTYPE_PROJECT;
            $scope.projectSrc = '';
            $scope.projectComponents = [];
            $scope.customSrc = [{path:''}];
            $scope.selectedProjectComponents = [];
            $scope.toggleAll = undefined; //项目组件全选

            $scope.submit = function () {
                if(this.importType == IMPORTTYPE_PROJECT) {
                    this.importFromProject();
                } else if(this.importType == IMPORTTYPE_CUSTOM) {
                    this.importFromCustom();
                } else {
                    throw new Error(`unknown importType: ${this.importType}`);
                }
            };

            $scope.importFromProject = function () {
                if(!$scope.selectedProjectComponents.length) return;
                this.importComponents(this.selectedProjectComponents);
            };

            $scope.importFromCustom = function () {
                var src = $scope.customSrc.filter(function (item) {
                    return !!item.path.trim();
                }).map(function (item) {
                    return item.path.toLowerCase();
                });

                //去重
                var files = [];
                src.forEach(function (item) {
                    if (files.indexOf(item) == -1) files.push(item);
                });


                $log.info('importFromCustom', files);
                this.importComponents(files);
            };

            $scope.importComponents = function (files) {
                var components = files.map(function (item) {
                    return new Component(item);
                });

                ImportComponentService.importMany(components, projectService.current)
                    .then(function () {
                        $scope.close();
                        $notice('success', '导入成功');
                        //更新组件列表
                        $rootScope.$broadcast('$component:changed');
                    })
                    .catch(function (err) {
                        $notice('error', err.message);
                    });
            };

            $scope.close = function () {
                $secondView.close();
            };

            $scope.scan = function () {
                console.info('import scan start', this.projectSrc);
                var src = this.projectSrc;
                if($scope.importType != IMPORTTYPE_PROJECT) return;
                if(!src) return;

                ImportComponentService.scanProjectComponents(src)
                    .then(function (components) {
                        $log.info('scan resolved', components);
                        $scope.$apply(function () {
                            $scope.projectComponents = angular.copy(components);
                        });

                    })
                    .catch(function (err) {
                        $notice('error', err.message);
                    });
            };

            $scope.toggleProjectComponent = function (file) {
                var index = this.selectedProjectComponents.indexOf(file);
                index > -1 ? this.selectedProjectComponents.splice(index, 1) : this.selectedProjectComponents.push(file);
            };

            $scope.$watch('projectSrc', function (newSrc, oldSrc) {
                $log.info('projectSrc changed', newSrc, oldSrc);
                $scope.projectComponents = [];
                $scope.scan();
            });

            $scope.$watch('importType', function (newValue, oldValue) {
                $log.info('importType changed', newValue, oldValue);
                if(newValue == oldValue) return;
                if(oldValue == IMPORTTYPE_PROJECT) {
                    $scope.projectSrc = '';
                    $scope.projectComponents = [];
                } else if(oldValue == IMPORTTYPE_CUSTOM) {
                    $scope.customSrc = [{path:''}];
                }

                $scope.selectedProjectComponents = [];
            });

            $scope.$watch('toggleAll', function (newValue, oldValue) {
                $log.info('toggleAll changed', newValue, oldValue);

                $scope.selectedProjectComponents = [];

                if(newValue) {
                    $scope.projectComponents.forEach(function (c) {
                        $scope.selectedProjectComponents.push(c.path);
                    });
                }
            });

            $scope.$watchCollection('selectedProjectComponents', function (item) {
                $log.info(item);
            });

        })
        .service('ImportComponentService', function($q, Project, $log) {
            var path = requireNode('path');
            var fs = requireNode('fs-extra');

            this.scanProjectComponents = function (src) {
                return new Promise(function (resolve, reject) {
                    var item = new Project(src);

                    $log.info('scanProjectComponents');
                    if (!item.exists) {
                        $log.warn('item not exists');
                        throw new Error(`path not exists: ${src}`);
                    }

                    $log.info('resolved');
                    resolve(item.children);
                });
            };

            this.importOne = function (component, project) {
                return new Promise(function (resolve, reject) {
                    //check if component name exists
                    if(!component.exists) {
                        throw new Error(`component not exists:${component.path}`);
                    }

                    var dir = component.path;

                    //当前程序所在的路径不能做为组建导入
                    var applicationDir = process.cwd();
                    if (applicationDir.toLowerCase() == dir) {
                        throw new Error('此路径不能作为组件目录');
                    }

                    //当前项目的组件不能导入
                    var basename = path.basename(dir);
                    var dest = path.join(project.componentsDir, basename).toLowerCase();
                    if (dest == dir) {
                        resolve();
                        return;
                    }

                    ////当前项目已存在此文件不能导入
                    if (fs.existsSync(dest)) {
                        throw new Error('此组件或文件夹已存在');
                    }

                    fs.copy(dir, dest, function (err) {
                        if (err) {
                            if(fs.existsSync(dest)) {
                                //回滚
                                fs.remove(dest, function (err2) {
                                    reject(err2 || err);
                                });
                            } else {
                                reject(err);
                            }
                        } else {
                            resolve();
                        }
                    });
                });
            };

            this.importMany = function (components, project) {
                var w = this;
                var promises = components.map(function (item) {
                    return w.importOne(item, project);
                });

                return $q.all(promises);
            };
        })
        .directive("customImportAdd", function() {
            return {
                restrict:'A',
                link: function(scope, element) {
                    element.click(function () {
                        scope.$apply(function() {
                            scope.customSrc.push({path:''});
                        });
                    });
                }
            }
        })
        .directive('customImportRemove', function() {
            return {
                restrict:"A",
                link: function(scope, element, attrs) {
                    element.click(function () {
                        var index = element.closest('.row').index();
                        scope.$apply(function() {
                            scope.customSrc = scope.customSrc.splice(index, 1);
                            console.log(scope.customSrc, index);
                        });
                    });
                }
            }
        })
        .controller("ComponentAddCtrl", function ($scope, $rootScope, $secondView, projectService,componentService, VirtualComponent, $notice, $timeout) {
            //update or create ？
            let path = requireNode('path');
            let fs = requireNode('fs-extra');

            $scope.setting = componentService.getDefaultPkg();
            //新增组件时，组件的兼容性继承项目的兼容设置

            if(!projectService.current) {
                $notice('error', '没有选择任何项目');
                return;
            }

            if(!projectService.current.pkg) {
                $notice("error", '当前项目缺少package.json信息');
                return;
            }

            if(!projectService.current.pkg.compatibility) {
                $notice('warning', '检测当前项目未设置兼容性,可能导致不能功能不能正常使用');
            } else {
                $scope.setting.compatibility = projectService.current.pkg.compatibility;
            }

            let hint = JSON.parse(fs.readFileSync('.ui/hint.json'), 'utf8');
            let hintKeys = Object.keys(hint);
            $scope.icons = hintKeys.map(function (k) {
                return {name: k, css: hint[k]};
            });

            $scope.submit = function () {
                let current = projectService.current;
                let file = path.join(current.componentsDir, this.setting.name);
                let component = new VirtualComponent(file);

                fs.stat(file, function (err, stat) {
                    if (!err) {
                        $notice('error', '添加失败,已存在此名称的组件');
                    } else {
                        component.pkg = angular.copy($scope.setting);
                        component.cfg = componentService.getDefaultCfg();

                        console.log('component add ctrl setting', component, component.pkg, $scope.setting);

                        component.writeToDisk()
                            .then(function () {
                                $timeout(function () {
                                    $rootScope.$broadcast('$component:changed');
                                    $scope.cancel();
                                });
                            })
                            .catch(function (err) {
                                $notice('error', err.message);
                            });

                    }
                });
            };

            $scope.cancel = function () {
                $secondView.close();
            };
        })
        .controller('ComponentEditCtrl', function ($scope, $rootScope, $secondView, Component, $notice, globalParams, $timeout) {
            let component = globalParams.component;
            let path = requireNode('path');
            let fs = requireNode('fs-extra');

            //当组件package.json信息缺失时，能正常显示
            $scope.setting = angular.copy(component.pkg || {});

            let hint = JSON.parse(fs.readFileSync('.ui/hint.json'), 'utf8');
            let hintKeys = Object.keys(hint);
            $scope.icons = hintKeys.map(function (k) {
                return {name: k, css: hint[k]};
            });

            let originSetting = $scope.setting;
            $scope.submit = function () {
                let name = component.pkg.name;

                if ($scope.setting.name != name) {
                    //文件名称变动，修改文件夹名称
                    var dirname = path.dirname(component.path);
                    var newDir = path.join(dirname, $scope.setting.name);

                    if (fs.existsSync(newDir)) {
                        $notice('error', '已存在此名称的组件，请重新命名');
                    } else {
                        fs.rename(component.path, newDir, function (err) {
                            if (err) {
                                $notice('error', `修改组件名称失败:${err.message}`);
                            } else {
                                var newComponent = new Component(newDir);
                                newComponent.pkg = angular.copy($scope.setting);
                                newComponent.writeToDisk()
                                    .then(function () {
                                        $scope.cancel();
                                        $notice('success', '修改成功');
                                        $timeout(function () {
                                            $rootScope.$broadcast('$component:changed');
                                        });
                                    })
                                    .catch(function (err) {
                                        $notice('error', err.message);
                                        console.error(err);
                                    });
                            }
                        });
                    }
                } else {
                    //名称未改动，直接修改
                    component.pkg = angular.copy(this.setting);
                    component.writeToDisk()
                        .then(function () {
                            $scope.cancel();
                            $notice('success', '修改成功');
                            $timeout(function () {
                                $rootScope.$broadcast('$component:changed');
                            });
                        })
                        .catch(function (err) {
                            $notice('error', err.message);
                            console.error(err);
                        });
                }
            };
            $scope.cancel = function () {
                $secondView.close();
            }
        })
        .directive("focusActive", function () {
            return {
                restrict: "A",
                controller: function () {
                    var className = 'active';
                    this.targetElement = null;

                    this.blur = function () {
                        this.targetElement.removeClass(className);
                    };

                    this.focus = function () {
                        this.targetElement.addClass(className);
                    };
                },
                link: function (scope, element, attrs, ctrl) {
                    ctrl.targetElement = element;
                }
            }
        })
        .directive("focusActiveTrigger", function () {
            return {
                restrict: "A",
                require: '?^focusActive',
                link: function (scope, element, attrs, focusActive) {
                    if (!focusActive) return;

                    element.on('focus', function () {
                        focusActive.focus();
                    });

                    element.on('blur', function () {
                        focusActive.blur();
                    });
                }
            }
        })
        .filter('componentFilter', function () {
            return function (collection, text) {
                if (!text) return collection;
                if (angular.isArray(collection)) {
                    return collection.filter(function (item) {
                        return (item.path && item.path.includes(text)) || (item.name && item.name.includes(text));
                    });
                } else {
                    return [];
                }
            }
        })
        .directive('componentCreate', function ($secondView, projectService) {
            return {
                restrict: 'A',
                link: function (scope, element) {

                    element.on('click', function () {
                        if (!projectService.current) {
                            $notice('info', '请选择项目');
                            return;
                        }
                        $secondView.open('component.add');
                    });

                }
            }
        })
        .directive('componentImport', function ($secondView) {
            return {
                restrict: 'A',
                link: function (scope, element) {
                    element.click(function () {
                        $secondView.open('import');
                    });
                }
            }
        })
        .directive('componentReload', function ($rootScope, $notice) {
            return {
                restrict: 'A',
                link: function (scope, element) {
                    element.click(function () {
                        $rootScope.$apply(function () {
                            $rootScope.$broadcast('$component:changed');
                            $notice('success', '已刷新');
                        });
                    })
                }
            }
        })

});
