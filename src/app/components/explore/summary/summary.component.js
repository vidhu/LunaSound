(function(){
    'use strict'

    angular.module('LunaSound.Explore')
        .component('exploreSummary', {
            templateUrl: 'app/components/explore/summary/summary.template.html',
            controller: exploreSummaryController
        });

    function exploreSummaryController(Lastfm){
        var ctrl = this;
        ctrl.topAlbums = null;


        ctrl.$onInit = function () {
            Lastfm.Chart.getTopArtists()
            .then((artists)=>{
                ctrl.topArtists = artists.artists.artist;
                console.log(ctrl.topArtists);
            });
        };
    }

})();