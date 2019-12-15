chrome.runtime.onInstalled.addListener(function() {
  let urlListened = false;

  chrome.declarativeContent.onPageChanged.removeRules(undefined, function() {
    chrome.declarativeContent.onPageChanged.addRules([
      {
        conditions: [
          new chrome.declarativeContent.PageStateMatcher({
            pageUrl: { hostSuffix: 'twitter.com' }
          }),
          new chrome.declarativeContent.PageStateMatcher({
            pageUrl: { hostSuffix: 'instagram.com' }
          })
        ],
        actions: [new chrome.declarativeContent.ShowPageAction()]
      }
    ]);
  });

  // Await messages from contentscripts
  chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    switch (request.message) {
      case 'addTweetButtons':
        addTweetButtons();
        break;
      case 'addInstagramButtons':
        addInstagramButtons();
        break;
    }
  });

  function addTweetButtons() {
    chrome.tabs.executeScript(null, {
      file: 'content-scripts/twitter/tweets.js'
    });
  }

  function addInstagramButtons() {
    chrome.tabs.executeScript(null, {
      file: 'content-scripts/instagram/instagramPosts.js'
    });
});
