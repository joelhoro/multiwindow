const {app, Menu, Tray, nativeImage, shell} = require('electron')
var execFile = require('child_process').execFile;

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

var LINKTYPE = {
    URL: 'url'
}

function Link(label, url) {
    return { label, action: (trayMenu) => {
            shell.openExternal(url);
            trayMenu.notify('info', `Opening ${label} [${url}]`)
        }
    }
}

function Shell(label, program, args) {
    return { label, action: (trayMenu) => {
            execFile(program, args.split(' '));
            trayMenu.notify('info', `Opening ${label} [${program}]`)
        }
    }
}

var links = [
    Link('Google', 'http://www.google.com'),
    Link('CNN', 'http://www.cnn.com'),
    Link('Disney', 'http://www.disney.com'),
    { type: 'separator'},
    Shell('Putty localhost', "C:\\Program Files\\PuTTY\\putty.exe","-load Local"),
    Shell('Putty joel@localhost', "C:\\Program Files\\PuTTY\\putty.exe","-ssh joel@localhost 2222")
]

function linkMenu(trayMenu) {
    return links.map(link => (link.type? link : {
        label: link.label, 
        click: () => link.action(trayMenu),
    }))
} 

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
          title: 'VolGUI',
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
            { label: 'Links', submenu: linkMenu(thisCopy) },
            { label: 'Refresh', click: thisCopy.refresh },
            { label: 'Save', click: thisCopy.main.savesettings },
            { label: 'Exit', click: app.exit },
        ])
        //Shell('Putty', "C:\\Program Files\\PuTTY\\putty.exe",  " -load Local").action(thisCopy);

        var tray = this.tray;
        tray.setContextMenu(contextMenu)
        tray.on('click', () => tray.popUpContextMenu());
        this.notify("info","VolGUI started");
    }
}

exports.TrayMenu = TrayMenu;