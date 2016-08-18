(function () {
    'use strict';

    //Modules - Other NameSpaces
    require('./services/library/library.module.js');
    require('./services/audio/audio.module.js');
    require('./services/media/media.module.js');
    require('./services/youtube/youtube.module.js');
    require('./services/lastfm/lastfm.module.js');
    require('./shared/mediaControl/mediaControl.module.js');
    require('./components/settings/settings.component.js');
    require('./components/explore/explore.module.js');

    //Configs
    const {routeConfig} = require('./app.route.js');

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
    require('./services/settings/settings.service.js');
    require('./shared/search/searchbox.component.js');
    require('./shared/topBar/topBar.directive.js');
    require('./shared/sideBar/sideBar.directive.js');
    require('./shared/chrome/chrome.directive.js');
    require('./shared/mediaControl/mediaControl.directive.js');
    require('./shared/outsideClick/outsideclick.directive.js');
    require('./shared/fileread/fileread.directive.js');
    require('./components/addSong/addsong.component.js');
    require('./components/track/track.component.js');
    require('./components/playlist/playlist.component.js');
    require('./components/search/search.component.js');
    require('./components/trending/trending.component.js');

})();