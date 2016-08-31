module.exports = function TrackModel($q, $http, settings) {
    const path = require('path');
    const youtubedl = require('youtube-dl');
    youtubedl.setBinPath(ENV.youtubedl);

    function Track(data) {
        this.URL = data.URL;

        this.streamableURL = null;
        this.streamableExpiry = null;

        this.tag = data.tag;

        this.getId = function () {
            return path.basename(this.URL);
        };

        this.getRelativeURL = function (from) {
            if (!from) from = settings.getMusicDir();
            return path.relative(from, this.URL);
        };

        this.getStreamableUrl = function () {
            var deferred = $q.defer();


            if (this.getType() == 'youtube') {
                //If streamable URL is available and not expired, resolve to that
                if(this.streamableURL && this.streamableExpiry > Math.floor(Date.now()/1000)) {
                    console.log("Found streamable Url");
                    deferred.resolve(this.streamableURL);
                }else{
                    console.log("Looking up new streamable URL");
                    getYoutubeStreamable(this.URL)
                    .then((url)=>{
                        this.streamableURL = url;
                        this.streamableExpiry = getParameterByName(url, 'expire');
                        if(!this.streamableExpiry)
                            this.streamableExpiry = Math.floor(Date.now()/1000) + 7200 //2hrs expiry
                        deferred.resolve(this.streamableURL);
                    });
                }
            } else if(this.getType() == 'youtube-nostream') {
                //Attempt to find youtube URL
                $http.get('https://www.listenvideo.com/search-audio/'+ this.tag.title + '/' + this.tag.artist[0])
                .then((response)=>{
                    this.URL = 'https://www.youtube.com/v/' + response.data.id;
                    return getYoutubeStreamable(this.URL);
                }).then((youtubeStreamable)=>{
                    deferred.resolve(youtubeStreamable);
                });
            }else{
                //It's a local file
                deferred.resolve(this.URL);
            }

            return deferred.promise;
        };

        this.getType = function(){
            //type: {local, youtube, youtube-nostream}
            if(this.URL == ''){
                return 'youtube-nostream';
            }
            var re = new RegExp("^(http(s)?:\/\/)?((w){3}.)?youtu(be|.be)?(\.com)?\/.+");
            if(re.test(this.URL)){
                return 'youtube';
            }else{
                return 'local';
            }
        };

        function getYoutubeStreamable(url){
            var deferred = $q.defer();

            //Its a youtube url
            var video = youtubedl.getInfo(url, function (err, info) {
                if (err){
                    deferred.reject(err);
                    throw err;
                }
                deferred.resolve(info.url);
            });

            return deferred.promise;
        }
    }

    function getParameterByName(url, name) {
        if (!url) url = window.location.href;
        name = name.replace(/[\[\]]/g, "\\$&");
        var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"),
            results = regex.exec(url);
        if (!results) return null;
        if (!results[2]) return '';
        return decodeURIComponent(results[2].replace(/\+/g, " "));
    }

    return Track;
};