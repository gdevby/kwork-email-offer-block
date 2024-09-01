const errorAddition = 'в списке запрещённых слов'
const idAlarmDiv = 'kwork-email-offer-block'
const LIST_EXTENSION_FILE_TO_DOC_TO_TEXT = [  'docx' ]
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
    testWorld(textInClipboard)

}
function testWorld(text){
    chrome.storage.local.get(["forbidden-words"]).then(r =>{

        if(r["forbidden-words"]){
            let listForbiddenWorld =  r["forbidden-words"].split(',')
            let listForAlarm = []
            text = text.toLowerCase()
            for (const forbiddenWorldElement of listForbiddenWorld) {
                if( text.includes(forbiddenWorldElement)){
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
}
function removeAlarmDiv() {
    let alarmDiv = document.getElementById(idAlarmDiv)
    if(alarmDiv){
        alarmDiv.remove()
    }
}

/**
 *
 * @param {File} file
 * @return Promise<string>
 */
async function parseDefault(file) {
    // Always return a Promise
    return await new Promise((resolve, reject) => {
        let content = '';
        const reader = new FileReader();
        // Wait till complete
        reader.onloadend = function(e ) {
            content = e.target.result;
            resolve(content);
        };
        // Make sure to handle error states
        reader.onerror = function(e ) {
            reject(e);
        };
        reader.readAsText(file);
    });
}

/**
 * get text context from file of extension
 * 'doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx', 'pdf', 'hwp'
 * @see https://github.com/bshopcho/docsToText
 * @param {File} file
 * @return {Promise<string>}
 */
async function parseDoc(file){

    const {name} = file;
    const ext = name.toLowerCase().substring(name.lastIndexOf('.') + 1);

    const docToText = new DocToText();

// single file extract to text
   return await  docToText.extractToText(file, ext)
        .then(function (text) {
          return text
        }).catch(function (error) {
        throw error
    });
}

/**
 *
 * @param {File} file
 * @return {Promise<string>}
 */
async function parse(file){
    let extensionFile = file.name.split('.').at(-1)
    if(LIST_EXTENSION_FILE_TO_DOC_TO_TEXT.includes(extensionFile)){
        return await parseDoc(file)
    }
    return await parseDefault(file)
}

let listInputWithTest = []
let interval ;
let initInterval = ()=>{
    interval = setInterval(()=>{
        document.body.querySelectorAll('input[type="file"]').forEach(input=>{
            if (!listInputWithTest.includes(input)){
                listInputWithTest.push(input)
            }
            input.addEventListener('change',(ev)=>{

                if(input.files.length){
                    for (let i = 0; i < input.files.length; i++) {
                        parse(input.files[i]).then(text=>{
                            if(text){
                                testWorld(text)
                            }
                        })
                    }


                }

            })

        })
    },1500)
}
let clearInterval = ()=>{
    clearInterval(interval)
}


chrome.storage.local.get(['status-work'])
    .then( (result) => {
        if(result?.['status-work']){
            document.addEventListener('paste',alarmWord)
            initInterval()
        }
    })

//listens to settings change events
chrome.storage.onChanged.addListener(async (changes, namespace) => {
    for (let [key, { oldValue, newValue }] of Object.entries(changes)) {
        if(key ===  'status-work' ){

            if(newValue){
                document.addEventListener('paste',alarmWord)
                initInterval()
            }else {
                document.removeEventListener('paste',alarmWord)
                clearInterval()
            }
        }
    }

});


