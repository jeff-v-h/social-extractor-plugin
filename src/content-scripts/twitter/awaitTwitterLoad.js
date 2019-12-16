{
  // Repeatedly call until timeline container is added to DOM to add buttons, then cancel timer.
  let timer;
  const buttonsAdded = addTweetButtons();
  if (!buttonsAdded) timer = setInterval(addTweetButtons, 2000);

  function addTweetButtons() {
    const primarySelector = 'div[data-testid="primaryColumn"]';
    const primaryColumn = document.querySelector(primarySelector);

    if (primaryColumn) {
      const selector = 'section[aria-labelledby][role="region"]';
      const timeline = primaryColumn.querySelector(selector);

      if (timeline) {
        clearInterval(timer);
        chrome.runtime.sendMessage({ message: 'addTweetButtons' });
        return true;
      }
    }

    return false;
  }
}
