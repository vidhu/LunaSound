(function() {

    angular.module('LunaSound')
        .component('searchBox', {
            templateUrl: 'app/shared/search/searchbox.template.html',
            controller: searchboxController
        });


    function searchboxController($state, youtube){
        var ctrl = this;
        ctrl.searchTerm = '';
        ctrl.hideSuggestion = true;
        ctrl.searchSuggestions = [];
        var liSelected;

        ctrl.searchBoxChange = function() {
            if(ctrl.searchTerm == '')
                ctrl.searchSuggestions = [];
            else{
                youtube.searchSuggestions(ctrl.searchTerm).then((suggestion)=>{
                    ctrl.searchSuggestions = suggestion;
                });
            }
        };

        ctrl.searchBoxFocus = function() {
            liSelected = null;
            ctrl.hideSuggestion = false;
        };

        ctrl.searchBoxBlur = function() {
            liSelected = null;
            ctrl.hideSuggestion = true;
        };


        ctrl.key = function($event){
            ctrl.hideSuggestion = false;
            var li = $('.results li');
            if ($event.keyCode == 38) {

                if(liSelected){
                    liSelected.removeClass('selected');
                    var next = liSelected.prev();
                    if(next.length > 0){
                        liSelected = next.addClass('selected');
                    }else{
                        liSelected = li.last().addClass('selected');
                    }
                }else{
                    liSelected = li.last().addClass('selected');
                }
                ctrl.searchTerm = liSelected.text().trim();
            }else if ($event.keyCode == 40) {

                if (liSelected) {
                    liSelected.removeClass('selected');
                    var next = liSelected.next();
                    if (next.length > 0) {
                        liSelected = next.addClass('selected');
                    } else {
                        liSelected = li.eq(0).addClass('selected');
                    }
                } else {
                    liSelected = li.eq(0).addClass('selected');
                }
                ctrl.searchTerm = liSelected.text().trim();
            }else if($event.keyCode == 27){
                ctrl.searchTerm = '';
            }else if ($event.keyCode == 13){
                var searchTerm = ctrl.searchTerm;
                ctrl.hideSuggestion = true;
                liSelected = null;
                $state.go('search', {q: searchTerm});
            }
        }
    }
})();
