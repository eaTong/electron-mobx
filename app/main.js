/**
 * Created by eatong on 17-3-13.
 */
const electron = require('electron');
const {app, BrowserWindow} = require('electron');
const path = require('path');
const url = require('url');

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

function createWindow() {
  const {width, height} = electron.screen.getPrimaryDisplay().workAreaSize;
  const win = new BrowserWindow({width, height});

  const nodeEnv = process.env.NODE_ENV;
  if (nodeEnv === 'development') {
    win.loadURL(url.format({
      pathname: "localhost:3000",
      protocol: 'http:',
      slashes: true
    }));
    win.webContents.openDevTools();
  } else {
    win.loadURL(url.format({
      pathname: path.join(path.resolve(__dirname, '../dist'), 'index.html'),
      protocol: 'file:',
      slashes: true
    }));
    win.webContents.openDevTools();
  }
}
