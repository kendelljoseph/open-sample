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

const cachedNodeList = localStorage.getItem('wiringEditorNodeList');
const cachedEdgeList = localStorage.getItem('wiringEditorEdgeList');

const nodes = cachedNodeList
  ? new vis.DataSet(JSON.parse(cachedNodeList))
  : new vis.DataSet([
    { id: 1, label: 'Loading' },
    { id: 2, label: 'Data' },
  ]);

const edges = cachedEdgeList
  ? new vis.DataSet(JSON.parse(cachedEdgeList))
  : new vis.DataSet([
    {
      from: 1,
      to: 2,
      label: 'your',
      font: { align: 'middle' },
      arrows: { to: { enabled: true } },
    },
  ]);

const network = new vis.Network(
  graph,
  {
    nodes,
    edges,
  },
  {
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
  },
);

network.on('click', (params) => {
  if (params.nodes.length === 1) {
    if (network.isCluster(params.nodes[0]) === true) {
      network.openCluster(params.nodes[0]);
    }
  }
});

network.once('beforeDrawing', () => {
  // WIP:
  if (userAccessToken) {
    // eslint-disable-next-line no-undef
    network.focus(userAccessToken, {
      scale: 5,
    });
  }
});
network.once('afterDrawing', () => {
  network.fit({
    animation: {
      duration: 2500,
      easingFunction: 'easeOutQuint',
    },
  });
});

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

const userNode = () => ({
  // eslint-disable-next-line no-undef
  id: userAccessToken,
  shape: 'circularImage',
  // eslint-disable-next-line no-undef
  label: userDisplayName,
  // eslint-disable-next-line no-undef
  image: userPictureUrl,
  size: 14,
  font: {
    size: 10,
    color: '#a3a',
    face: 'courier',
    strokeWidth: 3,
    strokeColor: '#ffffff',
  },
});

const nodeStyles = {
  completions: (record, category) => ({
    id: record.id,
    label: `💛 ${record.name}`,
    category,
    color: '#ffd900',
    size: 12,
    font: {
      size: 10,
      color: '#000',
      face: 'arial',
      strokeWidth: 3,
      strokeColor: '#ffffff',
    },
  }),
  prompts: (record, category) => ({
    id: record.id,
    label: `📓 ${record.name}`,
    category,
    color: '#ccc',
    size: 12,
    font: {
      size: 10,
      color: '#000',
      face: 'arial',
      strokeWidth: 3,
      strokeColor: '#ffffff',
    },
  }),
  problems: (record, category) => ({
    id: record.id,
    label: `🔥 ${record.event}`,
    category,
    color: '#fcc',
    size: 12,
    font: {
      size: 10,
      color: '#000',
      face: 'arial',
      strokeWidth: 3,
      strokeColor: '#ffffff',
    },
  }),
};

const edgeStyles = {
  completions: (record, label) => ({
    to: record.id,
    // eslint-disable-next-line no-undef
    from: userAccessToken,
    label,
    font: { align: 'middle', size: 8 },
    width: 1,
    arrows: { to: { enabled: true, scaleFactor: 0.5 } },
  }),
  prompts: (record, label) => ({
    to: record.id,
    // eslint-disable-next-line no-undef
    from: userAccessToken,
    label,
    font: { align: 'middle', size: 8 },
    width: 1,
    arrows: { to: { enabled: true, scaleFactor: 0.5 } },
  }),
  problems: (record, label) => ({
    to: record.id,
    // eslint-disable-next-line no-undef
    from: userAccessToken,
    label: `${label}:${record.statusCode}`,
    font: { align: 'middle', size: 8 },
    width: 1,
    arrows: { to: { enabled: true, scaleFactor: 0.5 } },
  }),
};

const clusterStyles = {
  completions: (label) => ({
    id: 'cidCluster',
    borderWidth: 3,
    shape: 'database',
    label,
    color: '#ffd900',
    size: 5,
    font: {
      size: 13,
      color: '#000',
      face: 'arial',
      strokeWidth: 3,
      aligned: 'middle',
      strokeColor: '#ffffff',
    },
  }),
  prompts: (label) => ({
    id: 'cidCluster',
    borderWidth: 3,
    shape: 'database',
    label,
    color: '#ccc',
    size: 5,
    font: {
      size: 13,
      color: '#000',
      face: 'arial',
      strokeWidth: 3,
      aligned: 'middle',
      strokeColor: '#ffffff',
    },
  }),
  problems: (label) => ({
    id: 'cidCluster',
    borderWidth: 3,
    shape: 'database',
    label,
    color: '#fcc',
    size: 5,
    font: {
      size: 13,
      color: '#000',
      face: 'arial',
      strokeWidth: 3,
      aligned: 'middle',
      strokeColor: '#ffffff',
    },
  }),
};

