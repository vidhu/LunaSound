(function () {

    angular.module("LunaSound.Youtube")
        .service('youtube', YoutubeService);

    function YoutubeService($q, $http) {

        var URL_SUG = "http://suggestqueries.google.com/complete/search?client=firefox&ds=yt&format=5&alt=json";
        var URL_SEARCH = 'https://www.googleapis.com/youtube/v3/search';
        var API_KEY = 'AIzaSyCIM4EzNqi1in22f4Z3Ru3iYvLaY8tc3bo';

        var API = {
            searchSuggestions: function(keywords) {
                var completedDeferred = $q.defer();

                $http({
                    url: URL_SUG,
                    method: "GET",
                    params: {q:keywords}
                }).then((response)=>{
                    if(response.status != 200)
                        completedDeferred.reject(response);

                    completedDeferred.resolve(response.data[1]);
                });


                return completedDeferred.promise;
            },
            search: function(keywords) {
                var completedDeferred = $q.defer();

                $http({
                    url: URL_SEARCH,
                    method: "GET",
                    params: {part:'snippet', q:keywords, maxResults:10, type:'video', key: API_KEY}
                }).then((response)=>{
                    if(response.status != 200) {
                        console.log(response);
                        completedDeferred.reject(response);
                    }
                    completedDeferred.resolve(response.data.items);
                });

                return completedDeferred.promise;
            }
        };

        return API;
    }
})();