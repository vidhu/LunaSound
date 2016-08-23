(function() {
    'use strict'

    const LibraryModule = require('./Library.service.js');
    const LibraryWatcher = require('./LibraryWatcher.service.js');
    const TrackModel = require('./Track.service.js');
    const PlaylistModule = require('./Playlist.service.js');
    //console.log(LibraryWatcher);
    angular
        .module('LunaSound.Library', ['ui.router'])
        .factory('LibraryService', LibraryModule.LibraryService)
        .factory('LibraryWatcher', LibraryWatcher)
        .factory('Track', TrackModel)
        .factory('PlaylistModel', PlaylistModule.PlaylistModel)
        .factory('PlaylistService', PlaylistModule.PlaylistService)
        .factory('PlaylistDB', PlaylistModule.PlaylistDB);
})();
