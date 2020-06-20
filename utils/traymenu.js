const {app, Menu, Tray, nativeImage, shell} = require('electron')
var execFile = require('child_process').execFile;


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

function Separator() {
    return { type: 'separator' }
}


fn_map = {
    link: Link,
    separator: Separator,
    shell: Shell
}


let TrayMenu = class {
    constructor(main, config) {
        this.main = main;
        this.config = config
        this.count = 1;
        this.tray = new Tray('build/iconinv.png')
        this.tray.setToolTip('VolGUI')
        this.createMenuItems();
    }

    switchToLayout(layout) {
        console.log("Switching to " + layout);
        }
        
    refresh() {
        this.config.componentTypes.push("New component " + String(this.count++));
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

    linkMenu(links) {
        var thisCopy = this;
        return links.map(link => {
            var fn = fn_map[link[0]]
            var args = link[1]
            var linkObject;
            if(args)
                linkObject = fn(...args);
            else
                linkObject = fn()
        
            if(linkObject.type)
                return linkObject;
            return {
                label: linkObject.label,
                click: () => linkObject.action(thisCopy),
            }
        })
    }
    
    componentsMenu() {
        var thisCopy = this;
        return this.config.componentTypes.map(t => ({
            label: t,
            click: () => thisCopy.main.createWindow()
        }))  
    }

    layoutsMenu() {
        var thisCopy = this;
        return this.config.layouts.map(layout => ({
            label: layout,
            click: () => thisCopy.switchToLayout(layout)
        }))
    }

    createMenuItems() {
        var config = this.config;
        var thisCopy = this;
        const contextMenu = Menu.buildFromTemplate([
            { label: 'Switch to layout', submenu: this.layoutsMenu() },
            { label: 'New VolGUI component', submenu: this.componentsMenu() },
            { label: 'Links', submenu: this.linkMenu(config.links) },
            { label: 'Refresh', click: () => thisCopy.refresh() },
            { label: 'Save', click: () => thisCopy.main.savesettings() },
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