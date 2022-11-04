const back = document.querySelector('#back');
const loading = document.querySelector('#loading');
const promptList = document.querySelector('#prompt-list');

const userAccessToken = window.getCookie('userAccessToken');

if (userAccessToken) {
  window.href = '/';
}

back.onclick = () => {
  window.location = '/';
};

const deleteEntity = async (record) => {
  if (!record.id) return;
  // eslint-disable-next-line no-alert, no-restricted-globals
  if (!confirm(`DELETE\n\n ${record.name}?`)) return;
  loading.style.display = 'block';

  const url = `${window.location.protocol}//${window.location.host}/api/v1/entity/${record.id}`;
  try {
    // eslint-disable-next-line no-undef
    await axios.delete(url, {
      headers: {
        Authorization: `Bearer ${userAccessToken}`,
        'x-app-event': 'entity-browser-app',
      },
    });
    // eslint-disable-next-line no-alert
    alert(`${record.name} deleted.`);
    window.location.reload();
  } catch (error) {
    // eslint-disable-next-line no-alert
    alert(error.message);
  }

  loading.style.display = 'none';
};

const addTag = async (record) => {
  if (!record.id) return;
  // eslint-disable-next-line no-alert, no-restricted-globals
  if (!confirm(`Add tag to:\n\n${record.name}`)) return;
  // eslint-disable-next-line no-alert
  const name = prompt('name:');
  if (!name || name.length < 2) return;

  loading.style.display = 'block';

  const url = `${window.location.protocol}//${window.location.host}/api/v1/tag`;
  // eslint-disable-next-line no-undef
  await axios.post(
    url,
    {
      name,
      entityId: record.id,
    },
    {
      headers: {
        Authorization: `Bearer ${userAccessToken}`,
        'x-app-event': 'tagged-prompts-browser-app',
      },
    },
  );

  loading.style.display = 'none';

  // eslint-disable-next-line no-alert
  alert('Tag Saved!');
};

const addPromptToWrite = async (record) => {
  const lastValue = localStorage.getItem('writeEditorSessionValue');
  const selectedText = record.prompt;
  const value = selectedText.length ? selectedText : null;

  let updatedValue;
  if (value) {
    updatedValue = `${lastValue && lastValue.length ? lastValue : ''}\n\n${value}`;
  }
  localStorage.setItem('writeEditorSessionValue', updatedValue);
  window.location.href = '/app/write';
};

const populateList = (records) => {
  records.forEach((record) => {
    const listItem = document.createElement('li');
    const liContainer = document.createElement('div');
    const subHeading = document.createElement('div');
    const promptContent = document.createElement('textarea');
    const writeButton = document.createElement('button');
    const tagButton = document.createElement('button');
    const deleteButton = document.createElement('button');
    listItem.classList.add(
      'list-group-item',
      'd-flex',
      'justify-content-between',
      'align-items-start',
    );
    liContainer.classList.add('ms-2', 'me-auto');
    subHeading.classList.add('fw-bold');
    promptContent.classList.add('my-2');
    writeButton.classList.add('btn', 'mx-1', 'btn-sm', 'btn-success');
    tagButton.classList.add('btn', 'me-3', 'btn-sm', 'btn-outline-light');
    deleteButton.classList.add('btn', 'btn-sm', 'btn-outline-danger');

    writeButton.textContent = '📝';
    tagButton.textContent = '💛';
    deleteButton.textContent = '❌';

    writeButton.onclick = () => {
      addPromptToWrite(record);
    };

    tagButton.onclick = () => {
      addTag(record);
    };

    deleteButton.onclick = () => {
      deleteEntity(record);
    };

    promptContent.setAttribute('readonly', true);
    promptContent.style.resize = 'none';
    promptContent.style.width = 'calc(100vw - 160px)';
    promptContent.style.height = '100px';

    listItem.appendChild(liContainer);
    liContainer.appendChild(subHeading);
    liContainer.appendChild(promptContent);
    listItem.appendChild(writeButton);
    listItem.appendChild(tagButton);
    listItem.appendChild(deleteButton);

    subHeading.innerHTML = record.name;
    subHeading.prepend(writeButton);
    promptContent.innerHTML = record.prompt;
    promptList.appendChild(listItem);
    return listItem;
  });
};

const loadPrompts = async () => {
  loading.style.display = 'block';

  const url = `${window.location.protocol}//${window.location.host}/api/v1/entity`;
  // eslint-disable-next-line no-undef
  const { data } = await axios.get(url, {
    headers: {
      Authorization: `Bearer ${userAccessToken}`,
      'x-app-event': 'load-prompt-entity-browser-app',
    },
  });

  populateList(data);
  loading.style.display = 'none';
};

loadPrompts();
