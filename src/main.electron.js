'use strict';

const electron = require('electron');
const {app} = electron;

const path = require('path');
const fs = require('fs');
require('electron-debug')({ enabled: true });

process.env.BASE_DIR = __dirname;
process.env.USER_DATA = path.join(app.getPath('appData'), 'LunaSound');
process.env.MUSIC_DIR = path.join(__dirname, 'music');
process.env.ffmpeg = path.join(__dirname, 'lib/ffmpeg/ffmpeg.exe');
process.env.fpcalc = path.join(__dirname, '/lib/fpcalc/fpcalc.exe');

//Create USER_DATA dir if doesn't exists
if (!fs.existsSync(process.env.USER_DATA)){
    fs.mkdirSync(process.env.USER_DATA);
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
});


app.on('window-all-closed', () => {
    app.quit();
});

/*
 frame: false,
 resizable: false,
 */