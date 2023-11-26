const block = name => document.querySelector(name)

globalThis.wsController = (ws, res) => {
    const {channel, data} = res
    switch (channel) {
        case 'welcome': {
            block("#address").innerHTML = `<a target="_blank" class="mi-dark no-decor" href="https://minataur.net/address/${globalThis.accountAddress}">${shorten(globalThis.accountAddress, 12)}</a>`
            request('height')
            request('price')
            request('address', globalThis.accountAddress)
            request('address_balance', globalThis.accountAddress)
            request('address_last_trans', {pk: globalThis.accountAddress, count: globalThis.historyLength, offset: 0})
            break
        }
        case 'price': {
            globalThis.price = data
            setTimeout(request, 60000, 'price')
            break
        }
        case 'new_block': {
            request('height')
            request('address_balance', globalThis.accountAddress)
            break
        }
        case 'height': {
            block("#height").innerHTML = `BLOCK: ${data}`
            break
        }
        case 'address': {
            const delegateLabel = document.querySelector("#delegate-label")
            document.querySelector("#delegate").innerHTML = data.delegate_key
            if (data.public_key !== data.delegate_key) {
                delegateLabel.style.display = 'block'
            } else {
                delegateLabel.style.display = 'none'
            }
            break
        }
        case 'address_balance': {
            const [mina, nano] = (data.total / 10**9).toFixed(4).split(".")
            const movable = (data.liquid / 10**9)
            const priceUSD = (data.total/10**9) * (globalThis.price.current_price || 0)
            block("#balance").innerHTML = `${formatNumber(+mina, "0", "3", ",")}<span class="nanomina">.${nano}</span>`
            block("#movable").innerHTML = `<span class="nanomina">MOVABLE:</span> <span class="mi-success">${formatNumber(+movable, "4", "3", ",")}</span>`
            block("#price-usd").innerHTML = `$${formatNumber(priceUSD, 4, 3, ",", ".")}`
            break
        }
        case 'address_last_trans': {
            console.log(data)
            if (Array.isArray(data)) {
                const target = document.querySelector("#last_tx")
                target.innerHTML = ''
                for (let row of data) {
                    const {amount, fee, trans_owner, trans_receiver, type, trans_owner_balance, confirmation, timestamp, status} = row
                    const incoming = trans_owner !== globalThis.accountAddress
                    const tr = document.createElement("tr")
                    target.append(tr)
                    tr.innerHTML = `
                        <td style="width: 10px;"><span class="${incoming ? 'mi-success' : 'mi-info'}">${incoming ? '↓' : '↑'}</span></td>
                        <td style="width: 10px;"><span class="${status === 'applied' ? 'mi-applied' : 'mi-failed'}">${type === 'payment' ? 'P' : 'D'}</span></td>
                        <td>
                            <a target="_blank" class="mi__link" href="https://minataur.net/address/${incoming ? trans_owner : trans_receiver}">${shorten(incoming ? trans_owner : trans_receiver, 7)}</a>
                            <div class="text-small">${datetime(+timestamp).format("DD, MMM HH:mm")}</div>
                        </td>
                        <td style="text-align: right">
                            ${formatNumber(+(type === 'payment' ? amount : trans_owner_balance)/10**9, "4", "3", ",", ".")}
                            <div class="text-small">fee: ${formatNumber(+fee/10**9, "4", "3", ",", ".")}</div>
                        </td>
                    `
                }
            }
            setTimeout(()=>{
                request('address_last_trans', {pk: globalThis.accountAddress, count: globalThis.historyLength, offset: 0})
            }, 60000)
            break
        }
    }
}

window.addEventListener("load", ()=>{
    document.querySelectorAll("[data-i18n]").forEach(el => {
        const id = el.getAttribute('data-i18n')
        el.innerHTML = chrome.i18n.getMessage(id)
    })

    chrome.storage.sync.get(['MINA_ACCOUNT_INFORMER'], (result) => {
        const {a = '', h = 10} = result['MINA_ACCOUNT_INFORMER']
        globalThis.accountAddress = a
        globalThis.historyLength = +h
        connect()
    })
})