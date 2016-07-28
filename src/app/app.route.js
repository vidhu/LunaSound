module.exports = {
    routeConfig: function ($stateProvider, $urlRouterProvider) {

        $urlRouterProvider.otherwise('/add-song');

        $stateProvider
            .state('explore', {
                url: '/explore',
                template: "<explore-summary></explore-summary>"
            })
            .state('trending', {
                url: '/trending',
                template: "<trending></trending>"
            })
            .state('add-song', {
                url: '/add-song',
                template: "<add-song></add-song>"
            })
            .state('tracks', {
                url: '/tracks/:playlist',
                template: '<playlist></playlist>'
            })
            .state('search', {
                url: '/search/:q',
                template: '<search></search>'
            })
            .state('settings', {
                url: '/settings',
                template: '<settings></settings>'
            })
    }
};