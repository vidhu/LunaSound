const electron = require('electron');
const {BrowserWindow} = electron;

let displays = electron.screen.getAllDisplays();
let externalDisplay = displays.find((display) => {
    return display.bounds.x < 0 || display.bounds.y > 0
});

module.exports = {
    getBootWindow: function(){
        if (process.env.NODE_ENV == 'development') {
            mainWindow = new BrowserWindow({
                x: externalDisplay.bounds.x + 100,
                y: externalDisplay.bounds.y + 100,
                height: 300,
                width: 533,
                show: false
            });
        } else {
            mainWindow = new BrowserWindow({
                height: 768,
                width: 1366,
                frame: false,
                show: false
            });
        }
        mainWindow.loadURL('file://' + process.env.BASE_DIR + '/boot/index.html');
        return mainWindow;
    },
    getMainWindow: function(){
        if (process.env.NODE_ENV == 'development') {
            mainWindow = new BrowserWindow({
                x: externalDisplay.bounds.x + 100,
                y: externalDisplay.bounds.y + 100,
                height: 768,
                width: 1366,
                show: false
            });
        } else {
            mainWindow = new BrowserWindow({
                height: 768,
                width: 1366,
                frame: false,
                show: false
            });
        }
        mainWindow.loadURL('file://' + process.env.BASE_DIR + '/app/index.compiled.html');
        return mainWindow;
    }
};