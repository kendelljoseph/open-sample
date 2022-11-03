const submit = document.querySelector('#edit-sample');

const activeTag = window.getCookie('activeTag');
const userAccessToken = window.getCookie('userAccessToken');

// eslint-disable-next-line no-undef
const editor = ace.edit('editor');
editor.setReadOnly(true);
editor.setOption('wrap', true);
editor.setTheme('ace/theme/chrome');
editor.getSession().setMode('ace/mode/text');
editor.getSession().setTabSize(2);
document.getElementById('editor').style.fontSize = '14px';

function urlToObject() {
  const object = {};
  let params = window.location.href.split('?');
  if (params.length > 1) {
    params = params[1].split('&');
    for (let i = 0; i < params.length; i += 1) {
      const param = params[i].split('=');
      const [key, value] = param;
      object[key] = value;
    }
  }
  return object;
}

const getTagByName = async (tagName) => {
  try {
    const url = `${window.location.protocol}//${window.location.host}/api/v1/entity/${tagName}`;
    // eslint-disable-next-line no-undef
    const { data } = await axios.get(url, {
      headers: {
        Authorization: `Bearer ${userAccessToken}`,
        'x-app-event': 'completion-get-tag-browser-app',
      },
    });

    return data.map(({ prompt }) => prompt).join('\n');
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error(error);
    // eslint-disable-next-line no-alert
    alert(`${error.message}`);
    return '';
  }
};

const getTemplateArgumentText = async () => {
  const argTags = urlToObject();
  const keys = Object.keys(argTags);
  const vals = Object.values(argTags);

  const tagValues = await Promise.all(vals.map(getTagByName));

  const templateData = {};
  tagValues.forEach((val, index) => {
    templateData[keys[index]] = val;
  });
  return templateData;
};

const submitFunction = async () => {
  let templateText = '';
  let renderedText = '';
  try {
    templateText = await getTagByName(activeTag);
    const templateData = await getTemplateArgumentText();
    if (Object.keys(templateData).length) {
      // eslint-disable-next-line no-undef
      renderedText = Mustache.render(templateText, templateData);
    } else {
      renderedText = templateText;
    }
    localStorage.setItem('tagCompletionText', renderedText);
    editor.setValue(renderedText);
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error(error);
    // eslint-disable-next-line no-alert
    alert(`${error.message}`);
  }
};

if (userAccessToken) {
  submitFunction();
} else {
  window.location.href = '/auth';
}

submit.onclick = () => {
  const newWriteEditorValue = localStorage.getItem('tagCompletionText');
  localStorage.setItem('writeEditorSessionValue', newWriteEditorValue);
  window.location.href = '/app/write';
};
