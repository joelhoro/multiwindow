
var {ipcRenderer } = require('electron');
var {MESSAGES} = require('../utils/apputils');

ipcRenderer.on(MESSAGES.UPDATE, (evt, args) => {
    var state = webix.UIManager.getState("main", true);
    ipcRenderer.send(MESSAGES.UPDATE_RESPONSE, { data: vue.$data, id: args.id, state });
})

ipcRenderer.on(MESSAGES.SET_VALUES, (evt,argv) => {
    webix.UIManager.setState(argv.state);
    var data = argv.data;
    Object.keys(data).map(k => Vue.set(vue, k, data[k]));
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

