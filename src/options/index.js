window.addEventListener("load", async () => {
    document.querySelectorAll("[data-i18n]").forEach(el => {
        const id = el.getAttribute('data-i18n')
        el.innerHTML = chrome.i18n.getMessage(id)
    })

    chrome.storage.sync.get(['MINA_ACCOUNT_INFORMER'], (result) => {
        console.log(result)
        const address = document.querySelector("#account-address")
        const historyLength = document.querySelector("#history-length")
        const {a = '', h = 10} = result['MINA_ACCOUNT_INFORMER']
        address.value = a
        historyLength.value = h
    })

    const saveBtn = document.querySelector("#js-save")
    saveBtn.addEventListener("click", () => {
        const address = document.querySelector("#account-address").value.trim()
        const historyLength = document.querySelector("#history-length").value.trim()
        if (!address.startsWith('B62q')) {
            alert(chrome.i18n.getMessage('alert_not_valid_address'))
            return
        }
        chrome.storage.sync.set({MINA_ACCOUNT_INFORMER: {a: address, h: historyLength}})
        close()
    })

    const cancelBtn = document.querySelector("#js-cancel")
    cancelBtn.addEventListener("click", () => {
        close()
    })
})