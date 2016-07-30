(function () {
    const md5 = require('js-md5');

    angular.module('LunaSound.Lastfm')
        .factory('Lastfm', LastfmService);

    function LastfmService($q, $rootScope, $http, localStorageService) {

        var URL = 'https://ws.audioscrobbler.com/2.0/?format=json';
        var API_KEY = 'ec6c0cf905f11806a9156555b11ea75c';
        var API_SECRET = '5361698f1703476b9b18c41b1492dca3';


        var API = {
            Auth: {
                getMobileSession: function (username, password) {
                    var deferred = $q.defer();

                    var params = {
                        username: username,
                        password: password
                    };
                    params = signParams('auth.getMobileSession', params);

                    makeRequest(params)
                        .then(function (response) {
                            API.Auth.setSession(response.session);
                            deferred.resolve(response.session);
                        }, function (response) {
                            deferred.reject(response);
                        });

                    return deferred.promise;
                },
                deleteMobileSession: function () {
                    API.Auth.setSession(null);
                },
                isAuth: function () {
                    return API.Auth.getSession() != null;
                },
                getSession: function () {
                    return localStorageService.get('lastfm.session');
                },
                setSession: function (session) {
                    localStorageService.set('lastfm.session', session);
                }
            },
            Artist: {
                getDetails: function(name){
                    var deferred = $q.defer();

                    $http({
                        url: 'https://listenvideo.com/get-artist?top-tracks=true',
                        method: "POST",
                        data: $.param({name: name}),
                        headers: {'Content-Type': 'application/x-www-form-urlencoded'}
                    }).then((response)=> {
                        if (response.status != 200)
                            deferred.reject(response);
                        deferred.resolve(response.data);
                    }, (response)=> {
                        deferred.reject(response);
                    });

                    return deferred.promise;
                },
                getInfo: function(id) {
                    var params = {autocorrect: 1};

                    var re = new RegExp("([a-fA-F0-9]{8}(-[a-fA-F0-9]{4}){3}-[a-fA-F0-9]{12})");
                    if(re.test(id)){
                        //It's a MBID
                        params.mbid = id;
                    }else{
                        //It's an Artist's name
                        params.artist = id;
                    }
                    params = makeParams('artist.getInfo', params);

                    return makeRequest(params);
                },
                getTopTracks: function(id){
                    var params = {autocorrect: 1};
                    var re = new RegExp("([a-fA-F0-9]{8}(-[a-fA-F0-9]{4}){3}-[a-fA-F0-9]{12})");
                    if(re.test(id)){
                        //It's a MBID
                        params.mbid = id;
                    }else{
                        //It's an Artist's name
                        params.artist = id;
                    }
                    params = makeParams('artist.getTopTracks', params);

                    return makeRequest(params);
                },
                getTopAlbums: function(id){
                    var params = {autocorrect: 1};
                    var re = new RegExp("([a-fA-F0-9]{8}(-[a-fA-F0-9]{4}){3}-[a-fA-F0-9]{12})");
                    if(re.test(id)){
                        //It's a MBID
                        params.mbid = id;
                    }else{
                        //It's an Artist's name
                        params.artist = id;
                    }
                    params = makeParams('artist.getTopAlbums', params);

                    return makeRequest(params);
                },
                search: function(name, limit){
                    var params = {
                        artist: name,
                        limit: limit
                    };
                    params = makeParams('artist.search', params);
                    return makeRequest(params);
                }
            },
                Album: {
                search: function(name, limit){
                    var params = {
                        artist: name,
                        limit: limit
                    };
                    params = makeParams('album.search', params);
                    return makeRequest(params);
                }
            },
            Track: {
                scrobble: function (title, artist) {
                    var deferred = $q.defer();
                    var ts = Math.floor(Date.now() / 1000);

                    var params = {
                        artist: artist,
                        track: title,
                        timestamp: ts
                    };
                    params = signParams('track.scrobble', params, true);

                    makeRequest(params)
                        .then(function (response) {
                            console.log(response);
                        }, function (response) {
                            console.log(response);
                        });

                    return deferred.promise;
                }
            },
            Chart: {
                getTopArtists: function () {
                    var params = makeParams('chart.getTopArtists');
                    return makeRequest(params);
                },
                getTopTags: function () {
                    var params = makeParams('chart.getTopTags');
                    return makeRequest(params);
                },
                getTopTracks: function () {
                    var params = makeParams('chart.getTopTracks');
                    return makeRequest(params);
                }
            }

        };

        function makeParams(method, params) {
            if(typeof params != 'object')
                params = {};
            params.method = method;
            params.api_key = API_KEY;
            return params;
        }

        function signParams(method, params, authenticated) {
            makeParams(method, params);
            if (authenticated) {
                params.sk = API.Auth.getSession().key;
            }
            var keys = Object.keys(params).sort();

            var api_sig = '';
            keys.forEach((key)=> {
                api_sig += key + params[key];
            });
            api_sig += API_SECRET;
            api_sig = md5(api_sig);

            params.api_sig = api_sig;

            return params;
        }

        function makeRequest(params) {
            var deferred = $q.defer();

            $http({
                url: URL,
                method: "POST",
                data: $.param(params),
                headers: {'Content-Type': 'application/x-www-form-urlencoded'}
            }).then((response)=> {
                if (response.status != 200 || response.statusText != 'OK')
                    deferred.reject(response);
                deferred.resolve(response.data);
            }, (response)=> {
                deferred.reject(response);
            });

            return deferred.promise;
        }

        $rootScope.$on('audio.load', function (event, track) {
            if (API.Auth.isAuth()) {
                API.Track.scrobble(track.tag.title, track.tag.artist[0]);
            }
        });

        return API;
    }
})();