const log = (value) => {
  const message = typeof value === 'string' ? value : JSON.stringify(value);
  chrome.devtools.inspectedWindow.eval(`console.log('${message}')`);
}

const KEY = 'status-collection'

chrome.devtools.panels.create(
  "HTTP Status Collection",
  "", // icon画像を指定できる
  "./panel.html",
  (panel) => {} // callback
);

chrome.devtools.network.onRequestFinished.addListener((request) => {
  const status = request.response.status;
  
  chrome.storage.local.get(
    KEY,
    (value) => {
      if (value[KEY] && value[KEY][String(status)]) return

      chrome.storage.local.set({
        [KEY]: {
          ...(value[KEY] || {}),
          [String(status)]: (new Date()).getTime()
        }
      }, () => log(`[HTTP Status Collection] Found a new status ${status}.`))
    }
  )
})