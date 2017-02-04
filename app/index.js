const path = require('path')
const { app, dialog, Tray, ipcMain, BrowserWindow } = require('electron')
const settings = require('electron-settings')

const { buildMenu } = require('./util')

const url = 'file://' + path.join(__dirname, 'index.html')
const interval = settings.getSync('interval')

let tray = null
let win = null

app.on('ready', () => {
  app.dock.hide()

  tray = new Tray(path.join(__dirname, 'icon.png'))

  ipcMain.on('text', (e, text) => tray.setTitle(text))
  ipcMain.on('tooltip', (e, tooltip) => tray.setToolTip(tooltip))
  ipcMain.on('err', (e, error) => {
    dialog.showErrorBox('Error in script', error)
    settings.deleteSync('script')
    app.exit(0)
  })

  win = new BrowserWindow({
    show: false,
    showDockIcon: false
  })

  win.on('closed', () => {
    win = null
  })

  win.loadURL(url)

  if (interval > 0) {
    setInterval(() => {
      win.loadURL(url)
    }, interval)
  }

  tray.setContextMenu(buildMenu(interval))
})
