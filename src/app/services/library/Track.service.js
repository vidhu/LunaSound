module.exports = function TrackModel($q, $http) {
    const path = require('path');
    const youtubedl = require('youtube-dl');

    function Track(data) {
        this.URL = data.URL;
        this.tag = data.tag;

        this.getId = function () {
            return path.basename(this.URL);
        };

        this.getRelativeURL = function (from) {
            if (!from) from = process.env.MUSIC_DIR;
            return path.relative(from, this.URL);
        };

        this.getStreamableUrl = function () {
            var deferred = $q.defer();

            var re = new RegExp("^(http(s)?:\/\/)?((w){3}.)?youtu(be|.be)?(\.com)?\/.+");
            if (re.test(this.URL)) {
                //It's a youtube url
                return getYoutubeStreamable(this.URL);
            } else if(this.URL == '') {
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


    return Track;
};