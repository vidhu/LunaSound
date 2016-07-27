(function () {
    'use strict'

    angular.module('LunaSound')
        .component('playlist', {
            templateUrl: 'app/components/playlist/playlist.template.html',
            controller: playlistController
        });

    function playlistController($stateParams, $scope, PlaylistService, PlaylistModel, PlaylistDB, LibraryService){
        var ctrl = this;
        ctrl.pageTitle;
        ctrl.playlist;

        ctrl.$onInit = function () {
            ctrl.trackListConfig = {
                enableEditing: true,
                enableSorting: true
            };
            setPlaylist();
        };

        function setPlaylist() {
            var playlistId = $stateParams.playlist;
            console.log(playlistId);

            if(playlistId == 0){
                ctrl.playlist = new PlaylistModel(0, 'All songs', []);
                ctrl.playlist.songs = LibraryService.getAllTracks();
                ctrl.pageTitle = 'All Music';
                PlaylistService.fillTracks(ctrl.playlist);
            }else if(playlistId == 1){
                ctrl.playlist = PlaylistService.getCurrentPlaylist();
                ctrl.pageTitle = 'Now Playing';
            }else{
                PlaylistDB.getPlaylist(playlistId)
                    .then((playlist)=> {
                        ctrl.playlist = playlist;
                        ctrl.pageTitle = playlist.name;
                    });
            }
        }

        $scope.$on('Library:Change', function () {
            // If tracks metadata change or any new
            // tracks were added into the library
            $scope.$apply(setPlaylist);
        });
    }
})();