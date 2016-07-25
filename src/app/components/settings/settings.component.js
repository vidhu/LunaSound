(function(){
    'use strict'



    angular.module('LunaSound.Settings', [])
        .component('settings', {
            templateUrl: 'app/components/settings/settings.template.html',
            controller: settingsController
        });

    function settingsController(){

    }

    require('./lastfm/lastfm.setting.component.js');
})();