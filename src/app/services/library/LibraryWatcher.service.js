module.exports = function (settings, LibraryService, Track) {

    const path = require('path');
    const glob = require("glob");
    const fs = require('fs');
    const mm = require('musicmetadata');
    const async = require('async');
    const chokidar = require('chokidar');

    var MUSIC_DIR = settings.getMusicDir();
    var watcher;

    var API = {};

    API.start = function () {
        //If directory was changed via settings, we need to update new MUSIC_DIR
        MUSIC_DIR = settings.getMusicDir();

        //Stop perviour watcher if it exists
        if(watcher)
            watcher.close();

        //Clear Library
        LibraryService.removeAll();

        glob(path.join(MUSIC_DIR, '**/*.mp3'), function (er, files) {
            var _tempLibrary = {};
            async.each(files, function (file, cb) {

                //Read music file and populate library data
                mm(fs.createReadStream(file), {duration: true}, function (err, metadata) {
                    if (err) cb(err);
                    var track = new Track({
                        tag: metadata,
                        URL: file
                    });
                    _tempLibrary[track.getId()] = track;
                    cb();
                });

            }, function (err) {
                if (err) throw err;
                LibraryService.addTracks(_tempLibrary);
            });
        });

        //Watch for any changes
        watcher = chokidar.watch('*.mp3', {
            cwd: MUSIC_DIR,
            ignoreInitial: true,
        });

        watcher.on('all', (event, filepath)=> {
            filepath = path.join(MUSIC_DIR, filepath);

            //On file changed
            if (event == 'add' || event == 'change') {
                mm(fs.createReadStream(filepath), {duration: true}, function (err, metadata) {
                    if (err) throw err;
                    var track = new Track({
                        tag: metadata,
                        URL: filepath
                    });
                    var key = track.getId();
                    LibraryService.removeTrack(key);
                    LibraryService.addTrack(key, track, true);
                });
            }
            console.log(event, filepath);
        });

        watcher.on('deleted', (event, filepath)=> {
            var key = path.basename(filepath);
            LibraryService.removeTrack(key);
        });

    };

    return API;
};
