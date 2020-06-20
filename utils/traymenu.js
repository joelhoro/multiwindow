const {app, Menu, Tray, nativeImage} = require('electron')

var componentTypes = [
    'Risk viewer',
    'VolGUI addin',
    'Browser',
  ];
  
  var layouts = [
    'Bob',
    'Alice',
    'Charles',
  ]


let TrayMenu = class {
    constructor(main) {
        this.main = main;
        this.count = 1;
        this.tray = new Tray('build/iconinv.png')
        this.tray.setToolTip('VolGUI')
        this.createMenuItems();
    }

    switchToLayout(layout) {
        console.log("Switching to " + layout);
        }
        
    refresh() {
        componentTypes.push("New component " + String(this.count++));
        this.createMenuItems();
    }
       
    notify(type, content) {
        let img = nativeImage.createFromPath('../build/iconinv.png');
    
        this.tray.displayBalloon({
          icon: img,
          iconType: type,
          title: 'VolGUI notification',
          content
        });
    }
    
    createMenuItems() {
        var thisCopy = this;
        const contextMenu = Menu.buildFromTemplate([
            { label: 'Switch to layout', submenu: layouts.map(layout => ({
            label: layout,
            click: () => switchToLayout(layout)
            }))},
            { label: 'New VolGUI component', submenu: componentTypes.map(t => ({
            label: t,
            click: () => main.createWindow()
            }))  
            },
            { label: 'Refresh', click: thisCopy.refresh },
            { label: 'Save', click: thisCopy.main.savesettings },
            { label: 'Exit', click: app.exit },
        ])
        var tray = this.tray
        tray.setContextMenu(contextMenu)
        tray.on('click', () => tray.popUpContextMenu());
        this.notify("info","VolGUI started");
    }
}

exports.TrayMenu = TrayMenu;