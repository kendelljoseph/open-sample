const back = document.querySelector('#back');
const loading = document.querySelector('#loading');
const promptList = document.querySelector('#prompt-list');

const userAccessToken = window.getCookie('userAccessToken');

if (!userAccessToken) {
  window.location.href = '/';
}

back.onclick = () => {
  window.location = '/';
};

const populateList = (records) => {
  records.forEach((record) => {
    const writeButton = document.createElement('button');

    writeButton.classList.add(
      'btn',
      'my-1',
      'btn-lg',
      'list-group-item-action',
      'btn-outline-light',
    );

    writeButton.textContent = `💛 ${record.slug}`;

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

  const url = `${window.location.protocol}//${window.location.host}/api/v1/tag`;
  // eslint-disable-next-line no-undef
  const { data } = await axios.get(url, {
    headers: {
      Authorization: `Bearer ${userAccessToken}`,
      'x-app-event': 'tag-browser-app',
    },
  });
  data.sort((a, b) => a.name.localeCompare(b.name));
  populateList(data);
  loading.style.display = 'none';
};

loadTags();
