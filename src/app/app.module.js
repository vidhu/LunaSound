(function () {
    'use strict';

    //Modules - Other NameSpaces
    require('./app/services/library/library.module.js');
    require('./app/services/audio/audio.module.js');
    require('./app/services/media/media.module.js');
    require('./app/services/youtube/youtube.module.js');
    require('./app/services/lastfm/lastfm.module.js');
    require('./app/shared/mediaControl/mediaControl.module.js');
    require('./app/components/settings/settings.component.js');
    require('./app/components/explore/explore.module.js');

    //Configs
    const {routeConfig} = require('./app/app.route.js');

    angular.module('LunaSound', [
        'LunaSound.Explore',
        'LunaSound.Library',
        'LunaSound.Mediacontrol',
        'LunaSound.Audio',
        'LunaSound.Media',
        'LunaSound.Youtube',
        'LunaSound.Lastfm',
        'LunaSound.Settings',
        'ui.router',
        'LocalStorageModule',
        'ngSanitize',
        'rzModule',
        'youtube-embed',
        'ui.bootstrap.contextMenu',
        'ui.sortable',
        'jsonFormatter',
        'ngDialog',
        'xeditable'
    ])
        .config(routeConfig)
        .constant('_', window._)
        .constant('$', window.$)
        .config(function(localStorageServiceProvider){
            localStorageServiceProvider
                .setPrefix('LunaSound')
                .setNotify(true, true);
        })
        .run(function($rootScope, LibraryWatcher, PlaylistDB, editableOptions, Lastfm){
            LibraryWatcher.start();
            PlaylistDB.watch();

            $rootScope.$on('$stateChangeSuccess', function (event, current, previous) {
                $rootScope.title = current.url;
            });
            $rootScope._ = window._;
            $rootScope.jq = window.$;

            editableOptions.theme = 'default';

        });

    //Modules - LunaSound NameSpace
    require('./app/services/settings/settings.service.js');
    require('./app/shared/search/searchbox.component.js');
    require('./app/shared/topBar/topBar.directive.js');
    require('./app/shared/sideBar/sideBar.directive.js');
    require('./app/shared/chrome/chrome.directive.js');
    require('./app/shared/mediaControl/mediaControl.directive.js');
    require('./app/shared/outsideClick/outsideclick.directive.js');
    require('./app/shared/fileread/fileread.directive.js');
    require('./app/components/lunasound/lunasound.component.js');
    require('./app/components/addSong/addsong.component.js');
    require('./app/components/track/track.component.js');
    require('./app/components/playlist/playlist.component.js');
    require('./app/components/search/search.component.js');
    require('./app/components/trending/trending.component.js');

})();