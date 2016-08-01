(function () {
    'use strict'

    angular
        .module('LunaSound')
        .component('sideBar', {
            templateUrl: 'app/shared/sideBar/sideBar.template.html',
            controller: topBar
        });

    function topBar($scope, ngDialog, PlaylistModel, PlaylistService, PlaylistDB, MediaService) {
        var ctrl = this;
        ctrl.name = "Cool Playlist";
        ctrl.playlists = [];
        ctrl.newPltxtboxVisible = false;

        ctrl.$onInit = function () {
            populatePlaylist();
            makePlaylistMenu();
        };

        ctrl.getCurrentPlaylistName = function () {
            var pl = PlaylistService.getCurrentPlaylist();
            if (!pl)
                return null;
            return PlaylistService.getCurrentPlaylist().name;
        };

        ctrl.showNewPltxtBox = function () {
            ctrl.newPltxtboxVisible = true;
            document.getElementById('txtbox_newPlaylist')
                .addEventListener('blur', function () {
                    ctrl.hideNewPltxtBox();
                });
        };

        ctrl.hideNewPltxtBox = function () {
            ctrl.newPltxtboxVisible = false;
        };

        ctrl.keyPress = function (event) {
            if (event.keyCode == 27)
                ctrl.hideNewPltxtBox();
            else if (event.keyCode == 13) {

                var playlist = new PlaylistModel(-1, ctrl.newPLName, []);
                PlaylistDB.save(playlist)
                    .then((playlist)=> {
                        return PlaylistDB.getAll();
                    })
                    .then((playlists)=> {
                        ctrl.playlists = playlists;
                    });

                ctrl.hideNewPltxtBox();
            }
        };

        ctrl.renamePlaylist = function(playlist, newName){
            var newPlaylist = playlist.clone();
            newPlaylist.name = newName;

            PlaylistDB.delete(playlist.id)
            .then(()=>{
                PlaylistDB.save(newPlaylist);
            });

        };

        ctrl.downloadQueueCount = function() {
            return MediaService.getQueue().length;
        };

        function makePlaylistMenu() {
            ctrl.menuOptions = [
                ['Rename', function ($itemScope) {
                    $itemScope.plForm.$show();
                }],
                ['Delete', function ($itemScope) {
                    console.log("Delete");
                    showDeleteConfirmDialog($itemScope.playlist);
                }]
            ];
        }

        $scope.$on('Playlist:Change', function () {
            populatePlaylist();
        });

        function populatePlaylist() {
            PlaylistDB.getAll()
                .then(function (playlists) {
                    ctrl.playlists = playlists;
                });
        }

        function showDeleteConfirmDialog(playlist) {
            ngDialog.openConfirm({
                template: 'app/shared/sideBar/playlistDeleteConfirm.template.html',
                className: 'ngdialog-theme-luna',
                controller: function($scope){
                    $scope.playlistName = playlist.name;
                }
            }).then(()=>{
                return PlaylistDB.delete(playlist.id);
            });
        }
    }
})();