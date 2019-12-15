{
  // Repeatedly call until timeline container is added to DOM to add buttons, then cancel timer.
  let timer;
  const buttonsAdded = addInstagramButtons();
  if (!buttonsAdded) timer = setInterval(addInstagramButtons, 2000);

  function addInstagramButtons() {
    const main = document.querySelector('main[role="main"]');

    if (main) {
      const article = main.querySelector(`article`);

      if (article) {
        clearInterval(timer);
        chrome.runtime.sendMessage({ message: 'addInstagramButtons' });
        return true;
      }
    }

    return false;
  }
}
