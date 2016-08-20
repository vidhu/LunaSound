const fs = require('fs');
const path = require('path');
const filendir = require('filendir');
const glob = require("glob");
const async = require('async');
const chokidar = require('chokidar');
const electron = require('electron');

exports.PlaylistModel = function () {
    function PlayListModel(id, name, songs) {
        //Variables
        this.id = id;
        this.name = name;
        this.tag = {};
        this.songs = songs;
        this.songsManual = [];
        this.songsShuffledIndex = [];
        this.playbackOptions;
        this.idx = 0;

        //Methods
        this.getSongs = function () {
            return this.songs;
        };

        this.getCurrentSong = function () {
            return this.songs[this.idx];
        };

        this.setCurrentSongIndex = function (idx) {
            this.idx = idx;
            this.cacheNeighbours(5, 5);
        };

        this.getNextSong = function (step) {
            if (!step) step = 1;

            //Overide to priority queue
            if (this.songsManual.length != 0 && step > 0) {
                return this.songsManual.shift();
            }

            if (this.playbackOptions.shuffle && this.playbackOptions.repeat != 2) {
                if (this.songsShuffledIndex.length == 0) {
                    this.songsShuffledIndex = _.range(this.songs.length);
                    this.songsShuffledIndex = _.shuffle(this.songsShuffledIndex);
                }
                this.idx = this.songsShuffledIndex.shift();
            } else {
                if (this.playbackOptions.repeat == 2) {
                    //Loop playback
                    //Don't change song index
                } else if (this.playbackOptions.repeat == 1) {
                    //Playlist repeat playback
                    this.idx = (this.idx + step) % this.songs.length;
                } else {
                    //Select song in normal queue
                    if (!(this.idx + step >= 0 && this.idx + step < this.songs.length))
                        return null;
                    this.idx += step;
                }
            }

            this.cacheNeighbours(5, 5);

            return this.songs[this.idx];
        };

        this.getPrevSong = function () {
            return this.getNextSong(-1)
        };

        this.indexChange = function (from, to) {
            if (from == this.idx) {
                this.idx = to;
            } else if (from < this.idx && to == this.idx) {
                this.idx -= 1;
            } else if (from > this.idx && to == this.idx) {
                this.idx += 1;
            } else if (from < this.idx && to > this.idx) {
                this.idx -= 1;
            } else if (from > this.idx && to < this.idx) {
                this.idx += 1;
            }
        };

        this.queueSong = function (track) {
            this.songsManual.push(track);
        };

        this.clone = function () {
            var clone = new PlayListModel(this.id, this.name, []);
            clone.songs = this.songs.slice();
            return clone;
        };

        this.cacheNeighbours = function (back, front) {
            for (let i = this.idx + 1; i < this.idx + front; i++) {
                if (i >= this.songs.length)
                    break;

                var track = this.songs[i];
                console.log("caching -> " + i);
                track.getStreamableUrl();
            }
            for (let i = this.idx - 1; i > this.idx - back; i--) {
                if (i < 0)
                    break;
                var track = this.songs[i];
                console.log("caching -> " + i);
                track.getStreamableUrl();
            }
        }
    }

    return PlayListModel;
};

exports.PlaylistService = function ($rootScope, AudioService, LibraryService, PlaylistModel) {

    var nowPlaying = null;

    $rootScope.$on('Playlist:Change', (e, pl)=> {
        if (nowPlaying && nowPlaying.name == pl.name) {
        nowPlaying.songs = pl.songs;
    }
});



    var API = {
        playbackOptions: {
            shuffle: false,
            repeat: 0
        },
        loadPlaylist: function (pl) {
            var playlist = pl.clone();
            playlist.id = 1;
            playlist.playbackOptions = API.playbackOptions;
            playlist.songs = pl.songs;
            nowPlaying = playlist;
        },
        unloadPlaylist: function () {
            nowPlaying = null;
        },
        setTracks: function (tracks) {
            if(!nowPlaying) return;
            nowPlaying.songs = tracks.slice();
        },
        getCurrentPlaylist: function () {
            return nowPlaying;
        },
        getCurrentSong: function () {
            if(!nowPlaying) return;
            return nowPlaying.getCurrentSong();
        },
        setPlaybackOptions: function (plOpt) {
            if (!nowPlaying) return;
            nowPlaying.playbackOptions = plOpt;
        },
        start: function () {
            if (!nowPlaying) return;

            let track = nowPlaying.getCurrentSong();

            AudioService.load(track)
                .then((url)=> {
                AudioService.play();
        });
        },
        playNext: function () {
            if(!nowPlaying) return;

            let track = nowPlaying.getNextSong();
            if (!track)
                return;

            AudioService.load(track)
                .then((url)=> {
                AudioService.play();
            });
        },
        playPrevious: function () {
            if(!nowPlaying) return;

            let track = nowPlaying.getPrevSong();
            if (!track)
                return;

            AudioService.load(track)
                .then((url)=> {
                AudioService.play();
            });
        },
        stop: function () {
            AudioService.stop();
        },
        playSongByIndex: function (idx) {
            if(!nowPlaying) return;

            nowPlaying.setCurrentSongIndex(idx);
            API.start();
        },
        fillTracks: function (pl) {
            var tracks = [];
            pl.songs.forEach(function (id) {
                var track = LibraryService.getTrackById(id);
                tracks.push(track);
            });
            pl.songs = tracks;
            return pl;
        }
    };


    $rootScope.$watch(function () {
        return AudioService.stat.progress;
    }, function (newValue) {
        if (newValue == 1)
            API.playNext();
    });

    electron.ipcRenderer.on('mediaCtrl', (event, message)=> {
        if (message == 'playpause') {
            if (AudioService.stat.paused) {
                AudioService.play();
            } else {
                AudioService.pause();
            }
        } else if (message == 'next') {
            API.playNext();
        } else if (message == 'prev') {
            API.playPrevious();
        } else if (message == 'stop') {
            AudioService.stop();
        }
    });

    return API;
};

