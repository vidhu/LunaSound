(function () {
    'use strict'
    const path = require('path');
    const utils = require('util');
    const events = require('events');
    const fs = require('fs');
    const youtubedl = require('youtube-dl');
    const MemoryStream = require('memorystream');
    const ffmpeg = require('fluent-ffmpeg');
    const acoustid = require("acoustid");
    const ID3Writer = require('browser-id3-writer');

    angular.module('LunaSound.Media')
        .factory('MediaService', MediaService);

    function MediaService($q, $rootScope, settings) {
        var saveDir = __dirname + '/music/';

        var downloadQueue = [];

        var API = function (URL) {
            this.URL = URL;
            this.info = null;
            this.file = null;
            this.metadata = null;
        };

        //Static Methods
        API.addToQueue = function (URL) {
            var qObj = {
                media: new API(URL),
                downloadProgress: 0,
                statusLog: ['Downloading media file', '0%'],
                metadata: {title: '', album: '', artist: ''},
                playlist: null,
                status: 0
                //status codes
                // 0 = Download/Conversion in progress
                // 1 = Playlist/Tagging in progress
                // 2 = Finished/Saved
                // 3 = Cancellation in progress
                // 4 = Cancellation finished
            };
            downloadQueue.push(qObj);

            qObj.media.on('downloadProgress', function(percent){
                qObj.statusLog[qObj.statusLog.length-1] = percent + '%';
            });

            qObj.media.download()
            .then((memStream)=> {
                    //If cancellation requested
                    if (qObj.status == 3)
                        return $q.reject('cancel');

                    var log = ["Download Completed", "Converting to mp3"];
                    qObj.statusLog = qObj.statusLog.concat(log);
                    console.log(log);
                    return qObj.media.extractAudio(memStream);
                })
            .then((file)=> {
                    //If cancellation requested
                    if (qObj.status == 3)
                        return $q.reject('cancel');

                    var log = ["Convertion to MP3 completed", "Finding metadata"];
                    qObj.statusLog = qObj.statusLog.concat(log);
                    console.log(log);
                    return qObj.media.getMetadata();
            }).then((metadata)=> {
                //If cancellation requested
                if(qObj.status == 3)
                    return $q.reject('cancel');

                var log = [];
                if (metadata.length == 0 || metadata[0].recordings == undefined)
                    log = ['Could not find metadata, please enter it manualy'];
                else {
                    log = ['Found metadata'];
                    qObj.metadata.title = metadata[0].recordings[0].title;
                    qObj.metadata.album = metadata[0].recordings[0].releasegroups[0].title;
                    qObj.metadata.artist = metadata[0].recordings[0].artists[0].name;
                }

                qObj.statusLog = qObj.statusLog.concat(log);
                console.log(log);

                qObj.status = 1;
            }).catch(function (err) {
                if (err == 'cancel') {
                    API.deleteDownload(qObj);
                }
            });

            return qObj.meqObj;
        };

        API.deleteDownload = function (qObj) {

            qObj.statusLog.push("Cancellation successful");


            if(qObj.media.file != null){
                qObj.statusLog.push('Cleaning Up');
                fs.unlinkSync(qObj.media.file);
                qObj.statusLog.push('Finished cleaning');
            }


            qObj.status = 4;
        };

        API.removeFromQueue = function (item) {
            _.remove(downloadQueue, function (curItem) {
                return curItem === item;
            })
        };


        API.getQueue = function () {
            return downloadQueue;
        };

        // Object Methods
        API.prototype.download = function () {
            var completedDeferred = $q.defer();

            var downloaded = 0;
            var size = 0;
            var pos = 0;
            var memStream = new MemoryStream(null, {
                readable: true,
                writeable: true
            });
            var video = youtubedl(this.URL, [], {
                start: downloaded,
                cwd: __dirname,
                bin: ENV.youtubedl
            });

            video.on('info', (info)=> {
                this.emit('info', info);

                this.info = info;
                size = info.size;
                video.pipe(memStream);
            });

            video.on('data', (chunk)=> {
                pos += chunk.length;
                if (size) {
                    downloaded = (pos / size * 100).toFixed(2);
                    this.emit('downloadProgress', downloaded);
                }
            });

            video.on('end', ()=> {
                completedDeferred.resolve(memStream);
            });

            return completedDeferred.promise;
        };

        API.prototype.extractAudio = function (memStream) {
            ffmpeg.setFfmpegPath(ENV.ffmpeg);

            var completedDeferred = $q.defer();

            var filename = this.info.fulltitle.replace(/[^a-z0-9]/gi, '_').toLowerCase() + '.mp3';
            this.file = path.join(settings.getMusicDir(), filename);
            var cmd = ffmpeg({source: memStream});
            cmd.on('end', ()=> {
                completedDeferred.resolve(this.file)
            });
            cmd.save(this.file);

            return completedDeferred.promise;
        };

        API.prototype.getMetadata = function (file) {
            if (file) this.file = file;

            var completedDeferred = $q.defer();

            acoustid(this.file, {
                key: 'tPrbdkhM',
                meta: 'recordings releasegroups compress',
                fpcalc: {
                    command: ENV.fpcalc
                }
            }, (err, result)=> {
                if (err) completedDeferred.reject(err);
                else {
                    this.metadata = result;
                    completedDeferred.resolve(result);
                }
            });

            return completedDeferred.promise;
        };

        API.prototype.saveMetadata = function (file, metadata) {
            if (file) this.file = file;
            if (!metadata) {
                metadata = {
                    title: '',
                    album: '',
                    artist: ''
                };
                if (this.metadata.length != 0) {
                    metadata.title = this.metadata[0].recordings[0].title;
                    metadata.album = this.metadata[0].recordings[0].releasegroups[0].title;
                    metadata.artist = this.metadata[0].recordings[0].artists[0].name;
                }
            }

            var completedDeferred = $q.defer();

            fs.readFile(this.file, (err, songBuffer)=> {
                if (err) completedDeferred.reject(err);


                var writer = new ID3Writer(songBuffer);
                writer.setFrame('TIT2', metadata.title);
                writer.setFrame('TALB', metadata.album);
                writer.setFrame('TPE1', [metadata.artist]);
                writer.addTag();

                var taggedSongBuffer = new Buffer(writer.arrayBuffer);
                fs.writeFile(this.file, taggedSongBuffer, function (err) {
                    if (err) completedDeferred.reject(err);
                    else completedDeferred.resolve();
                });
            });

            return completedDeferred.promise;
        };

        utils.inherits(API, events.EventEmitter);
        return API;
    }
})();
