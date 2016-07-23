module.exports = function TrackModel() {
    const path = require('path');

    function Track(data) {
        this.URL = data.URL;
        this.tag = data.tag;

        this.getId = function () {
            return path.basename(this.URL);
        };

        this.getRelativeURL = function (from) {
            if(!from) from = process.env.MUSIC_DIR;
            return path.relative(from, this.URL);
        };
    }


    return Track;
};