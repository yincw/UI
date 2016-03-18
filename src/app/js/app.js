define(function (require, exports, module) {
    "use strict";
    require('./layout');
    require('./project');
    require('./component');
    //require('./core');


    angular.module('app', ['ui.router', 'project', 'submodule', 'layout'])
        .config(function () {

        })
        .constant('globalParams', {
            project: null,//切换到编辑项目信息，新建项目时，需要用到
            component: null, //编辑组件信息时用到
            settingTarget: null //打开设置面板时用到，
        })
        .service('GlobalService', function () {
            console.log('GlobalService initializing');
            var fs = requireNode('fs-extra');
            var path = requireNode('path');
            var filename = '.ui/global.json';

            this.data = {};

            this.readFromDisk = function () {
                var file = '.ui/global.json';

                if (!fs.existsSync(file)) {
                    file = '.ui/global_bak.json';
                    fs.copySync(file, '.ui/global.json');
                }

                var content = fs.readFileSync(file, 'utf8');
                this.data = JSON.parse(content);
            };

            this.writeToDisk = function () {
                var file = '.ui/global.json';
                var d = this.data || {};
                fs.writeFileSync(filename, JSON.stringify(d, null, 4), 'utf8');
            };

            console.log('GlobalService initialized');
        })
        .controller('MainViewCtrl', function ($scope) {
            var subViews = {
                '_blank': './views/project/_blank.html',
                'components': './views/list.html'
            };

            $scope.subView = '';
            $scope.showSubView = function (viewName) {
                var sub = subViews[viewName];
                if (sub) {
                    $scope.subView = sub;
                } else {
                    throw new Error(`unknown viewName:${viewName}`);
                }
            };
        })
        .service('$secondView', function ($rootScope, $compile, $templateCache, $q, $http) {
            console.info('$secondView init');
            var $body = angular.element(document.body);
            var mainView = $body.children('[role="main"]');
            var secondView = $body.children('[role="secondary"]');
            var scope;

            mainView.show();
            secondView.hide();

            var views = {
                'project.add': './views/project/add.html',
                'project.edit': './views/project/edit.html',
                'project.setting': './views/setting.html',
                'project.package': './views/package.html',
                'component.edit': './views/component/edit.html',
                'component.add': './views/component/add.html',
                'component.setting': './views/component/setting.html',
                'setting.global': 'views/setting.global.html',
                'import': 'views/import.html'
            };

            function fetchView(url) {
                console.info('fetchView', url);
                var defer = $q.defer();
                var html = $templateCache.get(url);
                if (html) {
                    defer.resolve(html);
                } else {
                    $http.get(url)
                        .success(function (data) {
                            $templateCache.put(url, data);
                            console.info('$http finish', arguments)
                            defer.resolve(data);
                        })
                }

                return defer.promise;
            }

            function compileAndAttactToDocument(html) {
                console.info('compile and attach', html);
                if (scope) {
                    scope.$destroy();
                }
                var linkFn = $compile(html);
                var newScope = $rootScope.$new();
                var element = linkFn($rootScope);


                scope = newScope;
                secondView.empty().append(element);
                return $q.resolve();
            }

            this.open = function (viewName) {
                console.debug('secondview::open', viewName);
                if (viewName) {
                    this.navigate(viewName).then(function () {
                        mainView.hide();
                        secondView.show();
                    });
                }
            };

            this.navigate = function (viewName) {
                console.debug("secondview::navigate", viewName);
                var Q = $q.defer();
                var view = views[viewName];
                if (view) {

                    fetchView(view)
                        .then(compileAndAttactToDocument)
                        .then(function() {
                            Q.resolve();
                        })
                        .catch(function (err) {
                            Q.reject(err);
                            console.error(err);
                        });
                } else {
                    throw new Error(`MainViewPagesCtrl:unknown viewName ${viewName}`);
                }

                return Q.promise;
            };

            this.close = function () {
                mainView.show();
                secondView.hide();
            };

            console.info('$secondView init end');
        })
        .controller('SettingCollectionCtrl', function ($scope) {
            $scope.name = 'sprite';
            $scope.selectSubView = function (name) {
                this.name = name;
            };

            $scope.template = function () {
                return "./views/setting." + this.name + ".html";
            };
        })
        .controller('SettingCtrl', function ($scope, $secondView, $notice, globalParams) {
            let target = globalParams.settingTarget;
            console.debug('SettingCtrl', target);
            $scope.setting = angular.copy(target.cfg[$scope.name]);

            $scope.submit = function () {

                let result = {};
                result[this.name] = this.setting;
                target.cfg = angular.extend({}, target.cfg, result);

                target.writeToDisk()
                    .then(function () {
                        $scope.cancel();
                    })
                    .catch(function (err) {
                        $notice('error', err.message);
                        console.error(err);
                    });
            };

            $scope.cancel = function () {
                $secondView.close();
            }
        })
        .controller('GlobalSettingCtrl', function ($scope, GlobalService, $secondView) {

            $scope.data = angular.copy(GlobalService.data);
            $scope.submit = function () {
                GlobalService.data = this.data;
                GlobalService.writeToDisk();
                this.cancel();
            };

            $scope.cancel = function () {
                $secondView.close();
            };
        })
        .directive('setting', function () {
            return {
                scope: {
                    name: '&'
                },
                controller: 'SettingCtrl',
                link: function () {

                }
            };
        })
        .run(function ($rootScope, GlobalService, Tray) {
            GlobalService.readFromDisk();
        });


});
