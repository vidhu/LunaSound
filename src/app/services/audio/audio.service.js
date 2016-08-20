const {ipcRenderer} = require('electron');


(function () {

    angular.module('LunaSound.Audio')
        .factory('AudioService', function (ngAudio, $q, $rootScope) {

            var audio = null;
            var _loadedTrack = null;
            var loading = false;


            var API = {
                load: function (track) {
                    _loadedTrack = track;
                    loading = true;

                    var p = track.getStreamableUrl()
                        .then((url)=> {
                            if (track != _loadedTrack) {
                                $q.reject("Tracks don't match. Probably changed");
                            } else {
                                if (audio != null) {
                                    audio.stop();
                                    delete audio;
                                }
                                audio = ngAudio.load(url);
                                loading = false;
                                $rootScope.$broadcast('audio.load', track);
                                $q.when(url);
                            }
                        }).catch((err)=> {
                            //deferred.reject(err);
                            throw 'Error loading URL' + err;
                        });
                    console.log(p);
                    return p;

                },
                play: function () {
                    if (audio)
                        audio.play();

                },
                pause: function () {
                    if (audio)
                        audio.pause();

                },
                stop: function () {
                    API.pause();
                    //API.seek(0.5); //Weird bug with ngAudio?
                    API.load(_loadedTrack);

                },
                seek: function (pos) {
                    if (audio) {
                        audio.progress = pos;
                        console.log(audio.progress);
                    }
                },
                stat: {
                    loading: loading,
                    paused: true,
                    progress: 0,
                    currentTime: 0,
                    totalTime: 0
                }
            };

            $rootScope.$watch(
                function () {
                    if (!audio)
                        return API.stat;
                    return {
                        loading: loading,
                        paused: audio.paused,
                        progress: audio.progress,
                        currentTime: audio.currentTime,
                        totalTime: audio.currentTime + audio.remaining
                    }
                },
                function (newValue) {
                    API.stat = newValue;
                }, true);

            $rootScope.$watch(()=>{
                return API.stat.paused;
            }, (newVal, oldVal)=>{
                if(newVal != undefined)
                    ipcRenderer.send('audio-state', newVal);
            });

            return API;
        });
})();