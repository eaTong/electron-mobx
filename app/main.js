/**
 * Created by eatong on 17-3-13.
 */
const {app, BrowserWindow} = require('electron');
const path = require('path');
const url = require('url');

let win;
const nodeEnv = process.env.NODE_ENV;
function createWindow() {
  win = new BrowserWindow({width: 800, height: 600});

  if (nodeEnv === 'development') {
    win.loadURL(url.format({
      pathname: "localhost:3000",
      protocol: 'http:',
      slashes: true
    }));
    win.webContents.openDevTools();
  } else {
    win.loadURL(url.format({
      pathname: path.join(__dirname, 'index.html'),
      protocol: 'file:',
      slashes: true
    }));
  }

  win.on('closed', () => {
    win = null
  })
}
app.on('ready', createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
});

app.on('activate', () => {
  if (win === null) {
    createWindow()
  }
});
