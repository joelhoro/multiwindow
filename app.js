// Modules to control application life and create native browser window
const {app, BrowserWindow, } = require('electron')
const {MultiWindowApp} = require('./utils/multiwindowapp');

const preserveState = true;
var main = new MultiWindowApp();

// EVENTS

app.whenReady().then(() => {

  main.initialize(preserveState);

  app.on('activate', function () {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) main.createWindow()
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
