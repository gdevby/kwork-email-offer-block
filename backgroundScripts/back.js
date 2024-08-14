
chrome.runtime.onMessage.addListener(
     function(request, sender, sendResponse) {
         if(request?.['set-status-work'] !== undefined){
             chrome.storage.local.set({ 'status-work': request?.['set-status-work'] }).then(() => {
                 sendResponse({status:200})
             });
         }
         if (request?.['save-forbidden-world'] !== undefined){
             let worlds = request?.['save-forbidden-world'].split(',')
             worlds = worlds.map(el=>{return el.trim().toLowerCase()})
             worlds = worlds.filter(el=>el !== '')
             let onlyOne = [...new Set(worlds)]
             chrome.storage.local.set({ 'forbidden-words': onlyOne.join(',') }).then(() => {
                 sendResponse({status:200})
             });
         }

         return true
    }
);
