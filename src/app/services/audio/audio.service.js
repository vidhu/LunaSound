(function () {

    angular.module('LunaSound.Audio')
    .factory('AudioService', function (ngAudio, $q, $rootScope) {

        var audio = null;
        var _loadedTrack = null;

        var API = {
            load: function(track){
                _loadedTrack = track;

                var p = track.getStreamableUrl()
                .then((url)=>{
                    if(track != _loadedTrack){
                        $q.reject("Tracks don't match. Probably changed");
                    }else{
                        if(audio != null) {
                            audio.stop();
                            delete audio;
                        }
                        audio = ngAudio.load(url);
                        $rootScope.$broadcast('audio.load', track);
                        $q.when(url);
                    }
                }).catch((err)=>{
                    //deferred.reject(err);
                    throw 'Error loading URL' + err;
                });
                console.log(p);
                return p;

            },
            play: function() {
                if(audio) {
                    audio.play();
                }
            },
            pause: function() {
                if(audio)
                    audio.pause();
            },
            seek: function(pos) {
                if(audio)
                    audio.progress = pos;
            },
            stat: {
                paused: true,
                progress: 0,
                currentTime: 0,
                totalTime: 0
            }
        };

        $rootScope.$watch(
        function(){
            if(!audio)
                return API.stat;
            return {
                paused: audio.paused,
                progress: audio.progress,
                currentTime: audio.currentTime,
                totalTime: audio.currentTime + audio.remaining
            }
        },
        function(newValue){
           API.stat = newValue;
        }, true);

        return API;
    });
})();