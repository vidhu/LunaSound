module.exports = function (LibraryService, Track) {

    const path = require('path');
    const glob = require("glob");
    const fs = require('fs');
    const mm = require('musicmetadata');
    const async = require('async');
    const gaze = require('gaze');

    var API = {};

    API.start = function () {
        //Do initial processing
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
        gaze('*.mp3', {cwd: process.env.MUSIC_DIR}, function (err, watch) {
            // Get all watched files
            var watched = this.watched();

            //On file changed
            this.on('all', function (event, filepath) {
                if(event == 'added' || event == 'changed'){
                    mm(fs.createReadStream(filepath), {duration: true}, function (err, metadata) {
                        if (err) throw err;
                        var track = new Track({
                            tag: metadata,
                            URL: filepath,
                        });
                        var key = track.getId();
                        LibraryService.removeTrack(key);
                        LibraryService.addTrack(key, track, true);
                    });
                }
            });


            //On file deleted
            this.on('deleted', function (filepath) {
                var key = path.basename(filepath);
                LibraryService.removeTrack(key);
            });

            //On file change/added/deleted
        });
    };

    return API;
};
