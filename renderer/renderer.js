
var {ipcRenderer } = require('electron');
var {messages} = require('../utils/apputils');

ipcRenderer.on(messages.UPDATE, () => {
    var x = { y: vue.y };
    ipcRenderer.send(messages.UPDATE_RESPONSE, x);
})

ipcRenderer.on(messages.SET_VALUES, (evt,argv) => {
    debugger;
    console.log("Received ", argv)
    Object.keys(argv).map(k => Vue.set(vue, k, argv[k]));
});

var vue;
var Vue;
function renderVue(VueLib) {
    Vue = VueLib
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
    
    vue = new Vue({
      el: '#main',
      watch,
      data
    });
}

