const { BrowserWindow, nativeImage } = require('electron');

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
  
  var messages = {
    UPDATE: 'UPDATE',
    UPDATE_RESPONSE: 'UPDATE-RESPONSE',
    NEW_WINDOW: 'NEW-WINDOW',
    SET_VALUES: 'SET_VALUES'
  }

  exports.showCoordinates = showCoordinates
  exports.messages = messages;