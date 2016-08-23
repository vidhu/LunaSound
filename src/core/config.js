const path = require('path');
const nconf = require('nconf');
const fs = require('fs');

var ENV = window.ENV || {};
if(!(process.type === 'renderer')) {
    ENV = process.env;
}
let configPath = path.join(ENV.USER_DATA, 'config.json');

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
            musicDir = ENV.MUSIC_DIR;
        API.saveMusicDir(musicDir);
        return musicDir;
    },
    saveMusicDir: function(dir){
        API.saveSetting('dir:music', dir);
    }
};

module.exports = API;