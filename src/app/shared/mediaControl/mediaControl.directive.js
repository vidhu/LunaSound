(function () {
    'use strict'

    angular
        .module('LunaSound.Mediacontrol')
        .component('mediaControl', {
            templateUrl: 'shared/mediaControl/mediaControl.template.html',
            controller: MediaControlController
        });

    function MediaControlController($scope, ngAudio, AudioService, PlaylistService) {
        var ctrl = this;
        ctrl.progress = 0;
        ctrl.progressChanging = false;
        ctrl.sliderConfig = getSliderConfig(ctrl);
        ctrl.sound = AudioService;
        ctrl.plopt = PlaylistService.playbackOptions;

        //AudioService.load('./assets/music/crimson_day.mp3');


        $scope.$watch(function () {
                return AudioService.stat.progress;
            },
            function (newValue) {
                if (!ctrl.progressChanging)
                    ctrl.progress = newValue * 1000;
            }
        );

        // Controller Functions
        this.musicPrev = function () {
            if(PlaylistService.playbackOptions.repeat == 2)
                PlaylistService.playbackOptions.repeat = 1;
            PlaylistService.playPrevious();
        };

        this.musicPlayPause = function () {
            console.log('Play Pause toggle');
            if (AudioService.stat.paused) {
                AudioService.play();
            } else {
                AudioService.pause();
            }
        };

        this.musicNext = function () {
            if(PlaylistService.playbackOptions.repeat == 2)
                PlaylistService.playbackOptions.repeat = 1;
            PlaylistService.playNext();
        };

        this.shuffle = function () {
            this.plopt.shuffle = !this.plopt.shuffle;
            console.log(PlaylistService.playbackOptions.shuffle);
        };

        this.repeat = function () {
            this.plopt.repeat = (this.plopt.repeat + 1) % 3;
            console.log(PlaylistService.playbackOptions.repeat);
        };
    }

    function getSliderConfig(ctrl) {
        return {
            showSelectionBar: true,
            hidePointerLabels: true,
            hideLimitLabels: true,
            floor: 0,
            ceil: 1000,
            onStart: function (sliderId, modelValue, highValue, pointerType) {
                ctrl.progressChanging = true;
            },
            onEnd: function (sliderId, modelValue, highValue, pointerType) {
                ctrl.sound.seek(modelValue / 1000);
                ctrl.progressChanging = false;
            }
        };
    }
})();