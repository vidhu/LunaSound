(function(){
    'use strict'
    const path = require('path');
    const config = require(path.join(ENV.BASE_DIR, 'core/config.js'));

    angular.module('LunaSound.Settings')
        .factory('settings', settingsService);

    function settingsService(){


        var API = {
            getSettings: function(){
                return config.getSettings();
            },
            getSetting: function(key){
                return config.getSetting(key);
            },
            saveSettings: function(){
                config.saveSettings();
            },
            saveSetting: function(path, setting){
                config.saveSetting(path, setting);
            },
            getMusicDir: function(){
                return config.getMusicDir();
            },
            saveMusicDir: function(dir){
                config.saveMusicDir(dir);
            }
        };

        return API;
    }
})();