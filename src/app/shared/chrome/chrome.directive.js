(function(){

    const remote = require('electron').remote;

    angular.module('LunaSound')
        .directive('chrome', function(){
            return {
                restrict: 'E',
                templateUrl: './app/shared/chrome/chrome.directive.html',
                controller: ChromeController,
                controllerAs: 'vm',
                bindToController: true
            }
        });

    function ChromeController(){
        var vm = this;

        vm.close = function(){
            var window = remote.getCurrentWindow();
            window.close();
        };

        vm.max = function(){
            var window = remote.getCurrentWindow();
            if (!window.isMaximized()) {
                window.maximize();
            } else {
                window.unmaximize();
            }
        };

        vm.min = function(){
            var window = remote.getCurrentWindow();
            window.minimize();
        }
    }
})();