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
  
  function notify(tray, type, content) {
    let img = nativeImage.createFromPath('build/iconinv.png');

    tray.displayBalloon({
      icon: img,
      iconType: type,
      title: 'VolGUI notification',
      content
    });
  }

  exports.notify = notify;
  exports.showCoordinates = showCoordinates