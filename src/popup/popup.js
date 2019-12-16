let addButton = document.getElementById('add-buttons');
let sendBrowserStorageButton = document.getElementById('send-browser-storage');

addButton.onclick = function() {
  chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
    const url = tabs[0].url;
    let file;

    if (url.includes('twitter.com')) {
      file = 'content-scripts/twitter/twitter.js';
    } else if (url.includes('instagram.com')) {
      file = 'content-scripts/instagram/instagram.js';
    }

    chrome.tabs.executeScript({ file });
  });
};

sendBrowserStorageButton.onclick = function() {
  chrome.windows.create(
    {
      url: 'browser/send-stored-posts/sendStoredPosts.html',
      type: 'popup',
      width: 900,
      height: 850
    },
    function(window) {}
  );
};
