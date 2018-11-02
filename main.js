document.addEventListener('DOMContentLoaded', () => {
  console.clear()

  const ui = {}

  ui.chkReset = document.querySelector('.chk-reset-on-run')
  ui.dataPre = document.querySelector('.data')
  ui.dataSzInput = document.querySelector('.data-sz')
  ui.sourcePre = document.querySelector('.source')
  ui.outputPre = document.querySelector('.output')

  ui.dValueTd = document.querySelector('.d-value')
  ui.iValueTd = document.querySelector('.i-value')
  ui.xValueTd = document.querySelector('.x-value')
  ui.yValueTd = document.querySelector('.y-value')

  ui.btnNew = document.querySelector('.btn-new')
  ui.btnRun = document.querySelector('.btn-run')
  ui.btnSave = document.querySelector('.btn-save')
  ui.btnLoad = document.querySelector('.btn-load')
  ui.btnDownload = document.querySelector('.btn-download')
  ui.prgFilename = document.querySelector('.prg-filename')

  ui.btnRemoveLastInstruction = document.querySelector('.btn-back')

  const sys = {
    d: 0,
    i: 0,
    x: 0,
    y: 0,
    data: {
      bytes: new Array(0x100),
      get value () {
        return sys.data.bytes[sys.d]
      },
      set value (v) {
        sys.data.bytes[sys.d] = v & 0xff
      },
      reset () {
        for (let i = 0; i < sys.data.bytes.length; i += 1) {
          sys.data.bytes[i] = 0
          // sys.data.bytes[i] = ~~(Math.random() * 0xff) & 0xff
        }
      }
    }
  }

  const code = []

  const byteHex = value => {
    const valueStr = value.toString(16)
    if (valueStr.length === 1) {
      return `0x0${valueStr}`
    } else if (valueStr.length === 2) {
      return `0x${valueStr}`
    }
  }

  const updateSysDisplay = () => {
    ui.dValueTd.innerText = `${sys.d}\n${byteHex(sys.data.value)} (${sys.data.value})`
    ui.iValueTd.innerText = `${sys.i}\n${code.length ? byteHex(code[sys.i]) : '--'}`
    ui.xValueTd.innerText = `${sys.x}\n${byteHex(sys.x)}`
    ui.yValueTd.innerText = `${sys.y}\n${byteHex(sys.y)}`
  }

  const resetSystem = () => {
    sys.d = 0
    sys.i = 0
    sys.x = 0
    sys.y = 0
    sys.data.reset()
  }

  const updateDataDisplay = () => {
    ui.dataPre.innerText = sys.data.bytes
      .map(b => {
        const bStr = b.toString(16)
        return bStr.length === 1 ? `0${bStr}` : bStr
      })
      .join(' ')
      .match(/.{1,48}/g)
      .map((seg, idx) => {
        const offset = idx * 16
        let offsetStr = offset.toString(16)
        offsetStr = offsetStr.length === 1 ? `000${offsetStr}` : offsetStr
        offsetStr = offsetStr.length === 2 ? `00${offsetStr}` : offsetStr
        offsetStr = offsetStr.length === 3 ? `0${offsetStr}` : offsetStr
        return `${offsetStr}: ${seg}`
      })
      .join('\n')
      // ascii dump
      .split('\n')
      .map(line => {
        const offsetStrAndBytes = line.split(':')
        offsetStrAndBytes[1] = offsetStrAndBytes[1].trim()
        const bytes = offsetStrAndBytes[1]
          .split(' ')
          .map(b => parseInt(b, 16))

        const ascii = bytes
          .map(b => {
            if (b < 32 || b > 126) {
              return '.'
            } else {
              return String.fromCharCode(b)
            }
          })
          .join('')
        return `${line.trim()} | ${ascii}`
      })
      .join('\n')
      //
  }

  ui.dataSzInput.addEventListener('change', () => {
    const bytes = ~~(ui.dataSzInput.value)
    if (bytes !== sys.data.bytes.length) {
      sys.data.bytes = new Array(bytes)
      sys.data.reset()
      updateDataDisplay()
    }
  })

  ui.btnNew.addEventListener('click', () => {
    code.length = 0
    ui.sourcePre.innerText = 'No code'
    ui.outputPre.innerText = 'Ready.'
    resetSystem()
    updateSysDisplay()
    updateDataDisplay()
    ui.prgFilename.value = 'untitled.prg'
  })

  ui.btnSave.addEventListener('click', () => {
    if (ui.prgFilename.value.length) {
      window.localStorage.setItem(
        ui.prgFilename.value,
        JSON.stringify({ code, ramAlloc: sys.data.bytes.length })
      )
    }
  })

  ui.btnLoad.addEventListener('click', () => {
    if (ui.prgFilename.value.length) {
      const saveFile = window.localStorage.getItem(ui.prgFilename.value)
      if (saveFile) {
        code.length = 0
        const loadedCode = JSON.parse(saveFile)
        const bytes = ~~(loadedCode.ramAlloc)
        if (bytes !== sys.data.bytes.length) {
          sys.data.bytes = new Array(bytes)
          sys.data.reset()
          updateDataDisplay()
        }
        loadedCode.code.forEach(instruction => code.push(instruction))
        ui.sourcePre.innerText = code.map(c => c.toString(16)).join(' ')
      }
    }
  })

  ui.btnDownload.addEventListener('click', () => {})

  ui.btnRun.addEventListener('click', () => {
    if (ui.chkReset.checked) {
      resetSystem()
      updateSysDisplay()
      updateDataDisplay()
    } else {
      // just reset the instruction pointer
      sys.i = 0
    }

    const instructions = code.slice()
    const ops = [
      () => {
        // 0x00
        sys.d += 1
        sys.d = sys.d >= sys.data.bytes.length ? sys.data.bytes.length : sys.d
      },
      () => {
        // 0x01
        sys.data.value += 1
      },
      () => {
        // 0x02
        const chr = String.fromCharCode(sys.data.value)
        ui.outputPre.innerText = `${ui.outputPre.innerText}${chr}`
      },
      () => {
        // 0x03
        if (sys.data.value === 0) {
          // seek to next 0x0c
          while (instructions[sys.i] !== 0x0c) {
            if (sys.i >= instructions.length) {
              // error!
              break
            } else {
              sys.i += 1
            }
          }
        }
      },
      () => {
        // 0x04
        sys.y = (sys.data.value * sys.x) & 0xff
      },
      () => {
        // 0x05
        sys.x = sys.data.value
      },
      () => {
        // 0x06
        sys.y = sys.data.value
      },
      () => {
        // 0x07
        sys.y = (sys.data.value + sys.x) & 0xff
      },
      () => {
        // 0x08
        sys.y = ~~((sys.data.value - sys.x) & 0xff)
      },
      () => {
        // 0x09
        sys.data.value = sys.y
      },
      () => {
        // 0x0A
        sys.data.value = sys.x
      },
      () => {
        // 0x0B
        sys.y = (~~(sys.data.value / sys.x)) & 0xff
      },
      () => {
        // 0x0C
        if (sys.data.value !== 0) {
          // seek to previous 0x03
          while (instructions[sys.i] !== 0x03) {
            if (sys.i < 0) {
              // error!
              break
            } else {
              sys.i -= 1
            }
          }
        }
      },
      () => {
        // 0x0D
        console.log('stdin not implemented at this time')
      },
      () => {
        // 0x0E
        sys.data.value -= 1
      },
      () => {
        // 0x0F
        sys.d -= 1
        sys.d = sys.d < 0 ? 0 : sys.d
      }
    ]
    while (sys.i < instructions.length) {
      const op = ops[instructions[sys.i]]
      op && op()
      updateDataDisplay()
      updateSysDisplay()
      sys.i += 1
    }
  })

  ui.fn = {}

  'abcedf1234567890'.split('').forEach(k => {
    ui[`btn${k.toUpperCase()}`] = document.querySelector(`.btn-${k}`)
    ui[`btn${k.toUpperCase()}`] && ui[`btn${k.toUpperCase()}`]
      .addEventListener('click', () => {
      code.push(parseInt(`0x0${k}`, 16))
      ui.sourcePre.innerText = code.map(c => c.toString(16)).join(' ')
    })
  })

  ui.btnRemoveLastInstruction.addEventListener('click', () => {
    if (code.length) {
      code.pop()
      ui.sourcePre.innerText = code.map(c => c.toString(16)).join(' ')
    }
  })

  sys.data.reset()
  updateDataDisplay()
  updateSysDisplay()

  ui.sourcePre.innerText = 'No code'
  ui.outputPre.innerText = 'Ready.'
  ui.prgFilename.value = 'untitled.prg'

})
