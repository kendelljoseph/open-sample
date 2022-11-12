const back = document.querySelector('#back');
const loading = document.querySelector('#loading');
const promptList = document.querySelector('#prompt-list');
const notice = document.querySelector('#notice');

back.onclick = () => {
  window.location = '/';
};

const deleteEntity = async (record) => {
  if (!record.id) return;
  // eslint-disable-next-line no-alert, no-restricted-globals
  if (!confirm(`DELETE\n\n ${record.name}?`)) return;
  loading.style.display = 'block';

  // eslint-disable-next-line no-undef
  await api.entity.remove(record.id);
  window.location.reload();
};

const addTag = async (record) => {
  if (!record.id) return;
  // eslint-disable-next-line no-alert, no-restricted-globals
  if (!confirm(`Add tag to:\n\n${record.name}`)) return;
  // eslint-disable-next-line no-alert
  const name = prompt('name:');
  if (!name || name.length < 2) return;

  loading.style.display = 'block';

  // eslint-disable-next-line no-undef
  await api.tag.create({
    name,
    entityId: record.id,
  });

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

const addPromptToWiring = async (record) => {
  const lastValue = localStorage.getItem('wiringEditorSessionValue');
  const selectedText = record.prompt;
  const value = selectedText.length ? selectedText : null;

  let updatedValue;
  if (value) {
    updatedValue = `${lastValue && lastValue.length ? lastValue : ''}\n\n${value}`;
  }
  localStorage.setItem('wiringEditorSessionValue', updatedValue);
  window.location.href = '/app/wiring';
};

const populateList = (records) => {
  records.forEach((record) => {
    const listItem = document.createElement('li');
    const liContainer = document.createElement('div');
    const subHeading = document.createElement('div');
    const promptContent = document.createElement('textarea');
    const writeButton = document.createElement('button');
    const wireButton = document.createElement('button');
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
    wireButton.classList.add('btn', 'mx-1', 'btn-sm', 'btn-outline-success');
    tagButton.classList.add('btn', 'me-3', 'btn-sm', 'btn-outline-primary');
    deleteButton.classList.add('btn', 'me-3', 'btn-sm', 'btn-outline-danger');

    writeButton.textContent = '📝';
    wireButton.textContent = '🔌';
    tagButton.textContent = '🖊';
    deleteButton.textContent = '🗑';

    writeButton.onclick = () => {
      addPromptToWrite(record);
    };

    wireButton.onclick = () => {
      addPromptToWiring(record);
    };

    tagButton.onclick = () => {
      addTag(record);
    };

    deleteButton.onclick = () => {
      deleteEntity(record);
    };

    promptContent.setAttribute('readonly', true);
    promptContent.style.resize = 'none';
    promptContent.style.width = 'calc(100vw - 180px)';
    promptContent.style.height = '100px';

    listItem.appendChild(liContainer);
    liContainer.appendChild(subHeading);
    liContainer.appendChild(promptContent);
    listItem.appendChild(writeButton);
    listItem.appendChild(wireButton);
    listItem.appendChild(tagButton);
    listItem.appendChild(deleteButton);

    subHeading.innerHTML = record.name;
    subHeading.prepend(writeButton);
    subHeading.prepend(wireButton);
    promptContent.innerHTML = record.prompt;
    promptList.appendChild(listItem);
    return listItem;
  });
};

const loadPrompts = async () => {
  loading.style.display = 'block';

  // eslint-disable-next-line no-undef
  const data = await api.entity.getAll();
  if (data && data.length) notice.style.display = 'none';

  populateList(data.reverse());
  loading.style.display = 'none';
};

loadPrompts();
