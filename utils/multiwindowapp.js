// Modules to control application life and create native browser window
const {app, Menu, BrowserWindow} = require('electron')
const path = require('path');
const {showCoordinates, messages} = require('./apputils');
const {TrayMenu} = require('./traymenu');
const ipc = require('electron').ipcMain
const fs = require('fs');

const openDevTools = true;
var settings_file = 'settings/settings.json';

let MultiWindowApp = class {
  constructor() {
    this.updates = {}
  }

  initialize(preserveState) {
    this.traymenu = new TrayMenu(this);
    var thisCopy = this;
    if(preserveState)
      fs.readFile(settings_file, 'utf-8', function(_err, data) {
        var settings = JSON.parse(data);
        console.log(settings)
        settings.map(setting => {
          console.log("Setting: ", setting);
          thisCopy.createWindow(setting);
        } )
    })
    else
      this.createWindow()
  }

  createWindow (settings) {
      if(!settings) {
        settings = { size: [900,800] };
      }
  
      console.log("Settings: ", settings);
      let newWindow = new BrowserWindow({
        width: settings.size[0],
        height: settings.size[1],
        webPreferences: {
          preload: path.join(__dirname, 'preload.js'),
          nodeIntegration: true
        }
      })
  
      if(settings.position)
        newWindow.setPosition(settings.position[0],settings.position[1])
  
      newWindow.setMenu(this.getmenu(newWindow));
      newWindow.loadURL('file://' + __dirname + "/../renderer/index.html")
      if(openDevTools)
        newWindow.webContents.openDevTools()
  
      newWindow.setTitle("Window #" + BrowserWindow.getAllWindows().length);
      newWindow.focus();
      newWindow.webContents.on('dom-ready', () =>  {
        if(settings.data)
          newWindow.webContents.send(messages.SET_VALUES, settings.data)
      })
  
      // mainWindow.on('resize', showCoordinates);
      // mainWindow.on('move', showCoordinates);
      newWindow.on('close', () => {
        newWindow = null;
      });
  
      var started_moving = false;
      var start_positions = {};
      newWindow.on('will-move', (evt,newBounds) => {
        var id = newWindow.id;
        if(!started_moving) {
          console.log("Collecting positions");
          BrowserWindow.getAllWindows().map(w => start_positions[w.id] = w.getPosition());
          console.log(start_positions);
        }
  
        started_moving = true;
        console.log("Move started");
        var currentPosition = newWindow.getPosition();
        console.log(newBounds);
        var shiftX = newBounds.x-start_positions[id][0];
        var shiftY = newBounds.y-start_positions[id][1];
        console.log("Shift: ", shiftX, shiftY);
        BrowserWindow.getAllWindows().map(w => {
          if(w.id == id)
            return;
          var position = start_positions[w.id];
          var newPosition = [position[0]+shiftX, position[1]+shiftY]
          //w.setPosition(newPosition[0], newPosition[1]);
        })
  
        //console.log(newWindow.getPosition());
        console.log("===============")
      })
  
    }
    
  getmenu = () => {
    var thisCopy = this;
      return Menu.buildFromTemplate([{
        label: '&File',
        submenu: [
            {
                label: '&Save settings',
                click() {
                    thisCopy.savesettings();
                }
            },
            {
                label: '&New window',
                click() {
                    console.log("Requesting new window");
                    thisCopy.createWindow();
                }
            },
            {
              type: 'separator'
            },
            {
              role: 'close',
              label: 'Close window'
            },
            {
              click: app.exit,
              label: '&Exit app'
            },
    
        ]
      },
      {    label: '&Debug',
        submenu: [
          {
            label: 'Open devtools',
            click(evt,args) {
              args.openDevTools();
            }
          },
          {
            label: 'Hit breakpoing',
            click() {
              debugger;
          }
    
        }
        ]
      }
      ])
    
    }

  savesettings() {
    BrowserWindow.getAllWindows().map(w => w.send(messages.UPDATE));
    ipc.on(messages.UPDATE_RESPONSE, (evt,args) => {
      this.updates[evt.sender.id] = args;
      if(Object.keys(this.updates).length == BrowserWindow.getAllWindows().length) {
        showCoordinates();
        var data = BrowserWindow.getAllWindows().map(w => {
          return {
            data: this.updates[w.id],
            title: w.getTitle(),
            size: w.getSize(),
            position: w.getPosition()
          }
        });
        this.updates = {}
        try {
          console.log("Saving data: ", data, " to ", settings_file);
          fs.writeFileSync(settings_file, JSON.stringify(data), 'utf-8');
          this.traymenu.notify('info', `Saved to ${settings_file}`);
        }
        catch(e) {
          console.error('Failed to save the file !');
          this.traymenu.notify('error', `Could not save to ${settings_file}`);
        }
      }
    });
  }
        
  }
    
exports.MultiWindowApp = MultiWindowApp