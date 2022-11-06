const back = document.querySelector('#back');
const loading = document.querySelector('#loading');
const graph = document.querySelector('#graph');
const toPrompts = document.querySelector('#to-prompts');
const toCompletions = document.querySelector('#to-completions');
const toProblems = document.querySelector('#to-problems');
const waText = document.querySelectorAll('.wa-text');
const writeTip = document.querySelector('#write-tip');
if (navigator.platform.indexOf('Win') !== -1) {
  writeTip.innerHTML = 'Ctrl + Enter';
} else if (navigator.platform.indexOf('Mac') !== -1) {
  writeTip.innerHTML = 'Cmd + Enter';
}

const checkDisplay = () => {
  if (window.screen.width <= 640) {
    writeTip.style.display = 'none';
    waText.forEach((text) => {
      text.style.display = 'none';
    });
  } else {
    writeTip.style.display = 'block';
    waText.forEach((text) => {
      text.style.display = '';
    });
  }
};
window.addEventListener('resize', checkDisplay);
checkDisplay();

const userAccessToken = window.getCookie('userAccessToken');
const userDisplayName = window.getCookie('userDisplayName');

if (!userAccessToken) {
  window.location.href = '/';
}

// create an array with nodes
const nodes = new vis.DataSet([
  { id: 1, label: 'Loading' },
  { id: 2, label: 'Data' },
]);

// create an array with edges
const edges = new vis.DataSet([
  {
    from: 1,
    to: 2,
    label: 'your',
    font: { align: 'middle' },
    arrows: { to: { enabled: true } },
  },
]);

// create a network
const initNetworkData = {
  nodes,
  edges,
};

const networkOptions = {
  nodes: {
    shape: 'dot',
    color: '#fff',
    size: 10,
    font: {
      size: 12,
    },
    borderWidth: 2,
    shadow: true,
  },
  edges: {
    width: 2,
  },
};
const network = new vis.Network(graph, initNetworkData, networkOptions);

// eslint-disable-next-line no-undef
const editor = ace.edit('editor');
editor.setOption('wrap', true);
editor.setTheme('ace/theme/chrome');
editor.getSession().setMode('ace/mode/text');
editor.getSession().setTabSize(2);
document.getElementById('editor').style.fontSize = '14px';

const lastMode = localStorage.getItem('wiringEditorSessionMode');
if (lastMode) {
  editor.getSession().setMode(lastMode);
}

const lastValue = localStorage.getItem('wiringEditorSessionValue');
if (lastValue && lastValue.length) {
  editor.setValue(lastValue);
}

editor.on('change', () => {
  localStorage.setItem('wiringEditorSessionValue', editor.getValue());
});

// A controller that selects response text
const selectResponse = (rawText) => {
  if (!rawText || !rawText.length) return;
  const value = editor.session.getValue();
  const text = rawText.match(/^.*\n.*\n([\s\S]*)$/)
    ? rawText.match(/^.*\n.*\n([\s\S]*)$/)[1]
    : null; // skip first two new lines
  if (text === null) return;
  const startRow = value.substr(0, value.indexOf(text)).split(/\r\n|\r|\n/).length - 1;
  const startCol = editor.session.getLine(startRow).indexOf(text);
  const endRowOffset = text.split(/\r\n|\r|\n/).length;
  const endRow = startRow + endRowOffset - 1;
  const endCollOffset = text.split(/\r\n|\r|\n/)[endRowOffset - 1].length;
  const endCol = startCol + (endCollOffset > 1 ? endCollOffset + 1 : endCollOffset);

  const Range = editor.getSelectionRange().constructor;
  // eslint-disable-next-line no-undef
  const range = new Range(startRow, startCol, endRow, endCol);

  editor.session.selection.setRange(range);
  editor.scrollToLine(startRow, true, true, () => {});
};

back.onclick = () => {
  window.location = '/';
};

const populateGraph = (records, label) => {
  const nodeList = [];
  const edgeList = [];

  nodeList.push({ id: userAccessToken, label: userDisplayName, color: '#eee' });

  records.forEach((record) => {
    nodeList.push({ id: record.id, label: record.slug });
    edgeList.push({
      to: record.id,
      from: userAccessToken,
      label,
      font: { align: 'middle', size: 8 },
      width: 1,
      arrows: { to: { enabled: true, scaleFactor: 0.5 } },
    });
  });

  if (nodeList.length) {
    nodes.clear();
    nodes.add(nodeList);
  }
  if (edgeList.length) {
    edges.clear();
    edges.add(edgeList);
  }
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

  if (data && data.length) {
    data.sort((a, b) => a.name.localeCompare(b.name));
  }

  populateGraph(data, 'CREATED TAG');
  loading.style.display = 'none';
};

loadTags();

const submitFunction = async () => {
  editor.setReadOnly(true);
  loading.style.display = 'block';

  const selectedText = editor.getSelectedText();
  let prompt = '';
  if (selectedText.length) {
    prompt = selectedText;
  } else {
    prompt = editor.getValue();
  }

  try {
    const url = `${window.location.protocol}//${window.location.host}/api/v1/ai/prompt`;
    // eslint-disable-next-line no-undef
    const { data } = await axios.post(
      url,
      {
        prompt,
      },
      {
        headers: {
          Authorization: `Bearer ${userAccessToken}`,
          'x-app-event': 'write-ai-prompt-browser-app',
        },
      },
    );

    editor.setValue(`${data.prompt || ''}${data.response || ''}`);
    selectResponse(data.response);
    loading.style.display = 'none';
    editor.setReadOnly(false);
  } catch (error) {
    loading.style.display = 'none';
    editor.setReadOnly(false);
    // eslint-disable-next-line no-console
    console.error(error);
    // eslint-disable-next-line no-alert
    alert(`${error.message}`);
  }
};

editor.commands.addCommand({
  name: 'detectCommandEnter',
  bindKey: { win: 'Ctrl-Enter', mac: 'Command-Enter' },
  exec() {
    submitFunction();
  },
});

toPrompts.onclick = () => {
  window.location.href = '/app/prompts';
};
toCompletions.onclick = () => {
  window.location.href = '/app/completions';
};
toProblems.onclick = () => {
  window.location.href = '/app/admin';
};
