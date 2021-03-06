'use strict';
const electron = require('electron');
const {app, globalShortcut} = electron;

const path = require('path');
const fs = require('fs');
require('electron-debug')({ enabled: true });

const packageJson = JSON.parse(fs.readFileSync(path.join(__dirname, 'package.json')));

//Set Variables
process.env.version = packageJson.version;

//Set directories
process.env.BASE_DIR = __dirname;
process.env.USER_DATA = path.join(app.getPath('appData'), 'lunasound');
process.env.MUSIC_DIR = path.join(process.env.USER_DATA, 'music');

if(process.platform === 'win32') {
	process.env.ffmpeg = path.join(__dirname, 'lib/win32/ffmpeg/ffmpeg.exe');
	process.env.fpcalc = path.join(__dirname, 'lib/win32/fpcalc/fpcalc.exe');
    process.env.youtubedl = path.join(__dirname, 'lib/win32/youtube-dl/youtube-dl.exe');
}else if(process.platform === 'linux') {
	process.env.ffmpeg = path.join(__dirname, 'lib/linux/ffmpeg/ffmpeg');
	process.env.fpcalc = path.join(__dirname, 'lib/linux/fpcalc/fpcalc');
    process.env.youtubedl = path.join(__dirname, 'lib/linux/youtube-dl/youtube-dl');
}else if(process.platform === 'darwin') {
    process.env.ffmpeg = path.join(__dirname, 'lib/mac/ffmpeg/ffmpeg');
    process.env.fpcalc = path.join(__dirname, 'lib/mac/fpcalc/fpcalc');
    process.env.youtubedl = path.join(__dirname, 'lib/mac/youtube-dl/youtube-dl');
}

//Create USER_DATA dir if doesn't exists
if (!fs.existsSync(process.env.USER_DATA)){
    fs.mkdirSync(process.env.USER_DATA);
}

//Create MUSIC_DIR if doesn't exists
if (!fs.existsSync(process.env.MUSIC_DIR)){
    fs.mkdirSync(process.env.MUSIC_DIR);
}

let bootWindow = null;
let mainWindow = null;

app.on('ready', function () {
    let windows = require('./core/windows');
    //bootWindow = windows.getBootWindow();
    mainWindow = windows.getMainWindow();

    mainWindow.once('ready-to-show', () => {
        mainWindow.show();
    });

    mainWindow.on('closed', () => {
        app.quit();
    });

    globalShortcut.register('MediaPlayPause', () => {
        console.log("key: playpause");
        mainWindow.webContents.send('mediaCtrl', 'playpause');
    });
    globalShortcut.register('MediaPreviousTrack', () => {
        console.log("key: MediaPreviousTrack");
        mainWindow.webContents.send('mediaCtrl', 'prev');
    });
    globalShortcut.register('MediaNextTrack', () => {
        console.log("key: MediaNextTrack");
        mainWindow.webContents.send('mediaCtrl', 'next');
    });
    globalShortcut.register('MediaStop', () => {
        console.log("key: MediaStop ");
        mainWindow.webContents.send('mediaCtrl', 'stop');
    });


    // Check whether a shortcut is registered.
    console.log(globalShortcut.isRegistered('Esc'));
});


app.on('window-all-closed', () => {
    app.quit();
});


/*
 frame: false,
 resizable: false,
 */
