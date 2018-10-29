# LunaSound
LunaSound is a music player built using web frontend technologies and powered
by Electron to concieve a beautiful responsive music player.

![LunaSound ScreenShot](http://i.imgur.com/ySbqmUS.png)

## Features
* Basic music player features (playlist/play queue/library management)
* Download from Youtube
  - Automatically download mp3 from youtube URLs
  - Auto Tagging support

Planned Features for next major update
- [ ] Cross Platform Support (Windows, Linux, OSX)
- [x] Last.fm integration
- [x] Frontpage for Tracks
- [x] Artist's Pages and Tracks

## Technologies Used
### Application
* Electron
* AngularJs 1.5
* EMCAScript 5 for Chrome V8
* Node.Js
* HTML5
* CSS3
* ffmpeg
* fpcalc (Chromaprint)

### Build Framework
* Gulp
* Bower
* Node.Js
* eslint

## Build Instructions
### Install

    git clone https://github.com/vidhu/LunaSound.git
    npm install
    cd ./src
    npm install
    bower install

### Build
##### Prerequisites

    nodejs, gulp 4.0, bower, wine (building windows binary)

Building the application

    gulp build

 - When building on windows, only **win32** and **linux** binaries are created
 - When building on linux, only **linux** binaries are created
   - If [wine](https://www.winehq.org/) is installed, **win32** binaries will also be created
 - When building on **OSX**, only **linux** and **OSX** binaries are created
   - If [wine](https://www.winehq.org/) is installed, **win32** binaries will also be created

Running the development version. *Any changes to the source will automatically be
reflected in the application process.*

    gulp serve

### Packaging
Packaging the application for distribution

    gulp package:win32
    gulp package:deb

 - deb creates a debian compatible package for installation and distribution
 - win32 creates a innosetup installer
 - OSX application file is created during build and therefore doesn't require a packageing step

## Contribution
This project is still at its infancy and without any clear roadmap. Therefore,
I will not be accepting any major changes to the application. Things like bug fixes
will definitly be considered.

In addition, please use the GitHub bug tracker to report any bugs

