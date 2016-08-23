const path = require('path');
const fs = require('fs');

exports.LibraryService = function ($rootScope, $q) {
    var tracks = {};

    function notifyLibraryChange() {
        $rootScope.$broadcast('Library:Change');
    }

    var API = {
        addTrack: function (key, track, notifyChange) {
            if (notifyChange == null) notifyChange = true;

            tracks[key] = track;

            if (notifyChange)
                notifyLibraryChange();
        },

        addTracks: function (tracks) {
            _.each(tracks, (value, key)=> {
                API.addTrack(key, value, false);
            });
            notifyLibraryChange();
        },

        removeTrack: function (track) {
            delete tracks[track];
            notifyLibraryChange();
        },

        removeAll: function () {
            tracks = {};
            notifyLibraryChange();
        },

        deleteTrack: function (track) {
            var completedDeferred = $q.defer();

            var trackId = track.getId();
            fs.unlink(path.join(ENV.MUSIC_DIR, trackId), function (er) {
                if (er) throw er;

                delete tracks[trackId];
                notifyLibraryChange();
                completedDeferred.resolve();
            });


            return completedDeferred.promise;
        },

        getTrackById: function (id) {
            if (_.has(tracks, id))
                return tracks[id];
            return null;
        },

        getAllTracks: function () {
            return Object.keys(tracks);
        }
    };

    return API;
};
