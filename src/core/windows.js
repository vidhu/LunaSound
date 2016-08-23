const electron = require('electron');
const {BrowserWindow, ipcMain} = electron;
const path = require('path');

module.exports = {
    getBootWindow: function(){
        var win = null;
        if (process.env.NODE_ENV == 'development') {
            win = new BrowserWindow({
                height: 300,
                width: 533,
                show: false
            });
        } else {
            win = new BrowserWindow({
                height: 768,
                width: 1366,
                frame: false,
                show: false
            });
        }
        win.loadURL('file://' + process.env.BASE_DIR + '/boot/index.html');
        return win;
    },
    getMainWindow: function(){
        var win = null;
        if (process.env.NODE_ENV == 'development') {
            win = new BrowserWindow({
                height: 720,
                width: 1280,
                show: false
            });
        } else {
            win = new BrowserWindow({
                height: 720,
                width: 1280,
                frame: false,
                show: false
            });
        }


        win.on('show', ()=>{
            const thumbarButtons = [
                {
                    tooltip: 'previous track',
                    icon: path.join(process.env.BASE_DIR, 'assets', 'img', 'media_prev.png'),
                    click () {
                        console.log('track prev clicked');
                        win.webContents.send('mediaCtrl', 'prev');
                    }
                },
                {
                    tooltip: 'play or pause track',
                    icon: path.join(process.env.BASE_DIR, 'assets', 'img', 'media_play.png'),
                    click () {
                        console.log('track play/pause clicked');
                        win.webContents.send('mediaCtrl', 'playpause');
                    }
                },
                {
                    tooltip: 'next track',
                    icon: path.join(process.env.BASE_DIR, 'assets', 'img', 'media_next.png'),
                    click () {
                        console.log('track next clicked');
                        win.webContents.send('mediaCtrl', 'next');
                    }
                }
            ];
            win.setThumbarButtons(thumbarButtons);

            ipcMain.on('audio-state', (event, paused) => {
                if(paused){
                    console.log("Setting image to play");
                    thumbarButtons[1].icon = path.join(process.env.BASE_DIR, 'assets', 'img', 'media_play.png');
                }else{
                    console.log("Setting image to pause");
                    thumbarButtons[1].icon = path.join(process.env.BASE_DIR, 'assets', 'img', 'media_pause.png');
                }
                win.setThumbarButtons(thumbarButtons);
            });
        });

        win.loadURL('file://' + process.env.BASE_DIR + '/app/index.compiled.html');
        return win;
    }
};

function test(){
    console.log("hi!");
}