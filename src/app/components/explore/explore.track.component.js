(function () {
    'use strict'

    angular.module('LunaSound')
        .component('exploreTrack', {
            templateUrl: 'app/components/explore/explore.track.template.html',
            controller: exploreTrackController
        });

    function exploreTrackController(Lastfm, PlaylistModel, PlaylistService, Track) {
        var ctrl = this;

        ctrl.$onInit = function () {
            getTopTracks();
        };

        ctrl.play = function (idx) {
            PlaylistService.loadPlaylist(ctrl.playlist);
            PlaylistService.playSongByIndex(idx);
        };

        ctrl.getCurrentTrackIndex = function () {
            var currentPlaylist = PlaylistService.getCurrentPlaylist();
            if (!currentPlaylist || currentPlaylist.name != ctrl.playlist.name)
                return null;
            return currentPlaylist.idx;
        };

        function getTopTracks() {
            Lastfm.Chart.getTopTracks()
                .then((response)=> {
                    makePlaylist(response.tracks.track);
                })
                .catch((err)=> {
                    throw err;
                });
        }

        function makePlaylist(tracks) {
            var pl = new PlaylistModel(2, 'Top 50', []);

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

            ctrl.playlist = pl;
        }
    }
})();
/**
var track = new Track({
    URL: 'https://www.youtube.com/watch?v=mv1XUyRqcGU'
});
AudioService.load(track)
.then((url)=>{
    AudioService.play();
});
**/