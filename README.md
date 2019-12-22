# Social Extractor Plugin

A Google Chrome extension that will add buttons to posts in social media websites (currently Twitter and Instagram).
Clicking the button will extract the data from the post to send to a web page to reorganise with posts from other social media sites.

## Requirements

- Google Chrome Browser
- jQuery (source files saved within project)
- [Social Extractor API](https://github.com/jeffvhuang/social-extractor-api) to be able to save data via Http requests. Otherwise it is possible to save data in Chrome's local storage.

## Development Environment

1. Clone the repository.
2. Open up [Google Chrome extensions](chrome://extensions/) by entering [chrome://extensions/](chrome://extensions/) into the url bar or click through Settings (3 dots in vertical line) > More tools > Extensions.
3. Turn on developer mode in top right.
4. Click 'Load unpacked' and select the directory where the manifest is located (src folder)
5. Open up twitter or instagram and buttons should appear on each post. If they do not appear, the UI may have changed and may need to be configured again.
