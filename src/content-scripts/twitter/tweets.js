{
  setupTweetButtons();

  function setupTweetButtons() {
    MutationObserver = window.MutationObserver || window.WebKitMutationObserver;
    // var timeline = document.querySelector('[aria-label="Timeline: Your Home Timeline"]');
    // var tweetsContainer = (timeline) ? timeline.firstChild.firstChild : document.documentElement;
    const primarySelector = 'div[data-testid="primaryColumn"]';
    const primaryColumn = document.querySelector(primarySelector);

    if (primaryColumn) {
      const pathStart = window.location.pathname.toString().substring(0, 5);
      const selector = 'section[aria-labelledby][role="region"]';
      const tweetsSection = document.querySelector(selector);

      if (tweetsSection) {
        const observer = new MutationObserver(function(mutations, observer) {
          // Fired when a mutation occurs
          // console.log(mutations, observer);
          addTweetButtons(pathStart);
        });

        // Observes higher parent: a lot more function calls but helpful if specific selection doesnt work
        // observer.observe(tweetsSection, {
        //   subtree: true,
        //   childList: true,
        //   attributes: false
        // });

        const timeline = tweetsSection.querySelector(`[aria-label]`);

        if (timeline) {
          const tweetsContainer = timeline.firstChild.firstChild;
          // Define what element should be observed by the observer
          // and what types of mutations trigger the callback
          observer.observe(tweetsContainer, {
            subtree: false,
            childList: true
          });
        }

        // Add buttons immediately when this js file is called since no change has happened yet
        addTweetButtons(pathStart);
      }
    }
  }

  // Add button for every tweet and it's function after added to DOM
  function addTweetButtons(pathStart) {
    const d3Button = `<button class="d3-btn">Save Tweet</button>`;
    const profileNav = $(`nav[aria-label][role="navigation"]`);

    $(`article[role="article"]`).each(function(index) {
      // Only add button if it does not already exist for the tweet
      if (!$(this).find('.d3-btn').length) {
        if (pathStart == '/home' || profileNav.length) {
          $(this)
            .find('.r-1awozwy.r-unbg4v.r-18kxxzh.r-5f2r5o')
            .first()
            .children()
            .first()
            .after(d3Button);
        } else {
          $(this)
            .find(`[data-testid='tweet']`)
            .children()
            .last('')
            .find(`.css-1dbjc4n.r-1wbh5a2.r-dnmrzs`)
            .first()
            .after(d3Button);
        }

        $(this)
          .find('.d3-btn')
          .first()
          .click(saveTweet);
      }
    });
  }

  // Search DOM and collect relevant data: username, handle, post content, associated media
  function saveTweet() {
    const twitterPost = {
      mediaPlatform: 'twitter',
      displayName: '',
      mediaHandle: '',
      mainContent: '',
      secondaryContent: '',
      addedBy: '',
      attachments: []
    };

    const $tweetContainer = $(this).closest("div[data-testid='tweet']");
    if ($tweetContainer.length) {
      twitterPost.displayName = getUsername($tweetContainer);
      twitterPost.mediaHandle = getTwitterHandle($tweetContainer);
      console.log('------------------');
      console.log('Username: ' + twitterPost.displayName);
      console.log('Twitter handle: ' + twitterPost.mediaHandle);

      const $tweetElement = $tweetContainer
        .find("div[dir='auto'][lang]")
        .first();
      if ($tweetElement.length) {
        twitterPost.mainContent = $tweetElement.text();
        console.log('Tweet: ' + twitterPost.mainContent);

        // TODO add links within text to media array (links within tweetElement with elements a[title])

        const $tweetEleSibling = $tweetElement.next();
        // If the next element is group, then there is no attachment or quote
        // If there is an attachment, get the data
        if (
          $tweetEleSibling.length &&
          $tweetEleSibling.attr('role') != 'group'
        ) {
          // TODO: within tweetEleSibling, not always going to be aria-haspopup with data-focusable and role
          const $attachmentEleContainer = $tweetEleSibling
            .find('[aria-haspopup]')
            .first();
          // const attachmentElement = (attachmentEle.attr('role')) ? attachmentEle : attachmentEle.find('[role]').addBack('[role]').first();
          const $attachmentEle = $attachmentEleContainer
            .find('[role]')
            .addBack('[role]')
            .first();

          if ($attachmentEle.length) {
            const role = $attachmentEle.attr('role');
            console.log('Attachment role: ' + role);
            if (role == 'link') {
              getDataForLinkAttachment($attachmentEle, twitterPost);
              getLinkAttachmentSummary($attachmentEleContainer, twitterPost);
            } else if (role == 'blockquote') {
              getDataForBlockquoteAttachment($attachmentEle, twitterPost);
            } else if (role == 'button') {
              const img = getImageData($attachmentEle, twitterPost);
              const video = getVideoData($attachmentEle, twitterPost);
            }
            // else if (!role) {
            //   // TODO When no role with div above, search for element deeper with the link
            //   const attachmentElement = attachmentEle.find('[role]');
            //   if (role == 'link') {
            //     getDataForLinkAttachment(attachmentElement);
            //   } else if (role == 'blockquote') {
            //     getDataForBlockquoteAttachment(attachmentElement);
            //   }
            // }
          }
        }
      }

      console.log('TWITTER POST --> ', twitterPost);
      chrome.runtime.sendMessage({ message: 'confirmPost', data: twitterPost });
    }
  }

  function getUsername($containingElement) {
    const $usernameElement = $containingElement
      .find("div[dir='auto'] > span > span")
      .first();
    return $usernameElement.length ? $usernameElement.text() : null;
  }

  function getTwitterHandle($containingElement) {
    const $userHandleElement = $containingElement
      .find("div[dir='ltr'] > span")
      .first();
    return $userHandleElement.length ? $userHandleElement.text() : null;
  }

  function getTweetContent($containingElement) {
    const $tweetElement = $containingElement
      .find("div[dir='auto'][lang]")
      .first();
    return $tweetElement.length ? $tweetElement.text() : null;
  }

  function getDataForLinkAttachment($attachmentEle, twitterPost) {
    let linkPath = $attachmentEle.attr('href');
    if (linkPath[0] == '/') linkPath = 'twitter.com' + linkPath;
    getImageData($attachmentEle, twitterPost);

    const $video = $attachmentEle.find('iframe[data-src][frameborder]');
    if ($video.length) {
      const videoLink = $video.attr('src');
      twitterPost.attachments.push({
        type: 'video',
        source: videoLink
      });
      console.log('video link: ' + videoLink);
    }

    console.log('link attached: ' + linkPath);
  }

  function getLinkAttachmentSummary($attachmentEleContainer, twitterPost) {
    const $mediaDescriptionContainer = $attachmentEleContainer.find(
      `div.css-1dbjc4n.r-16y2uox.r-1wbh5a2.r-1777fci.r-1mi0q7o.r-utggzx.r-m611by`
    );
    if ($mediaDescriptionContainer.length) {
      const referencedLink = { type: 'referenced link', mainContent: '' };

      console.log('is mediaDescriptionContainer');
      const $titleDiv = $mediaDescriptionContainer.children().eq(0);
      if ($titleDiv.length) {
        console.log('title quoted attachment: ' + $titleDiv.text());
        referencedLink.mainContent += $titleDiv.text();
      }

      const $attachmentContentDiv = $mediaDescriptionContainer.children().eq(1);
      if ($attachmentContentDiv.length) {
        console.log(
          'content quoted attachment: ' + $attachmentContentDiv.text()
        );
        if (referencedLink.mainContent.length)
          referencedLink.mainContent += '\n';
        referencedLink.mainContent = $attachmentContentDiv.text();
      }

      const $attachmentUrlDiv = $mediaDescriptionContainer.children().eq(2);
      if ($attachmentUrlDiv.length) {
        console.log('url quoted attachment: ' + $attachmentUrlDiv.text());
        referencedLink.secondaryContent = $attachmentUrlDiv.text();
      }

      twitterPost.attachments.push(referencedLink);
      return referencedLink;
    }

    return {};
  }

  function getDataForBlockquoteAttachment($attachmentEle, twitterPost) {
    const quotedUsername = getUsername($attachmentEle);
    const quotedTwitterHandle = getTwitterHandle($attachmentEle);
    const quotedTweet = getTweetContent($attachmentEle);
    console.log('quote username: ' + quotedUsername);
    console.log('quote handle: ' + quotedTwitterHandle);
    console.log('quote tweet: ' + quotedTweet);

    const video = getVideoData($attachmentEle);

    twitterPost.attachments.push({
      type: 'referenced quote',
      displayName: quotedUsername,
      mediaHandle: quotedTwitterHandle,
      mainContent: quotedTweet,
      secondaryContent: video.type ? video.mainContent : null
    });
  }

  function getImageData($containerEle, twitterPost) {
    const $img = $containerEle.find('img');
    if ($img.length) {
      const imageLink = $img.attr('src');
      console.log('image link: ' + imageLink);
      twitterPost.attachments.push({
        type: 'image',
        mainContent: imageLink
      });
    }
  }

  function getVideoData($containerEle, twitterPost) {
    const $video = $containerEle.find('video');
    if ($video.length) {
      // Below only gets a blob url which does not actually link to actualy video link
      const videoLink = $video.attr('src');
      console.log('video link in attachment: ' + videoLink);
      const posterLink = $video.attr('poster');
      console.log('poster link for video in attachment: ' + posterLink);

      videoObject = {
        type: 'video',
        mainContent: videoLink,
        secondaryContent: posterLink
      };

      if (twitterPost) twitterPost.attachments.push(videoObject);
      return videoObject;
    }
    return {};
  }
}
