module.exports = function (LibraryService, Track) {

    const path = require('path');
    const glob = require("glob");
    const fs = require('fs');
    const mm = require('musicmetadata');
    const async = require('async');
    const chokidar = require('chokidar');

    var API = {};

    API.start = function () {

        glob(path.join(process.env.MUSIC_DIR, '**/*.mp3'), function (er, files) {
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
        var watcher = chokidar.watch('*.mp3', {
            cwd: process.env.MUSIC_DIR,
            ignored: /[\/\\]\./,
            ignoreInitial: true,
        });

        watcher.on('all', (event, filepath)=> {
            filepath = path.join(process.env.MUSIC_DIR, filepath);

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
