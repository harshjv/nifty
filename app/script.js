const { ipcRenderer } = require('electron')
const settings = require('electron-settings')

const runner = require('./runner')

const script = settings.getSync('script')

const put = (text) => {
  if (typeof text === 'string') ipcRenderer.send('text', text)
  else throw new Error('put function must be called with string')
}

const tooltip = (tt) => {
  if (typeof tt === 'string') ipcRenderer.send('tooltip', tt)
  else throw new Error('tooltip function must be called with string')
}

if (script) {
  try {
    let s
    if (script.endsWith('.js') && typeof (s = require(script)) === 'function') {
      s(put, tooltip)
    } else {
      runner({ script }, (e, data) => {
        if (e) {
          ipcRenderer.send('err', e.toString())
        } else {
          put(data)
        }
      })
    }
  } catch (e) {
    ipcRenderer.send('err', e.toString())
  }
}
