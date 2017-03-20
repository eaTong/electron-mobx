/**
 * Created by eatong on 17-3-13.
 */
const electron = require('electron');
const {app, BrowserWindow} = require('electron');
const path = require('path');
const url = require('url');
const nodeEnv = process.env.NODE_ENV;

app.on('ready', () => {

  if (nodeEnv === 'development') {
    const webpack = require("webpack");
    const WebpackDevServer = require('webpack-dev-server');
    const webpackConfig = require('../webpack.config');


    const compiler = webpack(webpackConfig);
    const server = new WebpackDevServer(compiler, {
      stats: {
        colors: true
      }
    });

    server.listen(3000, "127.0.0.1", function () {
      console.log("Starting server on http://localhost:3000");
      createWindow();
    });

  } else {
    createWindow();
  }
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
  const win = new BrowserWindow({width, height});

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
