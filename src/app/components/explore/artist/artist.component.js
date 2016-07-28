(function(){
    'use strict'

    angular.module('LunaSound.Explore')
        .component('exploreArtist', {
            templateUrl: 'app/components/explore/artist/artist.template.html',
            controller: exploreArtistComponent
        });

    function exploreArtistComponent(){
        var ctrl = this;
    }
})();