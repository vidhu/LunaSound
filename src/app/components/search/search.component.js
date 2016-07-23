(function () {

    angular.module('LunaSound')
        .component('search', {
            templateUrl: 'app/components/search/search.template.html',
            controller: searchController
        });

    function searchController($stateParams, $sce, youtube, MediaService) {
        var ctrl = this;
        ctrl.searchTerm = $stateParams.q;
        ctrl.searchResults = [];
        ctrl.downloadingFor = {};


        youtube.search(ctrl.searchTerm).then((searchResults)=>{
            ctrl.searchResults = searchResults;
            console.log(searchResults);
        });


        ctrl.getEmbedUrl = function(videoId) {
            return $sce.trustAsResourceUrl("https://www.youtube.com/embed/" + videoId);
        };

        ctrl.download = function(videoId) {
            if(!ctrl.downloadingFor[videoId])
                MediaService.addToQueue('https://www.youtube.com/v/'+videoId);
            ctrl.downloadingFor[videoId] = true;
        };
    }
})();
