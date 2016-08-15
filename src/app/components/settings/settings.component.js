(function(){
    'use strict'



    angular.module('LunaSound.Settings', [])
        .component('settings', {
            templateUrl: 'components/settings/settings.template.html',
            controller: settingsController
        });

    function settingsController(){

    }

    require('./lastfm/lastfm.setting.component.js');
    require('./musicdir/musicdir.setting.component.js');
})();