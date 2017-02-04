const { app, dialog, shell, Menu } = require('electron')
const settings = require('electron-settings')
const maxHistory = 10
const intervalArray = [ 0, 5000, 10000, 15000, 20000, 25000, 30000, 60000 ]
const defaultInterval = 0

const unique = (array) => {
  const u = {}
  const a = []

  for (let i = 0, l = array.length; i < l; ++i) {
    if (u.hasOwnProperty(array[i])) {
      continue
    }

    a.push(array[i])
    u[array[i]] = 1
  }

  return a
}

const restart = () => {
  process.nextTick(() => {
    app.relaunch()
    app.exit(0)
  })
}

const selectScript = (file, index = 0) => {
  const history = settings.getSync('history') || []
  const previousScript = settings.getSync('script')

  if (previousScript) history.unshift(previousScript)
  if (history.length > maxHistory) history.splice(index, 1)

  settings.setSync('history', unique(history))
  settings.setSync('script', file)

  restart()
}

const buildMenu = () => {
  const script = settings.getSync('script')
  const history = settings.getSync('history') || []
  const checkedInterval = settings.getSync('interval') || defaultInterval

  const menu = [
    {
      label: script ? 'Select a new script' : 'Select a script',
      click () {
        const files = dialog.showOpenDialog({ properties: [ 'openFile' ] })

        if (files) {
          const file = files[0]

          selectScript(file)
        }
      }
    },
    { type: 'separator' }
  ]

  if (script) {
    menu.push({
      label: 'Current script',
      submenu: [
        {
          label: script,
          enabled: false
        },
        { type: 'separator' },
        {
          label: 'Open in system\'s default viewer',
          click () {
            shell.openItem(script)
          }
        },
        {
          label: 'Clear',
          click () {
            settings.deleteSync('script')
            restart()
          }
        },
        {
          label: 'Restart',
          click () {
            restart()
          }
        }
      ]
    })
  }

  if (history.length > 0) {
    let index = 0
    const historyMenu = []

    for (let file of history) {
      historyMenu.push({
        label: file,
        click () {
          selectScript(file, index++)
        }
      })
    }

    menu.push({
      label: 'History',
      submenu: historyMenu
    })
  }

  const intervals = []

  for (let interval of intervalArray) {
    intervals.push({
      label: interval === 0 ? 'Disable' : `${interval / 1000}s`,
      checked: checkedInterval === interval,
      type: 'radio',
      click () {
        settings.setSync('interval', interval)
        restart()
      }
    })
  }

  menu.push({
    label: 'Refresh interval',
    submenu: intervals
  })

  menu.push({ type: 'separator' })
  menu.push({ role: 'quit' })

  return Menu.buildFromTemplate(menu)
}

module.exports = {
  buildMenu
}
