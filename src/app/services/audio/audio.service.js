(function () {

    angular.module('LunaSound.Audio')
    .factory('AudioService', function (ngAudio, $rootScope) {

        var audio = null;

        var API = {
            load: function(track){
                if(audio != null) {
                    audio.stop();
                    delete audio;
                }
                $rootScope.$broadcast('audio.load', track);
                audio = ngAudio.load(track.URL);
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