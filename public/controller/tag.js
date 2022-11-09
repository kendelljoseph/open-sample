const back = document.querySelector('#back');
const loading = document.querySelector('#loading');
const promptList = document.querySelector('#prompt-list');
const notice = document.querySelector('#notice');

back.onclick = () => {
  window.location = '/';
};

const populateList = (records) => {
  records.forEach((record, index) => {
    const writeButton = document.createElement('button');

    writeButton.classList.add(
      'btn',
      'my-1',
      'btn-lg',
      'list-group-item-action',
      'btn-outline-light',
    );

    writeButton.textContent = `${index + 1}. 💛 ${record.slug}`;

    writeButton.onclick = () => {
      const tagUrl = `${window.location.protocol}//${window.location.host}/completions/${record.slug}`;
      window.location.href = tagUrl;
    };
    promptList.appendChild(writeButton);
    return writeButton;
  });
};

const loadTags = async () => {
  loading.style.display = 'block';

  // eslint-disable-next-line no-undef
  const data = await api.tag.getAll();

  if (data && data.length) {
    notice.style.display = 'none';
    data.sort((a, b) => a.name.localeCompare(b.name));
  }

  populateList(data);
  loading.style.display = 'none';
};

loadTags();
