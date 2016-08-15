(function () {

    angular.module('LunaSound')
        .component('search', {
            templateUrl: 'components/search/search.template.html',
            controller: searchController
        });

    function searchController($stateParams, $sce, youtube, Lastfm, MediaService) {
        var ctrl = this;
        ctrl.searchTerm = $stateParams.q;
        ctrl.searchResults = {
            youtube: [],
            artists: []
        };
        ctrl.downloadingFor = {};


        ctrl.$onInit = function () {
            searchYoutube();
            searchArtists();
            searchAlbums();
        };


        function searchArtists() {
            Lastfm.Artist.search($stateParams.q, 3)
                .then((artists)=>{
                    console.log(artists.results.artistmatches.artist);
                    ctrl.searchResults.artists = artists.results.artistmatches.artist;
                });
        }



        function searchYoutube() {
            youtube.search(ctrl.searchTerm).then((searchResults)=> {
                ctrl.searchResults.youtube = searchResults;
                //console.log(searchResults);
            });

        }

        ctrl.getEmbedUrl = function (videoId) {
            return $sce.trustAsResourceUrl("https://www.youtube.com/embed/" + videoId);
        };

        ctrl.download = function (videoId) {
            if (!ctrl.downloadingFor[videoId])
                MediaService.addToQueue('https://www.youtube.com/v/' + videoId);
            ctrl.downloadingFor[videoId] = true;
        };
    }
})();
