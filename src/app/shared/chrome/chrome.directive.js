(function () {

    const remote = require('electron').remote;
    const shell = require('electron').shell;

    angular.module('LunaSound')
        .directive('chrome', function () {
            return {
                restrict: 'E',
                templateUrl: './shared/chrome/chrome.directive.html',
                controller: ChromeController,
                controllerAs: 'vm',
                bindToController: true
            }
        });

    function ChromeController() {
        var vm = this;

        vm.close = function () {
            var window = remote.getCurrentWindow();
            window.close();
        };

        vm.max = function () {
            var window = remote.getCurrentWindow();
            if (!window.isMaximized()) {
                window.maximize();
            } else {
                window.unmaximize();
            }
        };

        vm.min = function () {
            var window = remote.getCurrentWindow();
            window.minimize();
        };

        vm.dev = function () {
            require('electron').remote.getCurrentWindow().toggleDevTools();
        };

        vm.open = function (url) {
            shell.openExternal(url);
        }
    }
})();