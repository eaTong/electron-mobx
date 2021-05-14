/**
 * Created by eatong on 17-3-14.
 */
const electron = require('electron');
const {app, BrowserWindow, globalShortcut} = require('electron');
const path = require('path');
const url = require('url');
require("@babel/polyfill");
const nodeEnv = process.env.NODE_ENV;

let win;

app.on('ready', () => {

  if (nodeEnv === 'development') {
    const sourceMapSupport = require('source-map-support');
    sourceMapSupport.install();
  }
  createWindow();
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
});

app.on('activate', () => {
  console.log(nodeEnv);
  if (win === null) {
    createWindow();
  }
});

function createWindow() {
  const {width, height} = electron.screen.getPrimaryDisplay().workAreaSize;
  win = new BrowserWindow({
    width, height, webPreferences: {
      nodeIntegration: true
    }
  });

  if (nodeEnv === 'development') {
    //delay 1000ms to wait for webpack-dev-server start
    setTimeout(function () {
      win.loadURL(url.format({
        pathname: "localhost:3000",
        protocol: 'http:',
        slashes: true
      }));
      win.webContents.openDevTools();
    }, 1000);
  } else {
    win.loadURL(url.format({
      pathname: path.join(path.resolve(__dirname, './dist'), 'index.html'),
      protocol: 'file:',
      slashes: true
    }));
  }
  globalShortcut.register('CommandOrControl+Shift+D', () => {
    win.webContents.openDevTools();
  })
}
