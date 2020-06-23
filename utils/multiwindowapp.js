// Modules to control application life and create native browser window
const {app, Menu, BrowserWindow} = require('electron')
const path = require('path');
const {showCoordinates, MESSAGES, resourcesPath, isDev} = require('./apputils');
const {TrayMenu} = require('./traymenu');
const {config} = require('./config');
const ipc = require('electron').ipcMain
const fs = require('fs');


const openDevTools = false; //isDev();
var settings_file = resourcesPath('settings/settings.json');

let MultiWindowApp = class {
  constructor() {
    this.updates = {}
  }

  initialize(preserveState) {
    this.traymenu = new TrayMenu(this, config);
    BrowserWindow.getAllWindows().map(w => w.close());
    var thisCopy = this;
    if(preserveState)
      fs.readFile(settings_file, 'utf-8', function(_err, data) {
        if(_err) {
          thisCopy.traymenu.notify('error', `Could not open ${settings_file}`);
          return thisCopy.createWindow();
        }
          
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
  
      //console.log("Settings: ", settings);
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
      console.log("Spawning window #", newWindow.id);
      newWindow.webContents.on('dom-ready', () =>  {
        if(settings.data)
          newWindow.webContents.send(MESSAGES.SET_VALUES, { data: settings.data, state: settings.state })
      })
  
      // mainWindow.on('resize', showCoordinates);
      // mainWindow.on('move', showCoordinates);
      newWindow.on('close', () => {
        newWindow = null;
      });
  
      // var started_moving = false;
      // var start_positions = {};
      // newWindow.on('will-move', (evt,newBounds) => {
      //   var id = newWindow.id;
      //   if(!started_moving) {
      //     console.log("Collecting positions");
      //     BrowserWindow.getAllWindows().map(w => start_positions[w.id] = w.getPosition());
      //     console.log(start_positions);
      //   }
  
      //   started_moving = true;
      //   console.log("Move started");
      //   var currentPosition = newWindow.getPosition();
      //   console.log(newBounds);
      //   var shiftX = newBounds.x-start_positions[id][0];
      //   var shiftY = newBounds.y-start_positions[id][1];
      //   console.log("Shift: ", shiftX, shiftY);
      //   BrowserWindow.getAllWindows().map(w => {
      //     if(w.id == id)
      //       return;
      //     var position = start_positions[w.id];
      //     var newPosition = [position[0]+shiftX, position[1]+shiftY]
      //     //w.setPosition(newPosition[0], newPosition[1]);
      //   })
  
      //   //console.log(newWindow.getPosition());
      //   console.log("===============")
      // })
  
    }
    
  getmenu() {
    var thisCopy = this;
      return Menu.buildFromTemplate([{
        label: '&File',
        submenu: [
            {
                label: '&Reload settings',
                accelerator: 'CmdOrCtrl+R',
                click() {
                    thisCopy.initialize(true);
                }
            },
            {
                label: '&Save settings',
                accelerator: 'CmdOrCtrl+S',
                click() {
                    thisCopy.savesettings();
                }
            },
            {
                label: '&New window',
                accelerator: 'CmdOrCtrl+N',
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
              label: '&Exit app',
              accelerator: 'CmdOrCtrl+E',
            },
    
        ]
      },
      {
        label: '&Window',
        submenu: [
          {
            label: 'Toggle sidebar',
            accelerator: 'CmdOrCtrl+T',
            click(evt, w) {
              w.send('toggleside');
            }
          }
        ]
      },
      {
          label: '&Links',
          submenu: this.traymenu.linkMenu(config.links)
      },
      {    label: '&Debug',
        submenu: [
          {
            label: 'Open devtools',
            accelerator: 'CmdOrCtrl+D',
            click(evt,args) {
              args.toggleDevTools();
            }
          },
          {
            label: 'Hit breakpoint',
            click() {
              debugger;
          }
    
        }
        ]
      }
      ])
    
    }

  savesettings() {
    // seriously the amount of stuff that is done here just to send a message
    // and get a response is insane. Why are window.id not the same on the way back?

    // prepare listeners
    ipc.on(MESSAGES.UPDATE_RESPONSE, (evt,args) => {
      console.log(`Received from ${args.id}: ${JSON.stringify(args.data)}`);
      this.updates[args.id] = { data: args.data, state: args.state };
      // this is stupid - surely there should be a simpler way to do this
      var ready = BrowserWindow.getAllWindows().filter(w => !this.updates[w.id]).length == 0;
      if(ready) {
        showCoordinates();
        var data = BrowserWindow.getAllWindows().map(w => {
          return {
            data: this.updates[w.id].data,
            state: this.updates[w.id].state,
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

    console.log("Sending update message");
    BrowserWindow.getAllWindows().map(w => {
      console.log("Sending message to ", w.id);
      var data = {id: w.id};
      w.send(MESSAGES.UPDATE, data);
    } );
    
  }
        
  }
    
exports.MultiWindowApp = MultiWindowApp