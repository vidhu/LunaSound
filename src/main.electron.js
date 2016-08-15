'use strict';

const electron = require('electron');
const {app} = electron;
const {BrowserWindow} = electron;
const path = require('path');
require('electron-debug')();

process.env.BASE_DIR = __dirname;
process.env.MUSIC_DIR = path.join(__dirname, 'music');
process.env.ffmpeg = path.join(__dirname, 'lib/ffmpeg/ffmpeg.exe');
process.env.fpcalc = path.join(__dirname, '/lib/fpcalc/fpcalc.exe');

let bootWindow = null;
let mainWindow = null;



app.on('ready', function () {
    let displays = electron.screen.getAllDisplays();
    let externalDisplay = displays.find((display) => {
        return display.bounds.x < 0 || display.bounds.y > 0
    });

    if (process.env.NODE_ENV == 'development') {
        mainWindow = new BrowserWindow({
            x: externalDisplay.bounds.x + 100,
            y: externalDisplay.bounds.y + 100,
            height: 768,
            width: 1366
        });
        //mainWindow.maximize(true);
        //mainWindow.webContents.openDevTools();
    } else {
        mainWindow = new BrowserWindow({
            height: 768,
            width: 1366,
            frame: false
        });
    }

    mainWindow.loadURL('file://' + __dirname + '/app/index.compiled.html');
});


app.on('window-all-closed', () => {
    app.quit();
});
/*
 frame: false,
 resizable: false,
 */