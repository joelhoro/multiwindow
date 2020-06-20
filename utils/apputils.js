const { BrowserWindow } = require('electron');

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
  

  exports.showCoordinates = showCoordinates