#LunaSound
LunaSound is a music player built using web frontend technologies and powered
by Electron to concieve a beautiful responsive music player.

![LunaSound ScreenShot](http://i.imgur.com/ySbqmUS.png)

##Features
* Basic music player features (playlist/play queue/library management)
* Download from Youtube
  - Automatically download mp3 from youtube URLs
  - Auto Tagging support

Planned Features
- [ ] Cross Platform Support (Windows, Linux, OSX)
- [ ] Last.fm integration
- [ ] Frontpage for Tracks
- [ ] Sync Tracks and Playlists to the cloud
- [ ] Mobile app
- [ ] Web App

##Technologies Used
###Application
* Electron
* AngularJs 1.5
* EMCAScript 5 for Chrome V8
* Node.Js
* HTML5
* CSS3
* ffmpeg
* fpcalc (Chromaprint)

###Build Framework
* Gulp
* Bower
* Node.Js
* eslint

##Build Instructions
###Install

    git clone https://github.com/vidhu/LunaSound.git
    npm install
    cd ./src
    npm install
    bower install

###Build
Building the application

    gulp build

Running the development version. *Any changes to the source will automatically be
reflected in the application process.*

    gulp serve

###Packaging
Packaging the application for distribution

    gulp package

##Contribution
This project is still at its infancy and without any clear roadmap. Therefore,
I will not be accepting any major changes to the application. Things like bug fixes
will definitly be comfigured.

In addition, please use the GitHub bug tracker to report any bugs

