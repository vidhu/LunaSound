(function(){
    'use strict'
    const path = require('path');
    const nconf = require('nconf');

    angular.module('LunaSound.Settings')
        .factory('settings', settingsService);

    function settingsService(){
        let configPath = path.join(process.env.BASE_DIR, 'config.json');

        nconf.argv()
            .env()
            .file({ file: configPath });

        var API = {
            getSettings: function(){
                return nconf.get();
            },
            getSetting: function(key){
                return nconf.get(key);
            },
            saveSettings: function(){
                nconf.save(function (err) {
                    fs.readFile(configPath, function (err, data) {
                        console.dir(JSON.parse(data.toString()))
                    });
                });
            },
            saveSetting: function(path, setting){
                nconf.set(path, setting);

                API.saveSettings();
            },
            getMusicDir: function(){
                var musicDir = API.getSetting('dir:music');
                if(musicDir == null || musicDir == '')
                    musicDir = process.env.MUSIC_DIR;
                API.saveMusicDir(musicDir);
                return musicDir;
            },
            saveMusicDir: function(dir){
                API.saveSetting('dir:music', dir);
            }
        };

        return API;
    }
})();