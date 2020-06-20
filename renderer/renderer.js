
const remote = require('electron');
var {ipcRenderer } = require('electron');
const {Menu} = require('electron').remote;

const menu = Menu.buildFromTemplate([{
    label: '&File',
    submenu: [
        {
            label: '&New window',
            accelerator: 'CmdOrCtrl+N',
            click() {
                ipcRenderer.send('new-window');
            }
        },
        {
            label: '&Save settings',
            accelerator: 'CmdOrCtrl+S',
            click() {
                ipcRenderer.send('save-settings');
            }
        },
        {
            role: 'reload'
        },
        {
            role: 'close'
        },

    ]
},
{    label: '&Debug',
    click() {
        debugger;
    }

},
{    label: '&Debug remote',
    click() {
        ipcRenderer.send('debug');
    }

},
])

Menu.setApplicationMenu(menu);

ipcRenderer.on('update', () => {
    var x = $$('slider').getValue();
    ipcRenderer.send('update-response', x);
})