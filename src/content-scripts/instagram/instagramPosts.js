{
  setupInstagramButtons();

  console.log('contnt-script');
  async function setupInstagramButtons() {
    MutationObserver = window.MutationObserver || window.WebKitMutationObserver;
    const article = document.querySelector(`article`);

    if (article) {
      const articleContainer = article.parentElement;

      const observer = new MutationObserver(async function(
        mutations,
        observer
      ) {
        // Fired when a mutation occurs
        await addPostButtons();
      });

      // Observes higher parent: a lot more function calls but helpful if specific selection doesnt work
      // observer.observe(tweetsSection, {
      //   subtree: true,
      //   childList: true,
      //   attributes: false
      // });

      // Define what element should be observed by the observer
      // and what types of mutations trigger the callback
      observer.observe(articleContainer, {
        subtree: false,
        childList: true
      });

      // Add buttons immediately when this js file is called since no change has happened yet
      await addPostButtons();
    }
  }

  async function addPostButtons() {
    const pathname = window.location.pathname.toString();
    // const d3Button = `<button class="d3-btn ig-btn">Save Post</button>`;
    const d3ButtonBottom = `<button class="d3-btn ig-bottom-btn">Save Post</button>`;

    if (pathname === '/') {
      $(`main[role="main"]`)
        .find('article')
        .each(function(index) {
          // Only add button if it does not already exist for the post
          if (!$(this).find('.d3-btn').length) {
            addButtonToArticle($(this), d3ButtonBottom);
          }
        });
    } else if (pathname.substring(0, 3) === '/p/') {
      await sleep(500);
      const $dialog = $('div[role="dialog"]').first();
      const $article = $dialog.length
        ? $dialog.find('article').first()
        : $('article').first();

      if ($article.length) addButtonToArticle($article, d3ButtonBottom);
    }
  }

  function addButtonToArticle($article, button) {
    const container = $article
      .find('span[aria-label="Save"]')
      .first()
      .closest('button')
      .closest('span');

    container.addClass('ig-btn-container');
    container.prepend(button);

    $article.find('.d3-btn').click(savePost);
  }

  async function savePost() {
    const post = {
      mediaPlatform: 'instagram',
      displayName: '',
      mediaHandle: '',
      mainContent: '',
      secondaryContent: '',
      addedBy: '',
      attachments: []
    };

    const $article = $(this).closest('article');

    // Get handle
    const $header = $article.find('header').first();
    getHeaderDetails($header, post);

    // Get main content (image/s or video)
    const $mainContentSection = $header.length
      ? $header.next()
      : $article.children().eq(1);

    await getMainContent($mainContentSection, post);

    const $textSection = $article.children().eq(2);
    await getSecondaryContent($textSection, post);

    console.log('INSTAGRAM POST --> ', post);
    chrome.runtime.sendMessage({ message: 'confirmPost', data: post });
  }

  //#region Get content from DOM
  function getHeaderDetails($header, post) {
    if ($header.length) {
      const $h2 = $header.find('h2').first();

      let $titleEle;
      if ($h2.length) {
        $titleEle = $h2.find('a[title]').first();
      }

      if (!$h2.length || !$titleEle || $titleEle.length < 1) {
        $titleEle = $header.find('a[title]').first();
      }

      if ($titleEle.length) {
        post.mediaHandle = `@${$titleEle.text()}`;
      }
    }
  }

  async function getMainContent($mainContentSection, post) {
    if ($mainContentSection.length) {
      const $video = $mainContentSection.find('video');
      if ($video.length) {
        getVideoContent($video, post);
      } else {
        await getImageContent($mainContentSection, post);
      }
    }
  }

  function getVideoContent($video, post) {
    post.mainContent = $video.attr('src');
    post.attachments.push({
      type: 'poster',
      mainContent: $video.attr('poster')
    });
  }

  async function getImageContent($mainContentSection, post) {
    const $imgs = $mainContentSection.find('img');

    if ($imgs.length) {
      const images = [];
      if ($imgs.length > 1) await ensureAtFirstImage($mainContentSection);

      $imgs.each(function(index) {
        const src = $(this).attr('src');
        images.push(src);

        if (index === 0) {
          post.mainContent = src;
        } else {
          post.attachments.push({
            type: 'image',
            mainContent: src
          });
        }
      });

      // Get the images from the post that have not been loaded yet
      await getOtherImages($mainContentSection, post, images);
    }
  }

  async function getSecondaryContent($textSection, post) {
    if ($textSection.length) {
      const $textList = $textSection.find('ul').first();

      if ($textList.length) {
        const $li = $textList.find('li[role="menuitem"]').first();

        // If there is a more... button, click it to get the entire description
        if ($li.length) {
          const $moreButton = $li.find('button').first();
          if ($moreButton.length) {
            $moreButton.click();
            await sleep(200);
          }

          const $h2 = $li.find('h2').first();
          if ($h2.length) {
            post.secondaryContent = $h2.next().text();
          }
        }
      }
    }
  }
  //#endregion

  //#region helper methods
  /**
   * If there is a list of images, ensure is clicked to beginning
   * @param {jquery node} $mainImageSection Containing element to search
   */
  async function ensureAtFirstImage($mainImageSection) {
    const $leftButtonInnerDiv = $mainImageSection.find(
      'div.coreSpriteLeftChevron'
    );
    if ($leftButtonInnerDiv.length) {
      $leftButtonInnerDiv.closest('button').click();
      await sleep(200);
      await ensureAtFirstImage($mainImageSection);
    }
  }

  /**
   * Recursive function to get all main images
   * @param {jquery node} $mainImageSection The containing element to search from
   * @param {object} post The object to add data to
   * @param {array} images Array of src strings that have already been added
   */
  async function getOtherImages($mainImageSection, post, images) {
    const $rightButtonInnerDiv = $mainImageSection.find(
      'div.coreSpriteRightChevron'
    );
    if ($rightButtonInnerDiv.length) {
      // $rightButtonInnerDiv.click();
      $rightButtonInnerDiv.closest('button').click();

      // Allow sometime for click to occur
      await sleep(200);

      const $ul = $mainImageSection.find('ul').first();
      const $li = $ul.children('li').eq(images.length);
      const $image = $li.find('img').first();
      const source = $image.attr('src');

      if (source && !images.includes(source)) {
        post.attachments.push({
          type: 'image',
          mainContent: source
        });

        images.push(source);
      }

      await getOtherImages($mainImageSection, post, images);
    }
  }

  function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
  //#endregion
}