function clusterBy(category, label) {
  const clusterOptionsByData = {
    joinCondition(childOptions) {
      return childOptions.category === category;
    },
    clusterNodeProperties: clusterStyles[category](label),
  };
  network.cluster(clusterOptionsByData);
}

const populateGraph = (records, label, category, clusterLabel, addUser) => {
  const nodeList = [];
  const edgeList = [];

  if (addUser) {
    nodeList.push(userNode());
  }

  records.forEach((record) => {
    nodeList.push(nodeStyles[category](record, category));
    edgeList.push(edgeStyles[category](record, label));
  });

  if (nodeList.length) {
    nodes.add(nodeList);
    localStorage.setItem('wiringEditorNodeList', JSON.stringify(nodes.get()));
    network.fit({ nodes: nodes.get().map((node) => node.id) });
  }
  if (edgeList.length) {
    edges.add(edgeList);
    localStorage.setItem('wiringEditorEdgeList', JSON.stringify(edges.get()));
  }
  if (nodeList.length) {
    clusterBy(category, clusterLabel);
  }
};

const loadCompletions = async () => {
  loading.style.display = 'block';

  const sortByName = (data) => {
    if (data && data.length) {
      data.sort((a, b) => a.name.localeCompare(b.name));
    }
    return data;
  };

  const completionsData = await api.tag.getAll();
  sortByName(completionsData);

  nodes.clear();
  edges.clear();

  populateGraph(completionsData, 'CREATED', 'completions', '💛 completions', true);
  loading.style.display = 'none';
};

const loadPrompts = async () => {
  loading.style.display = 'block';

  // eslint-disable-next-line no-undef
  const completionsData = await api.entity.getAll();

  nodes.clear();
  edges.clear();

  populateGraph(completionsData, 'CREATED', 'prompts', '📓 prompts', true);
  loading.style.display = 'none';
};

const loadErrors = async () => {
  loading.style.display = 'block';

  // eslint-disable-next-line no-undef
  const errorData = await api.admin.routeError();

  const data = errorData.map((record, i) => ({
    id: `${i}-${Math.ceil(Math.random() * 1000000)}`,
    ...record,
  }));

  nodes.clear();
  edges.clear();

  populateGraph(data, 'STATUS_CODE', 'problems', '🔥 problems', true);
  loading.style.display = 'none';
};

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

  // eslint-disable-next-line no-undef
  const data = await api.ai.prompt({ prompt });

  if (data) {
    editor.setValue(`${data.prompt || ''}${data.response || ''}`);
    selectResponse(data.response);
    loading.style.display = 'none';
    editor.setReadOnly(false);
  } else {
    loading.style.display = 'none';
    editor.setReadOnly(false);
  }
};

const modes = ['text', 'javascript', 'json'];
let modeIndex = 0;
const nextMode = () => {
  modeIndex += 1;
  if (modeIndex > modes.length - 1) {
    modeIndex = 0;
  }
  return modes[modeIndex];
};

editor.commands.addCommand({
  name: 'detectCommandShiftEnter',
  bindKey: { win: 'Ctrl-Shift-Enter', mac: 'Command-Shift-Enter' },
  exec() {
    const mode = `ace/mode/${nextMode()}`;
    editor.getSession().setMode(mode);
    localStorage.setItem('wiringEditorSessionMode', mode);
  },
});

editor.commands.addCommand({
  name: 'executeAsCode',
  bindKey: { win: 'Alt-Shift-Enter', mac: 'Option-Shift-Enter' },
  exec() {
    const selectedText = editor.getSelectedText();
    const allText = editor.session.getValue();
    const value = selectedText.length ? selectedText : allText;
    if (!value) return;

    try {
      // eslint-disable-next-line no-eval
      window.eval(value);
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error(error);
      // eslint-disable-next-line no-alert
      alert(`${error.message}`);
    }
  },
});

editor.commands.addCommand({
  name: 'detectCommandEnter',
  bindKey: { win: 'Ctrl-Enter', mac: 'Command-Enter' },
  exec() {
    submitFunction();
  },
});

toPrompts.onclick = async () => {
  toPrompts.disabled = true;
  await loadPrompts();
  toPrompts.disabled = false;
};
toCompletions.onclick = async () => {
  toCompletions.disabled = true;
  await loadCompletions();
  toCompletions.disabled = false;
};
toProblems.onclick = async () => {
  toProblems.disabled = true;
  await loadErrors();
  toProblems.disabled = false;
};
