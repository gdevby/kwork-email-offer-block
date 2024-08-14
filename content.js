const errorAddition = 'в списке запрещённых слов'

/**
 * we get words from the buffer and check for the presence of words from chrome.storage.
 * If we find them, we display them and report an error.
 * @see errorAddition
 * @param {ClipboardEvent} ev
 */
function alarmWord   (ev) {
    let textInClipboard =  ev.clipboardData.getData('Text')
    if(!textInClipboard){
        return
    }
    chrome.storage.local.get(["forbidden-words"]).then(r =>{

        if(r["forbidden-words"]){
            let listForbiddenWorld =  r["forbidden-words"].split(',')
            let listForAlarm = []
            let listFromTextInClipboard = textInClipboard.toLowerCase()
                .split(' ')
            for (const forbiddenWorldElement of listForbiddenWorld) {
                if( listFromTextInClipboard.find(el=>el.startsWith(forbiddenWorldElement))){
                    listForAlarm.push(forbiddenWorldElement)
                }
            }
            if(listForAlarm.length >0){
                alert(listForAlarm.join(',') + " " +errorAddition)
            }
        }
    })
}


chrome.storage.local.get(['status-work'])
    .then( (result) => {
        if(result?.['status-work']){
             document.addEventListener('paste',alarmWord)
        }
    })

//listens to settings change events
chrome.storage.onChanged.addListener(async (changes, namespace) => {
    for (let [key, { oldValue, newValue }] of Object.entries(changes)) {
        if(key ===  'status-work' ){

            if(newValue){
                document.addEventListener('paste',alarmWord)
            }else {
                document.removeEventListener('paste',alarmWord)
            }
        }
    }

});

