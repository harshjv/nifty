const spawn = require('child_process').spawn

const runner = (obj, cb) => {
  let timer
  let stdout = ''
  let error = ''
  let exited = false

  const { script, timeout } = Object.assign({ timeout: 10000 }, obj)
  const child = spawn(script, { stdio: ['pipe', 'pipe', 'pipe', 'ipc'] })
  const output = (data) => {
    if (data) {
      stdout += data
    }
  }

  child.stdout.on('data', output)

  child.on('exit', () => {
    exited = true
    clearTimeout(timer)

    setImmediate(() => {
      if (error) {
        cb(null, error)
      } else if (!stdout) {
        cb('Error: Something went wrong')
      } else {
        try {
          const json = JSON.parse(stdout)
          cb(null, json)
        } catch (e) {
          cb(null, stdout)
        }
      }
    })
  })

  timer = setTimeout(() => {
    error = 'Error: Timeout'
    child.stdout.removeListener('output', output)

    if (!exited) child.kill('SIGKILL')
  }, timeout)
}

module.exports = runner
