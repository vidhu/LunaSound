module.exports = {
    routeConfig: function ($stateProvider, $urlRouterProvider) {

        $urlRouterProvider.otherwise('/add-song');

        $stateProvider
            .state('explore', {
                url: '/explore',
                template: "<h1>explore!!</h1>"
            })
            .state('add-song', {
                url: '/add-song',
                template: "<add-song></add-song>"
            })
            .state('tracks', {
                url: '/tracks/:playlist',
                template: '<tracks-list></tracks-list>'
            })
            .state('search', {
                url: '/search/:q',
                template: '<search></search>'
            });
    }
};