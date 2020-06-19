// Modules to control application life and create native browser window
const {app, BrowserWindow, dialog} = require('electron')
const path = require('path')
const ipc = require('electron').ipcMain
const fs = require('fs');

const preserveState = false;
const openDevTools = true;

var settings_file = app.getAppPath() + '/settings/settings.json'


console.log("Hello")

function createWindow (settings) {
  if(!settings) {
    settings = { size: { width: 900, height: 800 } };
  }

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
}

ipc.on('new-window', (evt,args) => {
  createWindow();
})

ipc.on('debug', (evt,args) => { debugger; })
ipc.on('hello', (evt,args) => { console.log(args); })

function showCoordinates() {
  console.log("======== Resize / Move =========");
  //console.log(windows);
  BrowserWindow.getAllWindows().map(w => {
    //console.log("Window: ", w);    
    console.log(w.getTitle());
    console.log("Size: ", w.getSize())
    console.log("Position: ", w.getPosition())
    console.log("X: ", w.document)
  })
}

var window_values = {}

ipc.on('change', (evt,args) => {
  window_values[evt.sender.id] = args;
  console.log("Change: ", args)

  //BrowserWindow.getAllWindows().map(w => w.send('set',args));
});

ipc.on('save-settings', (args) => {
  
  showCoordinates();
  var data = BrowserWindow.getAllWindows().map(w => {
    
    return {
      data: window_values[w.id],
      title: w.getTitle(),
      size: w.getSize(),
      position: w.getPosition()
    }
  });
  try { 
    console.log("Saving data: ", data);
    fs.writeFileSync(settings_file, JSON.stringify(data), 'utf-8'); 
  }
  catch(e) { 
    console.error('Failed to save the file !'); 
  }
})

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.

app.whenReady().then(() => {
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
