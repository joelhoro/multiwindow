const { BrowserWindow, nativeImage } = require('electron');
const path = require('path');

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
  
  var MESSAGES = {
    UPDATE: 'UPDATE',
    UPDATE_RESPONSE: 'UPDATE-RESPONSE',
    NEW_WINDOW: 'NEW-WINDOW',
    SET_VALUES: 'SET_VALUES'
  }

  function isDev() {
    return process.env.NODE_ENV == 'dev';
  }

  function resourcesPath(file) {
    var basePath;
    if (isDev()) {
        console.log("Running in dev mode");
        basePath = path.join('assets')
      } else {
        console.log("Running in prod");
        basePath = path.join(process.resourcesPath, 'assets', '')  
      }
    var fullPath = `${basePath}\\${file}`
    console.log("Resources: ", fullPath);
    return fullPath;
  }

  exports.showCoordinates = showCoordinates
  exports.resourcesPath = resourcesPath;
  exports.MESSAGES = MESSAGES;
  exports.isDev = isDev;