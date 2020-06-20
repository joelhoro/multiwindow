// Modules to control application life and create native browser window
const {app, Menu, BrowserWindow, Tray, dialog, ipcRenderer} = require('electron')
const path = require('path')
const ipc = require('electron').ipcMain
const fs = require('fs');
const showCoordinates = require('./utils/apputils').showCoordinates;

console.log(showCoordinates);
showCoordinates();
const preserveState = true;
const openDevTools = true;

//var settings_file = app.getAppPath() + '/settings/settings.json'
var settings_file = 'settings/settings.json';


console.log("Hello")

function getmenu(w) {
  return Menu.buildFromTemplate([{
    label: '&File',
    submenu: [
        {
            label: '&Save settings',
            click() {
                savesettings();
            }
        },
        {
            label: '&New window',
            click() {
                console.log("Requesting new window");
                createWindow();
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
        label: 'Main',
        click() {
          debugger;
      }
    }
    ]
  }
  ])

}


function createWindow (settings) {

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

  newWindow.setMenu(getmenu(newWindow));
  newWindow.loadURL('file://' + __dirname + "/renderer/index.html")
  if(openDevTools)
    newWindow.webContents.openDevTools()

  newWindow.setTitle("Window #" + BrowserWindow.getAllWindows().length);
  newWindow.focus();
  newWindow.webContents.on('dom-ready', () =>  {
    if(settings.data)
      newWindow.send('set', settings.data)
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


// EVENTS

ipc.on('new-window', createWindow);

ipc.on('debug', (evt,args) => { debugger; })

var window_values = {}
ipc.on('change', (evt,args) => {
  window_values[evt.sender.id] = args;
  console.log("Change: ", args)
  //BrowserWindow.getAllWindows().map(w => w.send('set',args));
});


var updates = {}
function savesettings() {
  BrowserWindow.getAllWindows().map(w => w.send('update'));
  ipc.on('update-response', (evt,args) => {
    updates[evt.sender.id] = args;
    if(Object.keys(updates).length == BrowserWindow.getAllWindows().length) {
      showCoordinates();
      var data = BrowserWindow.getAllWindows().map(w => {
        return {
          data: updates[w.id],
          title: w.getTitle(),
          size: w.getSize(),
          position: w.getPosition()
        }
      });
      updates = {}
      try {
        console.log("Saving data: ", data, " to ", settings_file);
        fs.writeFileSync(settings_file, JSON.stringify(data), 'utf-8');
      }
      catch(e) {
        console.error('Failed to save the file !');
      }
    }
  });
  console.log(`Saved to ${settings_file} on ${new Date()}`);
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.

app.whenReady().then(() => {
  tray = new Tray('build/icon.ico')
  const contextMenu = Menu.buildFromTemplate([
    { label: 'New VolGUI component', click: () => createWindow() },
    { label: 'Save', click: savesettings },
    { label: 'Exit', click: app.exit },
  ])
  tray.setToolTip('This is my application.')
  tray.setContextMenu(contextMenu)

  if(preserveState)
    fs.readFile(settings_file, 'utf-8', function(err, data) {
      var settings = JSON.parse(data);
      console.log(settings)
      settings.map(setting => {
        console.log("Setting: ", setting);
        createWindow(setting);
      } )
  })
  else
    createWindow()
    
  app.on('activate', function () {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') app.quit()
})

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.
