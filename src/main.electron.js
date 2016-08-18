'use strict';

const electron = require('electron');
const {app} = electron;

const path = require('path');
require('electron-debug')({ enabled: true });

process.env.BASE_DIR = __dirname;
process.env.MUSIC_DIR = path.join(__dirname, 'music');
process.env.ffmpeg = path.join(__dirname, 'lib/ffmpeg/ffmpeg.exe');
process.env.fpcalc = path.join(__dirname, '/lib/fpcalc/fpcalc.exe');



let bootWindow = null;
let mainWindow = null;

app.on('ready', function () {
    let windows = require('./core/windows');
    bootWindow = windows.getBootWindow();
    mainWindow = windows.getMainWindow();

    mainWindow.once('ready-to-show', () => {
        mainWindow.show();
    });
});


app.on('window-all-closed', () => {
    app.quit();
});

/*
 frame: false,
 resizable: false,
 */