const errorAddition = 'в списке запрещённых слов'
const idAlarmDiv = 'kwork-email-offer-block'
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
            textInClipboard = textInClipboard.toLowerCase()
            for (const forbiddenWorldElement of listForbiddenWorld) {
                if( textInClipboard.includes(forbiddenWorldElement)){
                    listForAlarm.push(forbiddenWorldElement)
                }
            }
            if(listForAlarm.length >0){
                removeAlarmDiv()
                showAlert(listForAlarm.join(',') + " " +errorAddition)
            }
        }
    })
}
function showAlert(text){
    let div = document.createElement('div')
    div.className = 'alarm'
    div.id = idAlarmDiv
    div.innerHTML = ` 
    <h2> Предупреждение!</h2> 
    <p class="alarm__text">${text} </p>
    <div class="alarm__btn-container">
    <button aria-label="ок" class="alarm__btn">ок</button>
</div>
`
    div.querySelector('button').addEventListener('click',removeAlarmDiv )
    document.body.prepend(div)
    console.log(div)
}
function removeAlarmDiv() {
    let alarmDiv = document.getElementById(idAlarmDiv)
    if(alarmDiv){
        alarmDiv.remove()
    }
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


