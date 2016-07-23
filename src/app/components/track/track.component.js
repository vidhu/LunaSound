(function () {
    'use strict'

    angular.module('LunaSound')
        .component('tracksList', {
            templateUrl: 'app/components/track/track.template.html',
            controller: TracksController
        });

    function TracksController($scope, $stateParams, ngDialog, LibraryService, PlaylistModel, PlaylistService, PlaylistDB) {
        var ctrl = this;
        ctrl.pageTitle = '';
        ctrl.playlist = null;

        ctrl.$onInit = function () {
            setPlaylist();
            makePlaylistMenu();
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

        ctrl.uiSortableOptions = {
            helper: function (e, ui) {
                ui.children().each(function () {
                    $(this).width($(this).width());
                });
                return ui;
            },
            start: function (e, ui) {
                ui.item.css('box-shadow', '0px 0px 16px #80ccff');
            },
            stop: function (e, ui) {
                ui.item.css('box-shadow', 'none');
                var from = ui.item.sortable.index;
                var to = ui.item.sortable.dropindex;

                if (to != undefined) {
                    notifyNowPlayingIndexChange(from, to);
                    savePlaylist();
                }
            }
        };

        function notifyNowPlayingIndexChange(from, to){
            var currentPlaylist = PlaylistService.getCurrentPlaylist();
            if(currentPlaylist)
                currentPlaylist.indexChange(from, to);
        }

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

        function savePlaylist() {
            PlaylistDB.save(ctrl.playlist);
        }

        function makePlaylistMenu () {
            ctrl.playlistMenu = [];
            PlaylistDB.getAll()
                .then((playlists)=> {
                    ctrl.playlists = playlists;

                    // 2. Build playlist menu
                    ctrl.playlists.forEach(function (playlist) {

                        var menuItem = [
                            playlist.name,
                            function ($itemScope) {
                                playlist.songs.push(ctrl.playlist.songs[$itemScope.$index]);
                                PlaylistDB.save(playlist);
                            }
                        ];

                        ctrl.playlistMenu.push(menuItem);
                    });
                });
            // 3. Set Context Menu
            ctrl.menuOptions = [
                ['Play Next', function ($itemScope) {
                    var playlist = PlaylistService.getCurrentPlaylist();
                    if (playlist)
                        playlist.queueSong(ctrl.playlist.songs[$itemScope.$index]);
                }],
                ['Add to Playlist', function ($itemScope) {
                    // Code
                }, ctrl.playlistMenu],
                ['Remove from Playlist', function ($itemScope) {
                    removeTrack($itemScope.$index);
                }, function ($itemScope) {
                    return ctrl.getCurrentTrackIndex() != $itemScope.$index;
                }],
                ['Edit', function ($itemScope) {
                    editTrack($itemScope.track);
                }],
                ['Delete', function ($itemScope) {
                    deleteTrack($itemScope.track);
                }, function ($itemScope) {
                    return ctrl.getCurrentTrackIndex() != $itemScope.$index;
                }]
            ];
        }

        function removeTrack(index){
            if(typeof index == 'number')
                index = [index];

            var playlist = ctrl.playlist;
            _.forEach(index, function(idx){
                playlist.songs.splice(idx, 1);
                notifyNowPlayingIndexChange(idx, 100000);
            });

            savePlaylist();
        }

        function editTrack(track) {
            ngDialog.open({
                template: 'edit_track.html',
                className: 'ngdialog-theme-luna',
                controller: function($scope, $timeout, MediaService){
                    var ctrl = this;
                    ctrl.working = false;
                    ctrl.track = track;
                    ctrl.save = function() {
                        console.log(track);
                        ctrl.working = true;

                        var media = new MediaService();
                        media.saveMetadata(ctrl.track.URL, ctrl.track.tag)
                        .then(()=>{
                            console.log("Finished Saving Metadata");
                            $timeout(function(){
                                $scope.closeThisDialog();
                            }, 3000);
                        });
                    };
                },
                controllerAs: '$ctrl'
            });
        }

        function deleteTrack(track){
            ngDialog.openConfirm({
                template: 'confirm_del_track.html',
                className: 'ngdialog-theme-luna'
            }).then(()=>{
                var indices = [];
                _.forEach(ctrl.playlist.songs, function(t, idx){
                    if(t == track)
                        indices.push(idx);
                });
                console.log(indices);
                LibraryService.deleteTrack(track)
                    .then(()=>{
                        removeTrack(indices);
                    });
            });

        }

        $scope.$on('Library:Change', function () {
            // If tracks metadata change or any new
            // tracks were added into the library
            $scope.$apply(setPlaylist);
        });

    }

})
();