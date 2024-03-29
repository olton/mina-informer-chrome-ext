chrome.runtime.onInstalled.addListener(async () => {
    for (const id of ['github', 'options']) {
        await chrome.contextMenus.create({
            title: chrome.i18n.getMessage(id),
            id,
            contexts: ["action"]
        })
    }
})

chrome.contextMenus.onClicked.addListener(async (req, ...rest)=>{
    switch (req.menuItemId) {
        case 'github': {
            await chrome.tabs.create({url: 'https://github.com/olton/mina-informer-chrome-ext'})
            break
        }
        case 'options': {
            await chrome.tabs.create({url: chrome.runtime.getURL("options/index.html")})
            break
        }
    }
})