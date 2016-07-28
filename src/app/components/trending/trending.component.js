(function () {
    'use strict'

    const path = require('path');

    angular.module('LunaSound')
        .component('trending', {
            templateUrl: 'app/components/trending/trending.template.html',
            controller: trendingController
        });

    function trendingController(Lastfm, PlaylistModel, Track) {
        var ctrl = this;
        ctrl.playlist = {};
        ctrl.tracklistConfig = {
            type: 'youtube'
        };

        ctrl.$onInit = function () {
            getTopTracks();
        };

        function getTopTracks() {
            Lastfm.Chart.getTopTracks()
                .then((response)=> {
                    makePlaylist("top50", "Top 50 WorldWide", response.tracks.track);
                })
                .catch((err)=> {
                    throw err;
                });
        }

        function makePlaylist(plid, plName, tracks) {
            var pl = new PlaylistModel(2, plName, []);

            tracks.forEach((track)=> {
                var lunatrack = new Track({
                    URL: '',
                    tag: {
                        title: track.name,
                        album: track.name,
                        artist: [track.artist.name],
                        img: track.image[track.image.length - 1]['#text'],
                        duration: track.duration
                    }
                });
                pl.songs.push(lunatrack);
            });

            ctrl.playlist[plid] = pl;
        }
    }
})();