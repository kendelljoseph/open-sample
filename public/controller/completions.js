const submit = document.querySelector('#edit-sample');

// eslint-disable-next-line no-undef
const editor = ace.edit('editor');
editor.setReadOnly(true);
editor.setOption('wrap', true);
editor.setTheme('ace/theme/chrome');
editor.getSession().setMode('ace/mode/text');
editor.getSession().setTabSize(2);
document.getElementById('editor').style.fontSize = '14px';

const activeTag = window.getCookie('activeTag');

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

const getTemplateArgumentText = async () => {
  const argTags = urlToObject();
  const keys = Object.keys(argTags);
  const vals = Object.values(argTags);

  // eslint-disable-next-line no-undef
  const tagValues = await Promise.all(vals.map(api.entity.getTagByName));

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
    // eslint-disable-next-line no-undef
    templateText = await api.entity.getTagByName(activeTag);
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

submit.onclick = () => {
  const newWriteEditorValue = localStorage.getItem('tagCompletionText');
  localStorage.setItem('writeEditorSessionValue', newWriteEditorValue);
  window.location.href = '/app/write';
};

submitFunction();
