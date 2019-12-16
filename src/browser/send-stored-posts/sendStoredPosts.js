{
  let mediaPosts = [];

  chrome.storage.sync.get(['mediaPosts'], function(result) {
    if (result && result.mediaPosts && result.mediaPosts.length) {
      mediaPosts = result.mediaPosts;
      refreshPage(mediaPosts);
    } else {
      $('form').append('<section>No posts to display.</section>');
      $('#cancel').click(() => closeWindow());
    }
  });

  function refreshPage(posts) {
    $('form').empty();

    posts.forEach(function(post, index) {
      const postSection = getMediaPostSection(post, index);
      $('form').append(postSection);
    });

    $('.remove-btn').click(e => removePost(e.target));
    $('#save').click(() => savePost());
    $('#cancel').click(() => closeWindow());
  }

  //#region Adding to DOM with data obtained
  function getMediaPostSection(post, index) {
    let attachmentSections = !post.attachments.length
      ? '<h3>No attachments for above media post</h3>'
      : getAttachmentSections(post.attachments);

    const postSection = `
      <section data-index="${index}">
        <h2>Media Post</h2>
        <div>
          <div class="form-section">
            <div class="top-row">
              <div>
                <label for="media-platform">Media Platform</label>
                <input id="media-platform" value="${post.mediaPlatform}" disabled>
              </div>
              <div>
                <button type="button" class="remove-btn">x</button>
              </div>
            </div>
            <div>
              <label for="display-name">Display Name</label>
              <input id="display-name" value="${post.displayName}" disabled>
            </div>
            <div>
              <label for="media-handle">Media Handle</label>
              <input id="media-handle" value="${post.mediaHandle}" disabled>
            </div>
            <div>
              <label for="main-content">Main Content</label>
              <textarea id="main-content" disabled>${post.mainContent}</textarea>
            </div>
            <div>
              <label for="secondary-content">Secondary Content</label>
              <textarea id="secondary-content" class="secondary" disabled>${post.secondaryContent}</textarea>
            </div>
          </div>
        </div>

        <div id="attachments">
          ${attachmentSections}
        </div>
      </section>`;

    return postSection;
  }

  function getAttachmentSections(attachments) {
    let sections = '<h3>Attachments</h3>';
    attachments.forEach(function(attachment, index) {
      sections += addAttachmentNodes(
        index,
        attachment.type,
        attachment.displayName,
        attachment.mediaHandle,
        attachment.mainContent,
        attachment.secondaryContent
      );
    });

    return sections;
  }

  function addAttachmentNodes(
    index,
    type,
    displayName,
    mediaHandle,
    mainContent,
    secondaryContent
  ) {
    const mainContentImage =
      type === 'image'
        ? getImageNode(`main-content-image-${index}`, mainContent)
        : '';

    const attachmentNodes = `
      <div class="attachment">
        <div class="data-col form-section">
          <div class="attach-top-row">
            <div>
              <label for="type-${index}">Type</label>
              ${getTypeDropdown(`type-${index}`, getStringOrEmpty(type))}
            </div>
          </div>
          <div>
            <label for="display-name-${index}">Display Name</label>
            <input id="display-name-${index}" data-name="display-name" value="${getStringOrEmpty(
      displayName
    )}" disabled />
          </div>
          <div>
            <label for="media-handle-${index}">Media Handle</label>
            <input id="media-handle-${index}" data-name="media-handle" value="${getStringOrEmpty(
      mediaHandle
    )}" disabled />
          </div>
          <div>
            <label for="main-content-${index}">Main Content</label>
            ${getTextAreaNode(
              `main-content-${index}`,
              'main-content',
              mainContent
            )}
          </div>
          <div>
          <label for="secondary-content-${index}">Secondary Content</label>
            ${getTextAreaNode(
              `secondary-content-${index}`,
              'secondary-content',
              secondaryContent
            )}
          </div>
        </div>
        ${mainContentImage}
      </div>`;

    return attachmentNodes;
  }

  function getTypeDropdown(id, value) {
    let select = `<select id="${id}" data-name="type" disabled>
      <option value="image">image</option>
      <option value="video">video</option>
      <option value="referenced quote">referenced quote</option>
      <option value="referenced link">referenced link</option>
    </select>`;

    if (value)
      return select.replace(`value="${value}"`, `value="${value}" selected`);
    return select;
  }

  function getStringOrEmpty(content) {
    return content ? content : '';
  }

  function getImageNode(id, source) {
    return `<div class="image-col"><img id="${id}" src="${source}" /></div>`;
  }

  function getTextAreaNode(id, dataName, text) {
    const textClass =
      dataName == 'secondary-content' ? `class="secondary"` : '';
    return `<textarea id="${id}" data-name="${dataName}" ${textClass} disabled>
      ${getStringOrEmpty(text)}
    </textarea>`;
  }

  function removePost(target) {
    // Remove from array first
    const index = $(target)
      .closest('section')
      .attr('data-index');
    mediaPosts.splice(index, 1);

    // Refresh DOM with new posts to account for changes in index
    refreshPage(mediaPosts);
  }

  //#endregion Adding to DOM with data obtained

  //#region save and close
  function closeWindow() {
    window.close();
  }

  function savePost() {
    $('button').attr('disabled', true);
    $('#loading').removeClass('hidden');
    const url =
      'https://localhost:44313/api/sociallists/5dd69c3c17fce357dc82444e/multipleitems';

    $.ajax({
      type: 'POST',
      url: url,
      data: JSON.stringify(mediaPosts),
      dataType: 'json',
      contentType: 'application/json; charset=utf-8',
      success: function() {
        chrome.storage.sync.set({ mediaPosts: [] }, () => closeWindow());
      },
      error: function(resp) {
        $('#loading').addClass('hidden');
        $('button').attr('disabled', false);
        alert(`Error ${resp.status}. Save unsuccessful`);
      }
    });
  }

  //#endregion save and close
}
