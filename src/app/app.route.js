module.exports = {
    routeConfig: function ($stateProvider, $urlRouterProvider) {

        $urlRouterProvider.otherwise('/main/add-song');
        //$urlRouterProvider.otherwise('/boot');

        $stateProvider
            .state('main', {
                abstract: true,
                url: '/main',
                templateUrl: 'components/main/lunasound.template.html'
            })
            .state('main.explore', {
                url: '/explore',
                template: "<explore-summary></explore-summary>"
            })
            .state('main.artist', {
                url: '/artist/:id',
                template: "<explore-artist></explore-artist>"
            })
            .state('main.trending', {
                url: '/trending',
                template: "<trending></trending>"
            })
            .state('main.add-song', {
                url: '/add-song',
                template: "<add-song></add-song>"
            })
            .state('main.tracks', {
                url: '/tracks/:playlist',
                template: '<playlist></playlist>'
            })
            .state('main.search', {
                url: '/search/:q',
                template: '<search></search>'
            })
            .state('main.settings', {
                url: '/settings',
                template: '<settings></settings>'
            })
            .state('boot', {
                url: '/boot',
                templateUrl: 'components/boot/boot.template.html'
            });
    }
};