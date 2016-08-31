(function () {
    'use strict'
    const shell = require('electron').shell;
    const path = require('path');
    const fs = require('fs');
    const packageJson = JSON.parse(fs.readFileSync(path.join(ENV.BASE_DIR, 'package.json')));

    angular.module('LunaSound')
        .factory('Update', updateService);

    function updateService($rootScope, $q, $http, Notification) {

        var currentVersion = packageJson.version;

        var API = {
            isUpdateAvailable: function () {
                var completedDeferred = $q.defer();

                $http.get('https://api.github.com/repos/vidhu/LunaSound/releases')
                    .then(function(res){
                        var latest = res.data[0];
                        var latestVersion = res.data[0].tag_name;

                        if(latestVersion.indexOf(currentVersion) == -1){
                            completedDeferred.resolve(true);
                        }else{
                            completedDeferred.resolve(false);
                        }


                    });

                return completedDeferred.promise;
            },
            notify: function(){
                $rootScope.openLinkExternal = shell.openExternal;

                Notification.primary({
                    templateUrl: "services/update/update.template.html",
                    scope: $rootScope
                });

            }
        };

        return API;
    }
})();