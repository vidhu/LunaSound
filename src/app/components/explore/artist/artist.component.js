(function () {
    'use strict'

    angular.module('LunaSound.Explore')
        .component('exploreArtist', {
            templateUrl: 'components/explore/artist/artist.template.html',
            controller: exploreArtistComponent
        });

    function exploreArtistComponent($stateParams, $q, Lastfm, PlaylistService, PlaylistModel, Track, AudioService) {
        var ctrl = this;
        ctrl.artist = null;
        ctrl.playlists = {albums: []};

        ctrl.$onInit = function () {
            getArtistInfo();
            //getTracks();
            //getAlbums();
            getArtistDetail();
        };

        ctrl.playTop = function () {
            if (ctrl.playlists.top) {
                if (AudioService.stat.paused || !ctrl.isTopPlaylistPlaying()) {
                    if (PlaylistService.getCurrentPlaylist() &&
                        PlaylistService.getCurrentPlaylist().name == ctrl.playlists.top.name) {
                        AudioService.play();
                    } else {
                        PlaylistService.loadPlaylist(ctrl.playlists.top);
                        PlaylistService.start();
                    }
                } else {
                    AudioService.pause();
                }
            }
        };

        ctrl.isTopPlaylistPlaying = function () {
            if(!PlaylistService.getCurrentPlaylist() || !ctrl.playlists.top)
                return false;
            return !AudioService.stat.paused && PlaylistService.getCurrentPlaylist().name == ctrl.playlists.top.name;
        };

        function getArtistDetail() {
            Lastfm.Artist.getDetails($stateParams.id)
                .then(processArtistDetails)
                .catch((ex)=> {
                    console.log("Artist not found");
                });
        }

        function processArtistDetails(data) {
            console.log(data);

            //Make Toptracks Playlist
            let topPl = new PlaylistModel(2, 'Top ' + data.name + ' Tracks', []);
            data.topTracks.forEach((track)=> {
                let t = convertToTrack(track);
                topPl.songs.push(t);
            });
            ctrl.playlists['top'] = topPl;

            //Make Albums Playlists
            var albums = _.take(_.sortBy(data.albums, (album)=> {
                return -album.spotify_popularity;
            }), 20);
            albums.forEach((album)=> {
                let albumPl = new PlaylistModel(2, album.name, []);
                album.tracks.forEach((track)=> {
                    let t = convertToTrack(track);
                    albumPl.songs.push(t);
                });
                albumPl.tag.img = album.image;
                albumPl.tag.date = album.release_date;
                ctrl.playlists['albums'].push(albumPl);
            });
            console.log(ctrl.playlists.albums);
        }

        function convertToTrack(track) {
            let t = new Track({
                URL: '',
                tag: {
                    title: track.name,
                    album: track.album_name,
                    artist: track.artists,
                    img: track.album == null ? '' : track.album.image,
                    duration: track.duration / 1000
                }
            });
            return t;
        }

        function getArtistInfo() {
            return Lastfm.Artist.getInfo($stateParams.id)
                .then((artist)=> {
                    console.log(artist.artist);
                    ctrl.artist = artist.artist;
                });
        }

        function getTracks() {
            Lastfm.Artist.getTopTracks($stateParams.id)
                .then((tracks)=> {
                    console.log(tracks.toptracks.track);
                    let pl = new PlaylistModel(2, '', []);
                    tracks = tracks.toptracks.track;
                    tracks.forEach((track)=> {
                        let t = new Track({
                            URL: '',
                            tag: {
                                title: track.name,
                                album: track.name,
                                artist: [track.artist.name],
                                img: track.image[track.image.length - 1]['#text'],
                                duration: track.duration
                            }
                        });
                        pl.songs.push(t);
                    });
                    ctrl.playlists['top'] = pl;
                });
        }

        function getAlbums() {
            Lastfm.Artist.getTopAlbums($stateParams.id)
                .then((albums)=> {
                    console.log(albums.topalbums.album);
                });
        }
    }
})();