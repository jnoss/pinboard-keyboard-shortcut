closeEventBound = false;

chrome.commands.onCommand.addListener(function(command) {

    if (command === 'bookmark-on-pinboard' || command === 'bookmark-readlater-on-pinboard') {

        chrome.tabs.query({active:true, currentWindow: true}, function (tabs) {

            if (tabs[0].url.substring(0,9) == 'chrome://') {
                return;
            }

            // get the base url to use for the command we were passed
            if (command === 'bookmark-on-pinboard') {
              urlbase = 'https://pinboard.in/add?url=';
            }
            else if (command === 'bookmark-readlater-on-pinboard') {
              urlbase = 'https://pinboard.in/add?later=yes&noui=yes&jump=close&url=';
            }

            // use message passing to get the selected text (if any) to use as the description
            // see https://developer.chrome.com/extensions/messaging.html
            chrome.tabs.sendMessage(tabs[0].id, {action: "getDescription"}, function(response) {

                if (response && response.description) {
                    description = response.description;                    
                } else {
                    description = '';
                }

                // make creating the tab part of the sendMessage callback
                // so that the tab isn't created before the response with the description
                // is received
                chrome.tabs.create({
                                url: urlbase + encodeURIComponent(tabs[0].url) + '&title=' + encodeURIComponent(tabs[0].title) +
                                '&description=' + encodeURIComponent(description),
                                index: tabs[0].index,
                            });

            });

        });

        if (!closeEventBound) {

            chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab) {
                if (tab.status == 'complete' && tab.url == 'https://pinboard.in/add') {
                    chrome.tabs.remove(tab.id);
                }
            });

            closeEventBound = true;

        }


    }

});