exports.PlaylistDB = function ($q, $rootScope, settings, PlaylistModel, LibraryService) {
    /**
     * Playlist(
     *  id: filepath
     *  name: filepath - ext
     *  songs: [songID]
     * }
     *
     **/



    var PL_DIR = path.join(settings.getMusicDir(), 'playlist');
    var watcher;
    var plCache = {};

    var API = {
        watch: function () {
            //If directory was changed via settings, we need to update new PL_DIR
            PL_DIR = path.join(settings.getMusicDir(), 'playlist');

            //Create playlist dir if doesn't exists
            if (!fs.existsSync(PL_DIR)){
                fs.mkdirSync(PL_DIR);
            }

            //Stop perviour watcher if it exists
            if(watcher)
                watcher.close();


            //Fire Playlist:Change event forefully if new dir doesn't contain any playlists
            $rootScope.$broadcast('Playlist:Change', null);

            watcher = chokidar.watch('**/*.m3u', {
                cwd: PL_DIR,
                ignored: /[\/\\]\./
            });

            watcher.on('all', (event, filename)=> {
                var playlistId = path.basename(filename);
            if(event == 'unlink'){
                $rootScope.$broadcast('Playlist:Change', new PlaylistModel(playlistId, '', []));
            }else{
                API.getPlaylist(playlistId).then((pl)=> {
                    $rootScope.$broadcast('Playlist:Change', pl);
            });
            }
        });
        },
        save: function (playlist) {
            var completedDeferred = $q.defer();

            if (playlist.id == 0 || playlist.id == 1) {
                return $q.reject('Unsaveable playlist');
            }

            var content = '';
            playlist.songs.forEach(function (track) {
                if (typeof track === 'object')
                    content += track.getId() + '\n';
                else
                    content += track + '\n';
            });
            fs.writeFile(path.join(PL_DIR, playlist.name + '.m3u'), content, {flag: 'w'}, function (err) {
                if (err) throw err;
                completedDeferred.resolve(playlist);
            });

            return completedDeferred.promise;
        },
        delete: function (playlistId) {
            var completedDeferred = $q.defer();

            fs.unlink(path.join(PL_DIR, playlistId), function (er) {
                if (er) throw er;

                completedDeferred.resolve();
            });

            return completedDeferred.promise;
        },
        getAll: function () {
            var completedDeferred = $q.defer();

            glob(path.join(PL_DIR, '**/*.m3u'), function (er, files) {
                if (er) completedDeferred.reject(er);

                var playlists = [];
                async.each(files, function (file, cb) {

                    var playlistId = path.basename(file);
                    API.getPlaylist(playlistId)
                        .then((playlist)=> {
                        playlists.push(playlist);
                    cb();
                });

                }, function (er) {
                    if (er) throw er;
                    completedDeferred.resolve(playlists);
                });
            });

            return completedDeferred.promise;
        },
        getPlaylist: function (playlistId) {
            var completedDeferred = $q.defer();

            fs.readFile(path.join(PL_DIR, playlistId), 'utf-8', function (err, trackIds) {
                if (err) throw err;

                //Get track id's from playlist files
                trackIds = _.filter(trackIds.split("\n"), function (s) {
                    return s != '';
                });

                //Get track from library based on trackId
                var tracks = [];
                trackIds.forEach(function (trackId) {
                    var track = LibraryService.getTrackById(trackId);
                    if (track)
                        tracks.push(track);
                });

                //Create Playlist Object
                var playlist = new PlaylistModel(playlistId, path.basename(playlistId, '.m3u'), tracks);


                completedDeferred.resolve(playlist);
            });

            return completedDeferred.promise;
        }
    };

    return API;
};