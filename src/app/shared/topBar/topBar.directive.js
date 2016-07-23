(function () {
    'use strict'

    angular
        .module('LunaSound')
        .directive('topBar', topBar);

    function topBar() {
        return {
            restrict: 'E',
            templateUrl: 'app/shared/topBar/topBar.template.html',
            controller: function ($scope) {
                $scope.back = function () {
                    window.history.back();
                };

                $scope.forward = function () {
                    window.history.forward();
                };
            }
        }
    }
})();