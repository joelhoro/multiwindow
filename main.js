const {Menu} = require('electron').remote;
const ipc = require('electron').ipcRenderer


const menu = Menu.buildFromTemplate([{
    label: '&File',
    submenu: [
        {
            label: '&Save settings',
            click() {
                ipc.send('save-settings');
            }
        },
        {
            label: '&New window',
            click() {
                ipc.send('new-window');
            }
        },
    ]
}])

Menu.setApplicationMenu(menu);