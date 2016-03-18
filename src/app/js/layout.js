/**
 * Created by wupeng on 2015/7/7.
 */
define(function () {
    var mo = angular.module('layout', []);

    mo.factory('fileDialog', [function () {
        var callDialog = function (dialog, callback) {
            dialog.addEventListener('change', function () {
                var result = dialog.value;
                callback(result);
            }, false);
            dialog.click();
        };

        var dialogs = {};

        dialogs.saveAs = function (callback, defaultFilename, acceptTypes) {
            var dialog = document.createElement('input');
            dialog.type = 'file';
            dialog.nwsaveas = defaultFilename || '';
            if (angular.isArray(acceptTypes)) {
                dialog.accept = acceptTypes.join(',');
            } else if (angular.isString(acceptTypes)) {
                dialog.accept = acceptTypes;
            }
            callDialog(dialog, callback);
        };

        dialogs.openFile = function (callback, multiple, acceptTypes) {
            var dialog = document.createElement('input');
            dialog.type = 'file';
            if (multiple === true) {
                dialog.multiple = 'multiple';
            }
            if (angular.isArray(acceptTypes)) {
                dialog.accept = acceptTypes.join(',');
            } else if (angular.isString(acceptTypes)) {
                dialog.accept = acceptTypes;
            }
            callDialog(dialog, callback);
        };

        dialogs.openDir = function (callback) {
            var dialog = document.createElement('input');
            dialog.type = 'file';
            dialog.nwdirectory = 'nwdirectory';
            callDialog(dialog, callback);
        };

        return dialogs;
    }]);

    mo.provider('$globalPanel', function () {

        this.$get = function () {

            return {
                instance: function (element) {
                    return {
                        hideCls: 'help-hidden',
                        element: element,
                        show: function () {
                            this.element.removeClass(this.hideCls);
                        },
                        hide: function () {
                            this.element.addClass(this.hideCls);
                        }
                    }
                }
            }

        }
    });

    mo.provider('$console', function ($injector, $globalPanelProvider) {
        "use strict";

        var me = this;

        let events = requireNode('events');
        let emitter = new events.EventEmitter();

        this.element = angular.element('#console');
        this.elementBody = this.element.children().eq(0);
        this.element.on('click', '.overlay-close', close);

        //var $injector = angular.injector();
        //var $globalPanel = $injector.get("$globalPanel");
        var panel = $globalPanelProvider.$get().instance(this.element);


        function close() {
            hide();
            clearLines();
        }

        function clearLines() {
            me.elementBody.empty();
        }

        function show() {
            panel.show();
        }

        function hide() {
            panel.hide();
        }

        this.$get = function () {

            return {
                open: function () {
                    show();
                    emitter.emit('opened');
                },
                write: function (line) {
                    var text = me.elementBody.text();
                    me.elementBody.text(text + line);
                    me.elementBody.scrollTop(me.elementBody.height(), 100);
                },
                close: function () {
                    close();
                    emitter.emit('closed');
                },
                emitter: emitter
            };
        };

    });

    /**
     * @module layout.notice.$notice
     * @param {string} type
     * @param {string} content
     * @example
     * $notice("success","...");
     * $notice("error","...");
     * $notice("info","...");
     * $notice("warning","...");
     */
    mo.factory('$notice', function ($templateCache, $timeout) {

        var template = `<div class="notice">
                    <div class="notice-icon"></div>
                    <div class="notice-main"></div>
                </div>`;

        return function (type, content) {
            var element = angular.element(template);
            element.addClass('notice-' + type);
            element.find('.notice-main').html(content);
            angular.element('body').append(element);

            $timeout(function () {
                element.fadeOut(element.remove.bind(element));
            }, 1500);

        };
    });

    mo.service('FsStat', function () {
        var fs = require('fs');

        this.exists = function (file) {
            return fs.existsSync(file);
        };

        this.isDirectory = function (file) {
            try {
                var stat = fs.statSync(file);
                return stat.isDirectory();
            } catch (e) {
                return false;
            }
        };

        this.isFile = function(file) {
            try {
                var stat = fs.statSync(file);
                return stat.isFile();
            } catch (e) {
                return false;
            }
        }
    });

    mo.directive('dropDirectory', function (FsStat, $parse, $timeout) {
        return {
            restrict: 'A',
            require:'?ngModel',
            priority: 100,
            link: function(scope, element, attr, ngModel) {

                element.on('drop', function (e) {
                    e.preventDefault();
                    e.stopPropagation();

                    var files = e.originalEvent.dataTransfer.files;
                    if(files.length == 1) {
                        var file = files[0];
                        if(FsStat.isDirectory(file.path)) {
                            if(ngModel) {
                                $parse(attr.ngModel).assign(scope, file.path);
                                $timeout(function () {
                                    if (ngModel) {
                                        ngModel.$setViewValue(file.path);
                                    }
                                });
                            } else {
                                element.val(file.path);
                            }
                        }
                    }
                });
            }
        }
    });

    mo.factory('Tray', function () {
        var win = gui.Window.get();

        function show() {
            win.show();
            win.focus();
        }

        function close() {
            gui.App.quit();
            //win.close();
        }

        var tray = new gui.Tray({
            title: "UI开发平台",
            tooltip: "UI开发平台",
            icon: "app/resources/images/ui.png"
        });

        tray.menu = new gui.Menu();
        tray.menu.append(new gui.MenuItem({
            label: "打开主面板",
            click: show
        }));
        tray.menu.append(new gui.MenuItem({
            label: "全局设置",
            click: function() {
                console.info('click');
                var _w = gui.Window.get();
                _w.show();
                _w.focus();

                //解决页面刷新后，dom操作不生效的问题
                //猜测可能是刷新后，window对象起了一些变化，比如刷新后new了一个新window，之前的window做为镜像保存在内存里了，之后dom操作只会操作镜像的dom，所以没有变化
                //具体原因不明
                //这里每次都根据gui获取当前最新的window dom对象和该对象下的angular实例，防止上述情况
                var DomWindow =_w.window;
                var $injector = DomWindow.angular.injector(['app']);

                $injector.invoke(function ($secondView) {
                    $secondView.open('setting.global');
                });
            }
        }));
        tray.menu.append(new gui.MenuItem({
            label: "退出",
            click: close
        }));
        tray.on('click', show);
        return tray;
    });

    mo.directive('header', function (Tray) {
        var _window = window.gui.Window.get();
        return {
            restrict: 'E',
            link: function (scope, element, attrs) {
                element.on('click', '[role="minimize"]', function(e) {
                    e.preventDefault();
                    _window.hide();
                });

                element.on('click', '[role="maximize"]', function(e) {
                    e.preventDefault();

                    var $a = angular.element(this);
                    var $icon = $a.find('.icon-control');

                    $icon.hasClass('icon-maximize') ? _window.maximize() : _window.unmaximize();
                });

                element.on('click', '[role="close"]', function (e) {
                    e.preventDefault();
                    gui.App.quit();
                    //_window.close();
                });

                _window.on('maximize', function () {
                    element.find('.icon-maximize').removeClass('icon-maximize').addClass('icon-restore');
                });

                _window.on('unmaximize', function () {
                    element.find('.icon-restore').removeClass('icon-restore').addClass('icon-maximize');
                });
            }
        }
    });

    mo.directive("contextmenu", function ($rootScope, $compile, $parse, $window) {
        var fs = requireNode('fs-extra');
        var path = requireNode('path');
        var template = `<div class="menu menu-context">
            <ul>
                <li ng-repeat="m in contextmenu">
                    <a href="javascript:;" ng-click="fire(m.click)">
                        <i class="{{m.icon}}"></i>
                        <span ng-bind="m.label"></span>
                    </a>
                </li>
            </ul>
        </div>`;

        var menu;

        function hideMenu() {
            if (!menu) return;

            menu.addClass('help-hidden');

        }

        return function (scope, element) {

            if (!scope.contextmenu || !scope.contextmenu.length) return;

            scope.fire = function (clickFireName) {
                var fn = $parse(clickFireName)(scope);

                if (fn && angular.isFunction(fn)) fn();
            };

            var panel = $compile(angular.element(template))(scope);

            panel.css({
                position: 'absolute',
                top: 0,
                left: 0,
                zIndex: 9999
            });

            panel.appendTo('body');
            hide();

            element.on('contextmenu', function (e) {

                e.preventDefault();
                e.stopPropagation();
                show();
                reposition(e);

                bindHideEvent(panel);
            });

            function bindHideEvent() {
                angular.element('body').click(hide);
            }

            function show() {
                if (menu) hideMenu();

                menu = panel;
                panel.removeClass('help-hidden');
            }

            function hide() {
                panel.addClass('help-hidden');
                angular.element('body').off('click', hide);
            }

            function reposition(e) {
                //定义top left和箭头方向
                var el = panel;
                var offsetX = 0;
                var offsetY = 0;
                var wid = el.outerWidth(true);
                var height = el.outerHeight(true);

                var winWid = angular.element($window).width();
                var winHeight = angular.element($window).height();

                var posX = 'right',
                    posY = 'bottom';

                if (winWid - e.pageX <= wid + offsetX) posX = 'left';
                if (winHeight - e.pageY <= height + offsetY) posY = 'top';

                var left = (posX == 'right' ? e.pageX + offsetX : e.pageX - offsetX - wid) + 'px';
                var top = (posY == 'bottom' ? e.pageY + offsetY : e.pageY - offsetY - height) + 'px';

                el.css({
                    top: top,
                    left: left
                });
                // el.removeClass().addClass('tooltip').addClass(posY + '-' + posX);
            }

        }
    });


});
