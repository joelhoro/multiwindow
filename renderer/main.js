
const remote = require('electron');
console.log("Remote: ", remote);
var {ipcRenderer } = require('electron');
const {Menu} = require('electron').remote;

function renderVue(Vue) {
    var data = {
        x: 123,
        y: 'A'
    }

    var keys = ['x','y'];
    var watch = {}
    keys.map(variable => watch[variable] = function(old,newV) {
      ipcRenderer.send("change", vue.$data);
    });

    ipcRenderer.on('set', (e,changes) => {
      _.keys(changes).map(k => Vue.set(vue,k,changes[k]));
    })
    
    var vue = new Vue({
      el: '#main',
      watch,
      data
    });
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