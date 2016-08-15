(function () {
    'use strict'
    const path = require("path");

    angular.module('LunaSound')
        .component('addSong', {
            templateUrl: 'components/addSong/addsong.template.html',
            controller: AddSongController
        });

    function AddSongController($scope, MediaService, PlaylistDB) {
        var ctrl = this;
        ctrl.youtubeURL = 'https://www.youtube.com/watch?v=ZmxahWYM5uE';

        ctrl.download = function () {
            MediaService.addToQueue(ctrl.youtubeURL);
        };

        ctrl.queue = MediaService.getQueue();

        ctrl.saveMedia = function (item) {
            item.statusLog.push('Saving Tag');
            item.media.saveMetadata(null, item.metadata)
            .then(()=>{
                item.statusLog.push('Saved Tag');
                if(item.playlist){
                    item.statusLog.push('Adding to playlist');
                    item.playlist.songs.push(path.basename(item.media.file));
                    PlaylistDB.save(item.playlist)
                        .then((playlist) =>{
                            item.statusLog.push('Added to playlist');
                            item.status = 2;
                        });
                }else{
                    item.status = 2;
                }
            });

        };

        ctrl.cancelQueue = function(item) {
            item.statusLog.push('Cancellation signal sent');
            item.statusLog.push('Cancelling');
            if(item.status == 0){ //Stop download or convertion
                item.status = 3;
            }else{ //Delete file if already downloaded
                MediaService.deleteDownload(item);
            }

        };

        ctrl.removeFromQueue = function(item) {
            MediaService.removeFromQueue(item);
        };


        loadPlaylist();
        $scope.$on('Playlist:Change', function(){
            loadPlaylist();
        });
        function loadPlaylist(){
            PlaylistDB.getAll()
                .then((playlists)=> {
                    ctrl.playlists = playlists
                });
        }
    }
})();