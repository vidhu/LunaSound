(function(){
    'use strict'
    const JSONPath = require('jsonpath-plus');

    angular.module('LunaSound.Settings')
        .factory('settings', settingsService);

    function settingsService(localStorageService){


        var API = {
            getSettings: function(){
                var settings = localStorageService.get('settings');
                if(settings == undefined)
                    settings = {};
                return settings;
            },
            getSetting: function(key){
                var settings = API.getSettings();
                var result = JSONPath({json: settings, path: key});
                if(result.length == 0)
                    return null;
                else
                    return result[0];
            },
            saveSettings: function(s){
                localStorageService.set('settings', s);
            },
            saveSetting: function(path, setting){
                var settings = API.getSettings();

                var keys = path.split('.');

                var curPos = settings;
                for(let i=0; i<keys.length; i++){
                    var key = keys[i];

                    //Check if we are are leaf
                    if(i == keys.length-1) {
                        curPos[key] = setting;
                        break;
                    }

                    //If key doesn't exist, add it
                    if(!(key in curPos))
                        curPos[key] = {};

                    //update pointer
                    curPos = curPos[key];
                }

                API.saveSettings(settings);
            },
            getMusicDir: function(){
                var musicDir = API.getSetting('dir.music');
                if(musicDir == null || musicDir == '')
                    musicDir = process.env.MUSIC_DIR;
                API.saveMusicDir(musicDir);
                return musicDir;
            },
            saveMusicDir: function(dir){
                API.saveSetting('dir.music', dir);
            }
        };

        return API;
    }
})();