'use strict';

var {app, BrowserWindow, Menu} = require('electron');
var path = require('path');
var mainWindow = null;
const template =  process.platform === 'darwin' ?  [
    {
      label: 'Menu',
      submenu: [
        {
          label: 'exit',
          accelerator: 'Cmd+W',
          click: () => { app.quit() }
        },
        { type: 'separator' },
        {
          label: 'reload',
          accelerator: 'Cmd+R',
          click: () => { mainWindow.webContents.reload() }
        },
      ],
    },
  ]:[
    {
      label: 'Menu',
      submenu: [
        {
          label: 'exit',
          accelerator: 'Ctrl+W',
          click: () => { app.quit() }
        },
        { type: 'separator' },
        {
          label: 'reload',
          accelerator: 'Ctrl+R',
          click: () => { mainWindow.webContents.reload() }
        },
      ],
    },
  ]
  
  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);
  
  

app.on('window-all-closed', function () {
    if (process.platform !== 'darwin') app.quit();
});

app.on('ready', function () {
    mainWindow = new BrowserWindow({ 
        width: 800, 
        height: 600,
        kiosk: true,
        icon: path.join(__dirname, 'img/Ta_ke.png')
    });
    mainWindow.loadURL('file://' + __dirname + '/index.html');
    mainWindow.on('closed', function () { mainWindow = null; });
});

