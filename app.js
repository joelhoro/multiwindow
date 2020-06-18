// Modules to control application life and create native browser window
const {app, BrowserWindow} = require('electron')
const path = require('path')
const ipc = require('electron').ipcMain
const fs = require('fs');

var settings_file = 'settings.json'

var windows = []

function createWindow (settings) {
  if(!settings) {
    settings = { size: { width: 600, height: 400 } };
  }
  const mainWindow = new BrowserWindow({
    width: settings.size[1],
    height: settings.size[0],
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: true
    }
  })
  if(settings.position)
    mainWindow.setPosition(settings.position[0],settings.position[1])

  windows.push(mainWindow);

  // and load the index.html of the app.
  mainWindow.loadURL('file://' + __dirname + "/index.html")

  // Open the DevTools.
  //mainWindow.webContents.openDevTools()
  mainWindow.setTitle("Window #" + windows.length);

  function showCoordinates() {
    console.log("======== Resize / Move =========");
    console.log(windows);
    windows.map(w => {
      console.log("Window: ", w);
      console.log(w.getTitle());
      console.log("Size: ", w.getSize())
      console.log("Position: ", w.getPosition())
    })
  }

  // mainWindow.on('resize', showCoordinates);
  // mainWindow.on('move', showCoordinates);
  mainWindow.on('closed', () => {
    console.log("Closing window");
    console.log("Windows: ", windows.length);
    var index = windows.indexOf(mainWindow);
    console.log("Deleting #", index);
    windows.splice(index,1);
    console.log("Windows: ", windows.length);
  });
  ipc.on('save-settings', () => {
    showCoordinates();
    var data = windows.map(w => ({
      title: w.getTitle(),
      size: w.getSize(),
      position: w.getPosition()
    }));
    try { 
      fs.writeFileSync(settings_file, JSON.stringify(data), 'utf-8'); 
    }
    catch(e) { 
      console.error('Failed to save the file !'); 
    }
  })

  ipc.on('new-window', (evt,args) => {
    createWindow();
  })
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
  fs.readFile(settings_file, 'utf-8', function(err, data) {
    var settings = JSON.parse(data);
    settings = [undefined];
    console.log(settings)
    settings.map(setting => {
      console.log("Setting: ", setting);
      createWindow(setting);
    } )
  })
  
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
