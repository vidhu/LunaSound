(function(){
    'use strict'

    angular.module('LunaSound.Settings')
        .component('musicdirSettings', {
            templateUrl: 'app/components/settings/musicdir/musicdir.setting.component.html',
            controller: MusicdirSettingsController
        });

    function MusicdirSettingsController(settings, PlaylistDB, LibraryWatcher, PlaylistService){
        var ctrl = this;


        ctrl.$onInit = function(){
            ctrl.directory = settings.getMusicDir();
        };

        ctrl.saveDir = function(){
            settings.saveMusicDir(ctrl.directory);

            //Need to refresh playlist and library
            LibraryWatcher.start();
            PlaylistDB.watch();
            PlaylistService.unloadPlaylist();
        };
    }
})();
