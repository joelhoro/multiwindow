
const remote = require('electron');
console.log("Remote: ", remote);
var {ipcRenderer } = require('electron');
const {Menu} = require('electron').remote;

function xyz() {
    console.log("xyz");
}

ipcRenderer.on('request', function(){
    ipcRenderer.send('hello', {a:123});
    
});

// var authButton = document.getElementById('x');
// authButton.addEventListener('click', function(){
//     ipcRenderer.sendSync('new-window');
// });

// function x() {
//     debugger;
// }




const menu = Menu.buildFromTemplate([{
    label: '&File',
    submenu: [
        {
            label: '&Save settings',
            click() {
                ipcRenderer.send('save-settings');
            }
        },
        {
            label: '&New window',
            click() {
                console.log("Requesting new window");
                ipcRenderer.send('new-window');
            }
        },
        {
            label: '&Quit',
            click() {
                remote.getCurrentWindow().close();
            }
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