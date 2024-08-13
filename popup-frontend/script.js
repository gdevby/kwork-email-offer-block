let switchWork = document.body.querySelector('input[name="switch-work"]')
let statusWorkSpan = document.getElementById('work-status')
let btnSave = document.getElementById('save-button')
let textAriaOutput = document.getElementById('textarea-forbidden-words')

/**
 *
 * @param {boolean} status
 */
function setStatusWorkSpan(status){
    statusWorkSpan.textContent = status ? 'да' : 'нет'
}

//получение сохранённых данных (status work)
chrome.storage.local.get(['status-work','forbidden-words'])
    .then( (result) => {
        if(result?.['status-work']){
            switchWork.checked = result['status-work']
            setStatusWorkSpan( result['status-work'])
        }else {
            setStatusWorkSpan( false)
        }
        if(result?.['forbidden-words']){
            textAriaOutput.value = result?.['forbidden-words']
        }
    })
btnSave.addEventListener('click',()=>{
    if(!btnSave.classList.contains('active')){
        btnSave.classList.add('active')
    }
    chrome.runtime.sendMessage({'save-forbidden-world': textAriaOutput.value})
        .then(r =>{
            setTimeout(()=>btnSave.classList.remove('active'),1500)
            textAriaOutput.classList.add('green-border')
    })

})

switchWork.addEventListener('click',(e)=>{
    setStatusWorkSpan( e.target.checked)
    if(e.target.checked){
        chrome.runtime.sendMessage({'set-status-work':e.target.checked}).then(async response=>{
            if(response?.status === 200){
                switchWork.parentElement.setAttribute('style','outline:1px solid green')
            }
        })
    }else{
        chrome.runtime.sendMessage({'set-status-work':e.target.checked}).then(async response=>{
            if(response?.status === 200){
                switchWork.parentElement.removeAttribute('style' )
            }
        })
    }
})
