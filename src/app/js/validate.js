define(function (require, exports, module) {
    "use strict";
    angular.module("validate", [])
        .directive("noBackslash", function () {
            return {
                require: '?ngModel',
                link: function (scope, element, attrsm, ngModel) {
                    if (!ngModel) return;

                    function trimBackslash(value) {
                        if (!value) return value;

                        return value.replace(/\\/g, '');
                    }

                    ngModel.$parsers.push(function (viewValue) {
                        var transformedValue = trimBackslash(viewValue);
                        if (transformedValue != viewValue) {
                            ngModel.$setViewValue(transformedValue);
                            ngModel.$render();
                        }

                        return transformedValue;
                    })
                }
            }
        })
        .directive("noChinese", function () {
            return {
                require: '?ngModel',
                link: function (scope, element, attrs, ngModel) {
                    if (!ngModel) return;

                    var chinese = /[\u2E80-\uFE4F]/;
                    var validator = function (value) {
                        if (!ngModel.$isEmpty(value) && chinese.test(value)) {
                            ngModel.$setValidity("nochinese", false);
                        } else {
                            ngModel.$setValidity("nochinese", true);
                        }

                        return value;
                    }

                    ngModel.$formatters.push(validator);
                    ngModel.$parsers.unshift(validator);
                }
            }
        });
});
