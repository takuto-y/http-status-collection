const KEY = 'status-collection'

const init = () => {
  const elem = document.getElementById('table-body')

  while (elem.firstChild) elem.removeChild(elem.firstChild)

  for (const statusCode in HTTPStatusCodes) {
    const tr = document.createElement('tr')
    const th = document.createElement('th')
    const td1 = document.createElement('td')
    const td2 = document.createElement('td')
    
    tr.id = `table-${statusCode}-row`

    th.innerText = String(statusCode)
    th.scope = 'row'

    td1.innerText = '???'
    td1.id = `table-${statusCode}-message`

    td2.innerText = "x"
    td2.id = `table-${statusCode}-value`
    
    tr.appendChild(th)
    tr.appendChild(td1)
    tr.appendChild(td2)
  
    elem.appendChild(tr)
  }

  // ボタンにクリックイベントを追加
  const oldButtonElem = document.getElementById('reset-button')
  const newButtonElem = oldButtonElem.cloneNode(true);
  oldButtonElem.parentNode.replaceChild(newButtonElem, oldButtonElem);
  
  newButtonElem.addEventListener('click', () => reset())
}

init()

let prevStatus = null

const sync = () => {
  chrome.storage.local.get(
    KEY,
    (value) => {
      const status = value[KEY] ?? {}

      // 表を更新
      for (const key in status) {
        if (!status[key] || !HTTPStatusCodes[key]) continue

        const rowElem = document.getElementById(`table-${key}-row`)
        rowElem.classList.add('table-success')

        const messageElem = document.getElementById(`table-${key}-message`)
        messageElem.innerText = HTTPStatusCodes[key].message

        const valueElem = document.getElementById(`table-${key}-value`)
        const unlockedOn = new Date(status[key])
        valueElem.innerText = unlockedOn.toLocaleString()
      }

      // 所持率を更新
      const countAll = Object.entries(HTTPStatusCodes).length
      const countHas = Object.entries(HTTPStatusCodes).filter(([key]) => status[key]).length

      const percentage = Math.floor(countHas / countAll * 100)

      const progressElem = document.getElementById('progress')
      progressElem.innerText = `${percentage}%`
      progressElem.style = `width: ${percentage}%;`

      const progressTextElem = document.getElementById('progress-text')
      progressTextElem.innerText = `${countHas} / ${countAll}`
    
      // 新たに発見されたステータスを表示
      if (prevStatus !== null) {
        for (const key in status) {
          if (prevStatus[key] || !HTTPStatusCodes[key]) continue

          const alertElem = document.createElement('div')
          alertElem.className = 'alert alert-info alert-dismissible fade show'
          alertElem.setAttribute('role', 'alert')
         
          const messageElem = document.createElement('span')
          messageElem.innerText = `${key}(${HTTPStatusCodes[key].message})が発見されました`

          const closeButtonElem = document.createElement('button')
          closeButtonElem.type = 'button'
          closeButtonElem.className = 'btn-close'
          closeButtonElem.setAttribute('data-bs-dismiss', 'alert')

          new bootstrap.Alert(closeButtonElem)

          alertElem.appendChild(messageElem)
          alertElem.appendChild(closeButtonElem)

          const alertsElem = document.getElementById('alerts')
          alertsElem.insertBefore(alertElem, alertsElem.firstChild)
        }
      }

      prevStatus = JSON.parse(JSON.stringify(status))
    }
  )
}

const reset = () => {
  const result = confirm('取得状況をリセットします')

  if (!result) return
 
  chrome.storage.local.set({
    [KEY]: {}
  }, () => {
    init()
    sync()
  })
}

sync()
setInterval(() => sync(), 1000)