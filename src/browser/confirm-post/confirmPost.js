{
  chrome.storage.sync.get(['lastPost'], function(result) {
    const lastPost = result.lastPost;

    if (lastPost) {
      $('#media-platform').val(lastPost.mediaPlatform);
      $('#display-name').val(lastPost.displayName);
      $('#media-handle').val(lastPost.mediaHandle);
      $('#main-content').val(lastPost.mainContent);
      $('#secondary-content').val(lastPost.secondaryContent);

      if (lastPost.attachments && lastPost.attachments.length) {
        lastPost.attachments.forEach(function(attachment, index) {
          addAttachmentNodes(
            index,
            attachment.type,
            attachment.displayName,
            attachment.mediaHandle,
            attachment.mainContent,
            attachment.secondaryContent
          );
        });
      }

      $('#add-attachment').click(() => addAttachmentSection());
      $('#cancel').click(() => closeWindow());
      $('#save').click(() => savePost());
      $('#save-local').click(() => savePostInBrowser());
    }
  });

  //#region Adding to DOM with data obtained
  function addAttachmentSection() {
    const count = $('.attachment').length;
    const type = $('#media-platform').val();
    addAttachmentNodes(count, type);
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
          <div class="top-row">
            <div>
              <label for="type-${index}">Type</label>
              ${getTypeDropdown(`type-${index}`, getStringOrEmpty(type))}
            </div>
            <div>
              <button type="button" class="remove-btn">x</button>
            </div>
          </div>
          <div>
            <label for="display-name-${index}">Display Name</label>
            <input id="display-name-${index}" data-name="display-name" value="${getStringOrEmpty(
      displayName
    )}" />
          </div>
          <div>
            <label for="media-handle-${index}">Media Handle</label>
            <input id="media-handle-${index}" data-name="media-handle" value="${getStringOrEmpty(
      mediaHandle
    )}" />
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

    $('#attachments').append(attachmentNodes);
    $('.remove-btn').click(e => removeAttachmentSection(e.target));
  }

  function getTypeDropdown(id, value) {
    let select = `<select id="${id}" data-name="type">
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
    return `<textarea id="${id}" data-name="${dataName}" ${textClass}>${getStringOrEmpty(
      text
    )}</textarea>`;
  }

  function removeAttachmentSection(target) {
    $(target)
      .closest('.attachment')
      .remove();
  }

  //#endregion Adding to DOM with data obtained

  //#region save and close
  function closeWindow() {
    window.close();
  }

  function savePost() {
    $('button').attr('disabled', true);
    $('#loading').removeClass('hidden');

    const data = getData();
    const url =
      'https://localhost:44313/api/sociallists/5dd69c3c17fce357dc82444e/items';

    $.ajax({
      type: 'POST',
      url: url,
      data: JSON.stringify(data),
      dataType: 'json',
      contentType: 'application/json; charset=utf-8',
      success: closeWindow,
      error: function(response) {
        $('#loading').addClass('hidden');
        $('button').attr('disabled', false);
        alert(`Error ${response.status}. Save unsuccessful.`);
      }
    });
  }

  // Store post in storage to be sent later
  function savePostInBrowser() {
    const data = getData();

    let mediaPosts = [];
    chrome.storage.sync.get(['mediaPosts'], function(result) {
      if (result.mediaPosts) mediaPosts = result.mediaPosts;
      mediaPosts.push(data);

      chrome.storage.sync.set({ mediaPosts }, () => closeWindow());
    });
  }

  function getData() {
    const mediaPost = {
      mediaPlatform: $('#media-platform').val(),
      displayName: $('#display-name').val(),
      mediaHandle: $('#media-handle').val(),
      mainContent: $('#main-content').val(),
      secondaryContent: $('#secondary-content').val(),
      attachments: []
    };

    $('.attachment').each(function() {
      mediaPost.attachments.push({
        type: $(this)
          .find("select[data-name='type']")
          .first()
          .val(),
        displayName: $(this)
          .find("input[data-name='display-name']")
          .first()
          .val(),
        mediaHandle: $(this)
          .find("input[data-name='media-handle']")
          .first()
          .val(),
        mainContent: $(this)
          .find("textarea[data-name='main-content']")
          .first()
          .val(),
        secondaryContent: $(this)
          .find("textarea[data-name='secondary-content']")
          .first()
          .val()
      });
    });

    return mediaPost;
  }

  //#endregion save and close
}
