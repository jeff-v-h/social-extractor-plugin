chrome.runtime.onInstalled.addListener(function() {
  let urlListened = false;

  chrome.declarativeContent.onPageChanged.removeRules(undefined, function() {
    chrome.declarativeContent.onPageChanged.addRules([
      {
        conditions: [
          new chrome.declarativeContent.PageStateMatcher({
            pageUrl: { hostSuffix: "twitter.com" }
          }),
          new chrome.declarativeContent.PageStateMatcher({
            pageUrl: { hostSuffix: "instagram.com" }
          })
        ],
        actions: [new chrome.declarativeContent.ShowPageAction()]
      }
    ]);
  });

  // Await messages from contentscripts
  chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    switch (request.message) {
      case "setupTwitter":
        setupTwitter();
        break;
      case "addTweetButtons":
        addTweetButtons();
        break;
      case "addInstagramButtons":
        addInstagramButtons();
        break;
      case "confirmPost":
        confirmPost(request.data);
        break;
      case "saveMediaPost":
        saveMediaPost(request.data);
        break;
      default:
        break;
    }
  });

  function setupTwitter() {
    if (!urlListened) {
      urlListened = true;
      listenForUrlChange();
    }
    chrome.tabs.executeScript(null, {
      file: "content-scripts/twitter/awaitTwitterLoad.js"
    });
  }

  function addTweetButtons() {
    chrome.tabs.executeScript(null, {
      file: "content-scripts/twitter/tweets.js"
    });
  }

  function addInstagramButtons() {
    chrome.tabs.executeScript(null, {
      file: "content-scripts/instagram/instagramPosts.js"
    });
  }

  function listenForUrlChange() {
    chrome.tabs.onUpdated.addListener(urlUpdatedListener);
  }

  // Also execute script when page changes (eg when link clicked within site)
  function urlUpdatedListener(tabId, changeInfo, tab) {
    if (changeInfo.url) {
      if (changeInfo.url.includes("twitter.com")) {
        chrome.tabs.executeScript(null, {
          file: "content-scripts/twitter/awaitTwitterLoad.js"
        });
      } else if (changeInfo.url.includes("instagram.com")) {
        chrome.tabs.executeScript(null, {
          file: "content-scripts/instagram/awaitInstagramLoad.js"
        });
      }
    }
  }

  function confirmPost(data) {
    chrome.storage.sync.set({ lastPost: data }, function() {
      chrome.windows.create(
        {
          url: "browser/confirm-post/confirmPost.html",
          type: "popup",
          width: 900,
          height: 850
        },
        function(window) {}
      );
    });
  }
});
