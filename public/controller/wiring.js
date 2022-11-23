const back = document.querySelector('#back');
const purchaseOption = document.querySelector('#purchase-option');
const loading = document.querySelector('#loading');
const graph = document.querySelector('#graph');
const graphOptionsMenu = document.querySelector('#graph-options-menu');
const targetNode = document.querySelector('#target-node');
const selectOutputNode = document.querySelector('#select-node-output-to');
const selectMessageNode = document.querySelector('#select-node-message-to');
const cancelNodeTarget = document.querySelector('#cancel-node-target');
const viewBoth = document.querySelector('#view-both');
const viewGraphOnly = document.querySelector('#view-graph-only');
const viewEditorOnly = document.querySelector('#view-editor-only');
const targetTooltip = document.querySelector('#target-tooltip');
const withinArea = document.querySelector('#within-area-name');
const withinFunction = document.querySelector('#within-function-name');
const withinRole = document.querySelector('#within-role-name');
const triggerEvent = document.querySelector('#trigger-event-name');
const selectArea = document.querySelector('#indicate-done-within-area');
const selectFunction = document.querySelector('#indicate-done-within-function');
const selectRole = document.querySelector('#indicate-done-within-role');
const selectEvent = document.querySelector('#indicate-done-trigger-event');
const targetModalOpener = document.querySelectorAll('.target-modal-opener');
const toPrompts = document.querySelector('#to-prompts');
const toCompletions = document.querySelector('#to-completions');
const toProblems = document.querySelector('#to-problems');
const toggleSpeech = document.querySelector('#toggle-speech');
const speechIndicator = document.querySelector('#speech-indicator');
const simIndicator = document.querySelector('#sim-indicator');
const waText = document.querySelectorAll('.wa-text');
const writeTip = document.querySelector('#write-tip');
const configContainer = document.querySelector('#config');
const showConfig = document.querySelector('#show-config');
const clearNetwork = document.querySelector('#clear-network');
const submit = document.querySelector('#submit');
const runTargetNode = document.querySelector('#run-target-node');
const editTargetImage = document.querySelector('#edit-target-image');
const sampleMenu = document.querySelector('#sample-menu');
const automationMenu = document.querySelector('#automation-menu');
const loadExperience = document.querySelector('#load-experience');
const simulation = document.querySelector('#simulation');
const setActivityPrompt = document.querySelector('#set-activity-prompt');
const setNodeActivityPrompt = document.querySelector('#set-node-activity-prompt');
const newActivityPrompt = document.querySelector('#new-activity-prompt');
const runCode = document.querySelector('#run-javascript');
const nodeAttributeNameInput = document.querySelector('#set-node-attribute-name');
const nodeAttributeValueInput = document.querySelector('#set-node-attribute-value');
const setNodeAttribute = document.querySelector('#set-node-attribute');
const setNodePromptValueInput = document.querySelector('#set-node-prompt-value');
const deleteNode = document.querySelector('#delete-node');

const saveAsPrompt = document.querySelector('#save-prompt');
const downloadData = document.querySelector('#download-data');
const buyData = document.querySelector('#buy-data');
const importData = document.querySelector('#import-data');
if (navigator.platform.indexOf('Win') !== -1) {
  writeTip.innerHTML = `Viewing as ${displayName}`;
} else if (navigator.platform.indexOf('Mac') !== -1) {
  writeTip.innerHTML = `Viewing as ${displayName}`;
}

let activityPrompt = localStorage.getItem('activityPrompt');
window.simulationFrames = JSON.parse(localStorage.getItem('iframes'));

window.buyLink = localStorage.getItem('buyLink');
if (!window.buyLink) purchaseOption.innerHTML = 'claim';
let speechEnabled = JSON.parse(localStorage.getItem('speechIndicatorMode'));
speechIndicator.innerHTML = speechEnabled ? 'ON' : 'OFF';

if (speechEnabled) {
  window.responsiveVoice.cancel();
  window.responsiveVoice.speak(
    `Welcome back, ${displayName}. ${
      window.buyLink ? 'This sample is available for purchase' : ''
    }`,
  );
}
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

const checkDisplay = () => {
  const editorElement = document.getElementById('editor');
  if (window.screen.width <= 640) {
    writeTip.style.display = 'none';
    waText.forEach((text) => {
      // eslint-disable-next-line no-param-reassign
      text.style.display = 'none';
    });
    graph.classList.remove('rightGraph');
    graph.classList.add('topGraph');
    editorElement.classList.remove('leftEditor');
    editorElement.classList.add('bottomEditor');
  } else {
    writeTip.style.display = 'block';
    waText.forEach((text) => {
      // eslint-disable-next-line no-param-reassign
      text.style.display = '';
    });
    graph.classList.remove('topGraph');
    graph.classList.add('rightGraph');
    editorElement.classList.remove('bottomEditor');
    editorElement.classList.add('leftEditor');
  }
};
window.addEventListener('resize', checkDisplay);
checkDisplay();

const cachedNodeList = localStorage.getItem('wiringEditorNodeList');
const cachedEdgeList = localStorage.getItem('wiringEditorEdgeList');
const cachedDrawingNodeList = localStorage.getItem('wiringEditorDrawingNodeList');
const cachedDrawingEdgeList = localStorage.getItem('wiringEditorDrawingEdgeList');

const nodes = cachedNodeList
  ? new vis.DataSet(JSON.parse(cachedNodeList))
  : new vis.DataSet([
    { id: 1, label: 'Model' },
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

const drawingNodes = cachedDrawingNodeList
  ? new vis.DataSet(JSON.parse(cachedDrawingNodeList))
  : new vis.DataSet([]);

const drawingEdges = cachedDrawingEdgeList
  ? new vis.DataSet(JSON.parse(cachedDrawingEdgeList))
  : new vis.DataSet([]);

// eslint-disable-next-line no-undef
const network = new vis.Network(
  graph,
  {
    nodes,
    edges,
  },
  {
    configure: {
      filter(option, path) {
        if (path.indexOf('physics') !== -1) {
          return true;
        }
        if (path.indexOf('smooth') !== -1 || option === 'smooth') {
          return true;
        }
        return false;
      },
      container: configContainer,
    },
    interaction: { hover: true },
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
const networkCanvas = graph.getElementsByTagName('canvas')[0];
function changeCursor(newCursorStyle) {
  networkCanvas.style.cursor = newCursorStyle;
}
changeCursor('grab'); // Default
network.on('hoverNode', () => {
  changeCursor('pointer');
});
network.on('blurNode', () => {
  changeCursor('grab');
});
network.on('hoverEdge', () => {
  changeCursor('pointer');
});
network.on('blurEdge', () => {
  changeCursor('grab');
});
network.on('dragStart', () => {
  changeCursor('grabbing');
  network.setOptions({ physics: { enabled: false } });
});
network.on('dragging', () => {
  changeCursor('grabbing');
});
network.on('dragEnd', () => {
  changeCursor('grab');
});

const hideModalOpeners = () => {
  targetModalOpener.forEach((element) => {
    // eslint-disable-next-line no-param-reassign
    element.style.display = 'none';
  });
};
const showModalOpeners = () => {
  targetModalOpener.forEach((element) => {
    // eslint-disable-next-line no-param-reassign
    element.style.display = 'block';
  });
};

let activeNode = null;
let setTargetEdge = null;
let selectingTargetNode = false;
const classifyActivity = async (params) => {
  if (!params.nodes.length && !params.edges.length) {
    writeTip.innerHTML = `Viewing as ${displayName}`;
    return;
  }

  const n = nodes.get(params.nodes).map((node) => ({
    id: node.id === userAccessToken ? displayName : node.id,
    type: node.id === userAccessToken ? 'User Account' : undefined,
    label: node.label,
    title: node.title,
    activityPrompt: node.activityPrompt,
  }));
  const e = edges.get(params.edges).map((edge) => ({
    id: edge.id,
    label: edge.label,
    from: edge.from,
    to: edge.to,
  }));
  const defaultNodeActivityPrompt = 'As an Data Security Auditor and Network Analyst, describe this network selection and potential usecases or a propper function in a short sentence:';
  const nodeActivityPrompt = activityPrompt || defaultNodeActivityPrompt;
  const activity = JSON.stringify({ n, e }, null, 2);
  const prependPrompt = n[0].activityPrompt ? n[0].activityPrompt : nodeActivityPrompt;
  const prompt = `Given this dataset of nodes and relations:\n\n###\n\n${activity}\n\n###\n\n${prependPrompt}`;

  writeTip.innerHTML = 'thinking...';
  beaconAnimation();
  // eslint-disable-next-line no-undef
  const data = await api.ai.prompt({ prompt });

  if (data) {
    greenLineAnimation();
    bottomBeaconAnimation();
    if (speechEnabled) {
      responsiveVoice.cancel();
      responsiveVoice.speak(data.response);
    }
    writeTip.innerHTML = `${data.response || ''}`;
  } else {
    writeTip.innerHTML = `Viewing as ${displayName}`;
  }
};

const networkInteractionAction = (params) => {
  classifyActivity(params);
  if (params.nodes.length === 1) {
    if (network.isCluster(params.nodes[0]) === true) {
      network.openCluster(params.nodes[0]);
    }

    const firstNode = nodes.get(params.nodes[0]);

    if (firstNode.size && firstNode.size > 20) {
      editTargetImage.style.display = 'block';
      sampleMenu.classList.add('yellow-glow');
    } else {
      editTargetImage.style.display = 'none';
      sampleMenu.classList.remove('yellow-glow');
    }
    // https://casualos.com/?inst=disciplinary-azure-goose&gridPortal=home
    if (firstNode && firstNode.label) {
      if (firstNode.slug) {
        runTargetNode.style.display = 'block';
        automationMenu.classList.add('red-glow');
      } else {
        runTargetNode.style.display = 'none';
        automationMenu.classList.remove('red-glow');
      }
      if (selectingTargetNode) {
        cancelNodeTarget.style.display = 'none';
        targetTooltip.style.display = 'none';
        selectingTargetNode = false;
        setTargetEdge.to = firstNode.id;
        edges.add(setTargetEdge);
        drawingEdges.add(setTargetEdge);

        localStorage.setItem('wiringEditorEdgeList', JSON.stringify(edges.get()));
        localStorage.setItem(
          'wiringEditorDrawingEdgeList',
          JSON.stringify(drawingEdges.get()),
        );
        showModalOpeners();
        graph.classList.remove('select-bkg');
      }
      graphOptionsMenu.style.display = 'flex';
      targetNode.style.display = 'flex';
      targetNode.innerHTML = nodes.get(params.nodes[0]).label;
      targetTooltip.style.display = 'flex';
      targetTooltip.innerHTML = 'Node Selected';
    }
    activeNode = firstNode;
  } else {
    editTargetImage.style.display = 'none';
    sampleMenu.classList.remove('yellow-glow');
    runTargetNode.style.display = 'none';
    automationMenu.classList.remove('red-glow');
    graphOptionsMenu.style.display = 'none';
    targetNode.style.display = 'none';
    cancelNodeTarget.style.display = 'none';
    targetTooltip.style.display = 'none';
    selectingTargetNode = false;
    graph.classList.remove('select-bkg');
    showModalOpeners();
    window.responsiveVoice.cancel();
  }
};

network.on('click', networkInteractionAction);

selectOutputNode.onclick = () => {
  selectingTargetNode = true;
  targetTooltip.style.display = 'flex';
  targetTooltip.innerHTML = 'Select Node to 🔌 OUTPUT TO';
  cancelNodeTarget.style.display = 'block';
  hideModalOpeners();
  graph.classList.add('select-bkg');

  setTargetEdge = {
    id: `${Math.ceil(Math.random() * 1000000)}`,
    label: '🔌 OUTPUTS_TO',
    title: 'OUTPUTS_TO',
    category: 'drawing',
    from: activeNode.id,
    font: { align: 'middle', size: 8 },
    width: 1,
    dashes: true,
    arrows: { to: { enabled: true, scaleFactor: 0.5 } },
  };
};

selectMessageNode.onclick = () => {
  selectingTargetNode = true;
  targetTooltip.style.display = 'flex';
  targetTooltip.innerHTML = 'Select Node to 💬 MESSAGE TO';
  cancelNodeTarget.style.display = 'block';
  hideModalOpeners();
  graph.classList.add('select-bkg');

  setTargetEdge = {
    id: `${Math.ceil(Math.random() * 1000000)}`,
    label: '💬 SENDS_MESSAGE_TO',
    title: 'SENDS_MESSAGE_TO',
    category: 'drawing',
    from: activeNode.id,
    dashes: true,
    font: { align: 'middle', size: 8 },
    width: 1,
    arrows: { to: { enabled: true, scaleFactor: 0.5 } },
  };
};

cancelNodeTarget.onclick = () => {
  selectingTargetNode = false;
  targetTooltip.style.display = 'none';
  cancelNodeTarget.style.display = 'none';
  showModalOpeners();
  graph.classList.remove('select-bkg');
};

// eslint-disable-next-line no-undef
withinArea.placeholder = `${displayName}'s Area`;
selectArea.onclick = () => {
  const areaName = withinArea.value;
  if (areaName && areaName.length) {
    const newNode = !nodes.get(`area-${areaName}`);

    const node = nodes.get(`area-${areaName}`) || {
      id: `area-${areaName}`,
      label: areaName,
      category: 'drawing',
      title: 'Area',
      color: '#aa0000',
      size: 8,
      font: {
        size: 10,
        color: '#000',
        face: 'arial',
        strokeWidth: 3,
        strokeColor: '#ffffff',
      },
    };

    const edge = {
      id: `${Math.ceil(Math.random() * 1000000)}`,
      label: '📍 WITHIN_AREA',
      category: 'drawing',
      from: activeNode.id,
      to: node.id,
      dashes: true,
      font: { align: 'middle', size: 8 },
      width: 1,
      arrows: { to: { enabled: true, scaleFactor: 0.5 } },
    };

    if (newNode) {
      nodes.add(node);
      drawingNodes.add(node);
    }
    network.focus(node.id, {
      scale: 1.4,
      animation: {
        duration: 300,
        easingFunction: 'easeInOutQuad',
      },
    });
    edges.add(edge);
    drawingEdges.add(edge);

    network.setSelection({ nodes: [node.id] });
    networkInteractionAction({ nodes: [node.id] });
    localStorage.setItem('wiringEditorNodeList', JSON.stringify(nodes.get()));
    localStorage.setItem('wiringEditorEdgeList', JSON.stringify(edges.get()));
    localStorage.setItem('wiringEditorDrawingNodeList', JSON.stringify(drawingNodes.get()));
    localStorage.setItem('wiringEditorDrawingEdgeList', JSON.stringify(drawingEdges.get()));
  }
};

// eslint-disable-next-line no-undef
withinFunction.placeholder = `${displayName}'s Function`;
selectFunction.onclick = () => {
  const functionName = withinFunction.value;
  if (functionName && functionName.length) {
    const newNode = !nodes.get(`function-${functionName}`);

    const node = nodes.get(`function-${functionName}`) || {
      id: `function-${functionName}`,
      label: functionName,
      title: 'Function',
      category: 'drawing',
      color: '#00ffff',
      size: 8,
      font: {
        size: 10,
        color: '#000',
        face: 'arial',
        strokeWidth: 3,
        strokeColor: '#ffffff',
      },
    };

    const edge = {
      id: `${Math.ceil(Math.random() * 1000000)}`,
      label: '💡 WITHIN_FUNCTION',
      category: 'drawing',
      from: activeNode.id,
      to: node.id,
      dashes: true,
      font: { align: 'middle', size: 8 },
      width: 1,
      arrows: { to: { enabled: true, scaleFactor: 0.5 } },
    };

    if (newNode) {
      nodes.add(node);
      drawingNodes.add(node);
    }

    network.focus(node.id, {
      scale: 1.4,
      animation: {
        duration: 300,
        easingFunction: 'easeInOutQuad',
      },
    });
    edges.add(edge);
    drawingEdges.add(edge);

    network.setSelection({ nodes: [node.id] });
    networkInteractionAction({ nodes: [node.id] });
    localStorage.setItem('wiringEditorNodeList', JSON.stringify(nodes.get()));
    localStorage.setItem('wiringEditorEdgeList', JSON.stringify(edges.get()));
    localStorage.setItem('wiringEditorDrawingNodeList', JSON.stringify(drawingNodes.get()));
    localStorage.setItem('wiringEditorDrawingEdgeList', JSON.stringify(drawingEdges.get()));
  }
};

// eslint-disable-next-line no-undef
withinRole.placeholder = `${displayName}'s Role`;
selectRole.onclick = () => {
  const roleName = withinRole.value;
  if (roleName && roleName.length) {
    const newNode = !nodes.get(`role-${roleName}`);

    const node = nodes.get(`role-${roleName}`) || {
      id: `role-${roleName}`,
      label: roleName,
      title: 'Role',
      category: 'drawing',
      color: '#505',
      size: 8,
      font: {
        size: 10,
        color: '#000',
        face: 'arial',
        strokeWidth: 3,
        strokeColor: '#ffffff',
      },
    };

    const edge = {
      id: `${Math.ceil(Math.random() * 1000000)}`,
      label: '👤 WITHIN_ROLE',
      category: 'drawing',
      from: activeNode.id,
      to: node.id,
      dashes: true,
      font: { align: 'middle', size: 8 },
      width: 1,
      arrows: { to: { enabled: true, scaleFactor: 0.5 } },
    };

    if (newNode) {
      nodes.add(node);
      drawingNodes.add(node);
    }

    network.focus(node.id, {
      scale: 1.4,
      animation: {
        duration: 300,
        easingFunction: 'easeInOutQuad',
      },
    });
    edges.add(edge);
    drawingEdges.add(edge);

    network.setSelection({ nodes: [node.id] });
    networkInteractionAction({ nodes: [node.id] });
    localStorage.setItem('wiringEditorNodeList', JSON.stringify(nodes.get()));
    localStorage.setItem('wiringEditorEdgeList', JSON.stringify(edges.get()));
    localStorage.setItem('wiringEditorDrawingNodeList', JSON.stringify(drawingNodes.get()));
    localStorage.setItem('wiringEditorDrawingEdgeList', JSON.stringify(drawingEdges.get()));
  }
};

// eslint-disable-next-line no-undef
triggerEvent.placeholder = `${displayName}'s Event`;
selectEvent.onclick = () => {
  const eventName = triggerEvent.value;
  if (eventName && eventName.length) {
    const newNode = !nodes.get(`event-${eventName}`);

    const node = nodes.get(`event-${eventName}`) || {
      id: `event-${eventName}`,
      label: eventName,
      title: 'Event',
      category: 'drawing',
      color: '#00aa00',
      size: 8,
      font: {
        size: 10,
        color: '#000',
        face: 'arial',
        strokeWidth: 3,
        strokeColor: '#ffffff',
      },
    };

    const edge = {
      id: `${Math.ceil(Math.random() * 1000000)}`,
      label: '💥 TRIGGERS_EVENT',
      category: 'drawing',
      from: activeNode.id,
      to: node.id,
      dashes: true,
      font: { align: 'middle', size: 8 },
      width: 1,
      arrows: { to: { enabled: true, scaleFactor: 0.5 } },
    };

    if (newNode) {
      nodes.add(node);
      drawingNodes.add(node);
    }

    network.focus(node.id, {
      scale: 1.4,
      animation: {
        duration: 300,
        easingFunction: 'easeInOutQuad',
      },
    });
    edges.add(edge);
    drawingEdges.add(edge);

    network.setSelection({ nodes: [node.id] });
    networkInteractionAction({ nodes: [node.id] });
    localStorage.setItem('wiringEditorNodeList', JSON.stringify(nodes.get()));
    localStorage.setItem('wiringEditorEdgeList', JSON.stringify(edges.get()));
    localStorage.setItem('wiringEditorDrawingNodeList', JSON.stringify(drawingNodes.get()));
    localStorage.setItem('wiringEditorDrawingEdgeList', JSON.stringify(drawingEdges.get()));
  }
};

const hideGraphOptions = () => {
  graphOptionsMenu.style.display = 'none';
  targetNode.style.display = 'none';
};

network.once('beforeDrawing', () => {
  // eslint-disable-next-line no-undef
  const hasUser = nodes.get(userAccessToken);
  if (hasUser) {
    // eslint-disable-next-line no-undef
    network.focus(userAccessToken, {
      scale: 1.2,
    });
  }
});
network.once('afterDrawing', () => {
  network.fit({
    animation: {
      duration: 1000,
      easingFunction: 'easeOutQuint',
    },
  });
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
  label: displayName,
  // eslint-disable-next-line no-undef
  image: userPictureUrl,
  size: 24,
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
    label: `🖊 ${record.name}`,
    title: `${record.id}`,
    slug: record.slug,
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
    title: `${record.id}`,
    category,
    color: '#ccc',
    size: 5,
    font: {
      size: 8,
      color: '#000',
      face: 'arial',
      strokeWidth: 3,
      strokeColor: '#ffffff',
    },
  }),
  problems: (record, category) => ({
    id: record.id,
    label: `🔥 ${record.event}`,
    title: `${record.id}`,
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
  tags: (record, label) => ({
    to: record.id,
    // eslint-disable-next-line no-undef
    from: record.entityId,
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

function clearGraph(addUser = false) {
  nodes.clear();
  edges.clear();
  drawingNodes.clear();
  drawingEdges.clear();
  localStorage.removeItem('buyLink');
  activityPrompt = null;
  localStorage.removeItem('activityPrompt');
  delete window.buyLink;
  if (!window.buyLink) purchaseOption.innerHTML = 'claim';

  if (addUser) {
    const node = userNode();
    nodes.add([node]);
    network.focus(node.id, {
      scale: 1.4,
      animation: {
        duration: 300,
        easingFunction: 'easeInOutQuad',
      },
    });
  }

  localStorage.setItem('wiringEditorNodeList', JSON.stringify(nodes.get()));
  localStorage.setItem('wiringEditorEdgeList', JSON.stringify(edges.get()));
  localStorage.setItem('wiringEditorDrawingNodeList', JSON.stringify(drawingNodes.get()));
  localStorage.setItem('wiringEditorDrawingEdgeList', JSON.stringify(drawingEdges.get()));
}

const populateDrawings = () => {
  nodes.add(drawingNodes.get());
  edges.add(drawingEdges.get());
};

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

  // eslint-disable-next-line no-undef
  const completionTags = await api.tag.getAll();
  sortByName(completionTags);

  clearGraph();

  populateGraph(completionTags, 'CREATED_COMPLETION', 'completions', '🖊 completions', true);
  populateDrawings();

  const nodeList = [];
  const edgeList = [];
  completionTags.forEach((tag) => {
    nodeList.push(nodeStyles.prompts({ id: tag.entityId, name: tag.entityName }, 'prompts'));
    edgeList.push(edgeStyles.tags(tag, 'PROMPT_FOR'));
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

  loading.style.display = 'none';
};

const loadPrompts = async () => {
  loading.style.display = 'block';

  // eslint-disable-next-line no-undef
  const completionsData = await api.entity.getAll();

  nodes.clear();
  edges.clear();

  populateGraph(completionsData, 'CREATED_PROMPT', 'prompts', '📓 prompts', true);
  populateDrawings();

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
  populateDrawings();

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

  // eslint-disable-next-line no-undef
  await api.tag.create({
    name,
    entityId: record.id,
  });

  loading.style.display = 'none';

  // eslint-disable-next-line no-alert
  alert('Tag Saved!');
};

const submitFunction = async () => {
  editor.setReadOnly(true);
  loading.style.display = 'block';

  const selectedText = editor.getSelectedText();
  let prompt = '';
  if (selectedText.length) {
    prompt = `${activityPrompt || ''}\n\n${selectedText}`;
  } else {
    prompt = `${activityPrompt || ''}\n\n${editor.getValue()}`;
  }

  beaconAnimation();
  // eslint-disable-next-line no-undef
  const data = await api.ai.prompt({ prompt });

  if (data) {
    greenLineAnimation();
    bottomBeaconAnimation();
    if (speechEnabled) {
      window.responsiveVoice.cancel();
      window.responsiveVoice.speak(data.response);
    }
    editor.setValue(`${editor.getValue()}${data.response || ''}`);
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
    beaconAnimation();
    greenLineAnimation();
    const mode = `ace/mode/${nextMode()}`;
    editor.getSession().setMode(mode);
    localStorage.setItem('wiringEditorSessionMode', mode);
  },
});

const runJavascript = () => {
  beaconAnimation();
  greenLineAnimation();
  const selectedText = editor.getSelectedText();
  const allText = editor.session.getValue();
  const value = selectedText.length ? selectedText : allText;
  if (!value) return;

  try {
    // eslint-disable-next-line no-new-func
    const evaluateValue = Function(`${value}`);
    const evaulationResponse = evaluateValue();
    if (evaulationResponse) {
      editor.setValue(`${editor.getValue()}\n\n${evaluateValue()}`);
    }
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error(error);
    // eslint-disable-next-line no-alert
    alert(`${error.message}`);
  }
};

editor.commands.addCommand({
  name: 'executeAsCode',
  bindKey: { win: 'Alt-Shift-Enter', mac: 'Option-Shift-Enter' },
  exec() {
    runJavascript();
  },
});

runCode.onclick = runJavascript;

editor.commands.addCommand({
  name: 'tabBetweenWriteAndEntity',
  bindKey: { win: 'Ctrl-Shift-E', mac: 'Command-Shift-E' },
  exec() {
    window.location.href = '/app/prompts';
  },
});

editor.commands.addCommand({
  name: 'detectCommandEnter',
  bindKey: { win: 'Ctrl-Enter', mac: 'Command-Enter' },
  exec() {
    submitFunction();
  },
});

const getPromptText = () => {
  const selectedText = editor.getSelectedText();
  const allText = editor.session.getValue();
  const text = selectedText.length ? selectedText : allText;
  return text;
};

const savePrompt = async (prompt) => {
  // eslint-disable-next-line no-alert
  const name = window.prompt('name:') || new Date().toDateString();
  saveAsPrompt.disabled = true;
  loading.style.display = 'block';
  editor.setReadOnly(true);

  // eslint-disable-next-line no-undef
  const success = await api.entity.create({
    name,
    prompt,
  });

  if (success) {
    saveAsPrompt.disabled = false;
    loading.style.display = 'none';
    editor.setReadOnly(false);
    // eslint-disable-next-line no-alert
    alert('saved OK!');
  } else {
    saveAsPrompt.disabled = false;
    loading.style.display = 'none';
    editor.setReadOnly(false);
  }
};

editor.commands.addCommand({
  name: 'savePromptAsEntity',
  bindKey: { win: 'Ctrl-Shift-S', mac: 'Command-Shift-S' },
  exec() {
    const prompt = getPromptText();
    // eslint-disable-next-line no-restricted-globals, no-alert
    if (!confirm('Save prompt?')) return;
    savePrompt(prompt);
  },
});

saveAsPrompt.onclick = () => {
  const prompt = getPromptText();
  // eslint-disable-next-line no-restricted-globals, no-alert
  if (!confirm('Save prompt?')) return;
  savePrompt(prompt);
};

const editorElement = document.getElementById('editor');
const showBothUX = () => {
  graph.style.display = 'block';
  graph.classList.remove('fullGraph');
  editorElement.style.display = 'block';
  editorElement.classList.remove('fullEditor');
  showConfig.style.display = 'block';
  if (speechEnabled) {
    window.responsiveVoice.cancel();
    window.responsiveVoice.speak('Showing both editor panels');
  }
};
const showGraphUX = () => {
  graph.style.display = 'block';
  graph.classList.add('fullGraph');
  editorElement.style.display = 'none';
  editorElement.classList.remove('fullEditor');
  configContainer.style.display = 'none';
  showConfig.style.display = 'none';
  if (speechEnabled) {
    window.responsiveVoice.cancel();
    window.responsiveVoice.speak('Showing network editor panel only');
  }
};
const showEditorUx = () => {
  editorElement.style.display = 'block';
  editorElement.classList.add('fullEditor');
  graph.style.display = 'none';
  graph.classList.remove('fullGraph');
  configContainer.style.display = 'none';
  showConfig.style.display = 'none';
  if (speechEnabled) {
    window.responsiveVoice.cancel();
    window.responsiveVoice.speak('Showing text editor panel only');
  }
};
viewBoth.onclick = showBothUX;
viewGraphOnly.onclick = showGraphUX;
viewEditorOnly.onclick = showEditorUx;

const stopSpeech = () => {
  window.responsiveVoice.cancel();
};

editor.commands.addCommand({
  name: 'showBothUX',
  bindKey: {
    win: window.addEventListener('keydown', (event) => {
      if (event.ctrlKey && event.keyCode === 49) {
        showBothUX();
      }
      if (event.keyCode === 27) {
        stopSpeech();
      }
    }),
    mac: 'Ctrl-1',
  },
  exec() {
    showBothUX();
    return false;
  },
});
editor.commands.addCommand({
  name: 'showGraphUX',
  bindKey: {
    win: window.addEventListener('keydown', (event) => {
      if (event.ctrlKey && event.keyCode === 50) {
        showGraphUX();
      }
    }),
    mac: 'Ctrl-2',
  },
  exec() {
    showGraphUX();
    return false;
  },
});
editor.commands.addCommand({
  name: 'showEditorUx',
  bindKey: {
    win: window.addEventListener('keydown', (event) => {
      if (event.ctrlKey && event.keyCode === 51) {
        showEditorUx();
      }
    }),
    mac: 'Ctrl-3',
  },
  exec() {
    showEditorUx();
    return false;
  },
});

let simulationActive = false;
simIndicator.innerHTML = simulationActive ? 'ON' : 'OFF';
simulation.style.pointerEvents = 'none';
const toggleSimulation = () => {
  if (simulationActive) {
    const url = prompt('leave blank to use\nhttps://casualos.com') || 'https://casualos.com';
    simulation.style.pointerEvents = 'all';
    simulation.src = url;
    simulation.style.display = 'block';
    simIndicator.innerHTML = simulationActive ? 'ON' : 'OFF';
    localStorage.setItem('iframes', JSON.stringify([url]));
    greenLineAnimation();
    bottomBeaconAnimation();
    if (speechEnabled) {
      window.responsiveVoice.cancel();
      window.responsiveVoice.speak('simulation is starting');
    }
  } else {
    simulation.style.pointerEvents = 'none';
    simulation.src = '';
    simulation.style.display = 'none';
    simIndicator.innerHTML = simulationActive ? 'ON' : 'OFF';
    greenLineAnimation();
    bottomBeaconAnimation();
    if (speechEnabled) {
      window.responsiveVoice.cancel();
      window.responsiveVoice.speak('stopped simulation');
    }
  }
};

const openSimulation = (url) => {
  simulationActive = true;
  simulation.style.pointerEvents = 'all';
  simulation.src = url;
  simulation.style.display = 'block';
  simIndicator.innerHTML = simulationActive ? 'ON' : 'OFF';
  localStorage.setItem('iframes', JSON.stringify([url]));
  bottomBeaconAnimation();
  greenLineAnimation();
  if (speechEnabled) {
    window.responsiveVoice.cancel();
    window.responsiveVoice.speak('simulation is starting');
  }
};

const closeSimulation = () => {
  simulationActive = false;
  simulation.style.pointerEvents = 'none';
  simulation.src = '';
  simulation.style.display = 'none';
  simIndicator.innerHTML = simulationActive ? 'ON' : 'OFF';
  if (speechEnabled) {
    window.responsiveVoice.cancel();
    window.responsiveVoice.speak('stopped simulation');
  }
};

loadExperience.onclick = () => {
  simulationActive = !simulationActive;
  toggleSimulation();
};

editor.commands.addCommand({
  name: 'openSimulationUrl',
  bindKey: { win: 'Ctrl-Shift-O', mac: 'Command-Shift-O' },
  exec() {
    const url = editor.getSelectedText();
    if (url) {
      openSimulation(url);
    } else {
      simulationActive = !simulationActive;
      toggleSimulation();
    }
  },
});

network.on('hold', (params, details) => {
  if (params.nodes && params.nodes.length) {
    const node = nodes.get(params.nodes)[0];

    if (node.url) {
      openSimulation(node.url);
    }
  } else {
    nodes.add([
      {
        shape: 'circularImage',
        // eslint-disable-next-line no-undef
        label: `${displayName}'s Node`,
        // eslint-disable-next-line no-undef
        image: userPictureUrl,
        size: 24,
        font: {
          size: 10,
          color: '#333',
          face: 'arial',
          strokeWidth: 3,
          strokeColor: '#ffffff',
        },
      },
    ]);

    localStorage.setItem('wiringEditorNodeList', JSON.stringify(nodes.get()));

    network.moveTo({
      position: { x: 0, y: 0 },
      scale: 2,
      animation: {
        duration: 300,
        easingFunction: 'easeInOutQuad',
      },
    });
  }
});

toPrompts.onclick = async () => {
  // eslint-disable-next-line no-alert, no-restricted-globals
  if (!confirm('Load Prompts?\n\n This will clear your current network')) return;
  hideGraphOptions();
  clearGraph();

  toPrompts.disabled = true;
  await loadPrompts();
  toPrompts.disabled = false;
};

toCompletions.onclick = async () => {
  // eslint-disable-next-line no-alert, no-restricted-globals
  if (!confirm('Load Completions?\n\n This will clear your current network')) return;
  hideGraphOptions();
  clearGraph();

  toCompletions.disabled = true;
  await loadCompletions();
  toCompletions.disabled = false;
};
toProblems.onclick = async () => {
  // eslint-disable-next-line no-alert, no-restricted-globals
  if (!confirm('Load Problems?\n\n This will clear your current network')) return;
  hideGraphOptions();
  clearGraph();

  toProblems.disabled = true;
  await loadErrors();
  toProblems.disabled = false;
};

showConfig.onclick = () => {
  const isShowing = configContainer.style.display === 'block';
  if (isShowing) {
    configContainer.style.display = 'none';
    return;
  }
  configContainer.style.display = 'block';
};

toggleSpeech.onclick = () => {
  responsiveVoice.cancel();
  speechEnabled = !speechEnabled;
  speechIndicator.innerHTML = speechEnabled ? 'ON' : 'OFF';
  localStorage.setItem('speechIndicatorMode', JSON.stringify(speechEnabled));
  if (speechEnabled) {
    window.responsiveVoice.cancel();
    window.responsiveVoice.speak(
      `Hello ${displayName}, I will say my responses to you now.  You can disable this at any time from the menu.`,
    );
  }
};

clearNetwork.onclick = () => {
  // eslint-disable-next-line no-restricted-globals, no-alert
  if (!confirm('Clear Sample?\n\n This will clear this sample')) return;
  clearGraph(true);
  editor.setValue('');
};

submit.onclick = () => {
  submitFunction();
};

const getOutputToEdgeByNode = (node) => edges.get().filter((e) => e.to === node.id && e.title === 'OUTPUTS_TO');

const renderTemplateText = async (node, list) => {
  const templateData = {};
  const renderedData = {};
  await Promise.all(
    list.map(async (item) => {
      // eslint-disable-next-line no-undef
      templateData[item.tag] = await api.entity.getTagByName(item.tag);
    }),
  );

  list.forEach((item) => {
    // eslint-disable-next-line no-undef
    renderedData[item.tag] = Mustache.render(templateData[item.tag], templateData);
    return renderedData[item.tag];
  });

  // eslint-disable-next-line no-undef
  const text = await api.entity.getTagByName(node.slug);
  // eslint-disable-next-line no-undef
  const renderedText = Mustache.render(text, renderedData);
  return renderedText;
};

runTargetNode.onclick = async () => {
  if (!activeNode.slug) return;
  const apiCallSlugList = [];
  const runEdge = {};

  graph.style.display = 'block';
  graph.classList.remove('fullGraph');
  editorElement.style.display = 'block';
  editorElement.classList.remove('fullEditor');
  showConfig.style.display = 'block';

  loading.style.display = 'block';
  runTargetNode.disabled = true;
  editor.setReadOnly(true);

  const outputToEdges = nodes
    .get()
    .map(getOutputToEdgeByNode)
    .filter((a) => a.length);

  const recur = (node) => {
    if (runEdge[node.id]) return;
    runEdge[node.id] = outputToEdges.filter((e) => {
      const hasEdges = e.filter((edge) => edge.to === node.id);
      return hasEdges.length;
    });

    const froms = runEdge[node.id].map((edgeList) => {
      const fromIds = edgeList.map((e) => e.from);
      const fromNodeList = nodes.get(fromIds);

      return fromNodeList;
    });

    froms.forEach((fromNodeList) => {
      fromNodeList.forEach(recur);
      fromNodeList.forEach((fromNode) => {
        apiCallSlugList.push({
          tag: fromNode.slug,
          templateId: node.id,
          templateTag: node.slug,
        });
      });
    });
  };

  recur(activeNode);
  const renderedText = await renderTemplateText(activeNode, apiCallSlugList);

  editor.setValue(`${editor.getValue()}\n\n${activeNode.label}\n\n${renderedText}`);
  selectResponse(renderedText);

  beaconAnimation();
  // eslint-disable-next-line no-undef
  const { response } = await api.ai.prompt({ prompt: renderedText });
  if (speechEnabled) {
    responsiveVoice.cancel();
    responsiveVoice.speak(response);
  }
  if (response) {
    bottomBeaconAnimation();
    greenLineAnimation();
  }
  editor.setValue(`${editor.getValue()}\n\n${activeNode.label} - Response\n${response}`);
  selectResponse(response);
  editor.setReadOnly(false);
  runTargetNode.disabled = false;
  loading.style.display = 'none';
};

editTargetImage.onclick = () => {
  // eslint-disable-next-line no-alert, no-restricted-globals
  if (!confirm('Edit Node image?')) return;
  // eslint-disable-next-line no-alert
  const url = prompt('image address:');
  if (url) {
    nodes.update([
      {
        id: activeNode.id,
        image: url,
      },
    ]);
    localStorage.setItem('wiringEditorNodeList', JSON.stringify(nodes.get()));
  }
};

downloadData.onclick = () => {
  const time = new Date().getTime();
  const data = {
    meta: {
      buyLink: localStorage.getItem('buyLink'),
      time,
      activityPrompt: localStorage.getItem('activityPrompt'),
      iframes: JSON.parse(localStorage.getItem('iframes')),
      displayName,
      version: '0.0.1',
    },
    nodes: nodes.get(),
    edges: edges.get(),
    prompt: editor.getValue(),
  };
  const dataStr = `data:text/json;charset=utf-8,${encodeURIComponent(JSON.stringify(data))}`;
  const dlAnchorElem = document.createElement('a');
  dlAnchorElem.setAttribute('href', dataStr);
  // eslint-disable-next-line no-undef
  dlAnchorElem.setAttribute('download', `${displayName}'s Sample ${time}.json`);
  dlAnchorElem.click();
  dlAnchorElem.remove();
  if (speechEnabled) {
    window.responsiveVoice.cancel();
    window.responsiveVoice.speak('Download complete');
  }
};

buyData.onclick = () => {
  if (window.buyLink) {
    // eslint-disable-next-line no-restricted-globals, no-alert
    if (!confirm('Purchase this sample?')) return;
    window.open(window.buyLink);
  } else {
    // eslint-disable-next-line no-restricted-globals, no-alert
    if (!confirm('Claim this sample?\n\n You will be asked to add a link for purchasing')) return;
    const url = prompt('Enter a valid URL for to allow someone to purchase this sample');

    if (url) {
      window.buyLink = url;
      localStorage.setItem('buyLink', url);
      purchaseOption.innerHTML = 'buy';
      // eslint-disable-next-line no-alert
      alert('This sample may now be purchased at the link you provided');
      if (speechEnabled) {
        responsiveVoice.cancel();
        responsiveVoice.speak('This sample is now available for purchase');
      }
    }
  }
};

setActivityPrompt.onclick = () => {
  const newPrompt = newActivityPrompt.value;
  activityPrompt = newPrompt;
  localStorage.setItem('activityPrompt', newPrompt);
  beaconAnimation();

  if (speechEnabled) {
    if (!activityPrompt) {
      responsiveVoice.cancel();
      responsiveVoice.speak('Okay, I will use this default reaction.');
    }
    responsiveVoice.cancel();
    responsiveVoice.speak(`Okay, I will consider this before reacting:\n\n${newPrompt}`);
  }
};

setNodeActivityPrompt.onclick = () => {
  const promptValue = setNodePromptValueInput.value;
  if (!promptValue) return;
  nodes.update([
    {
      id: activeNode.id,
      activityPrompt: promptValue,
    },
  ]);
  localStorage.setItem('wiringEditorNodeList', JSON.stringify(nodes.get()));
  beaconAnimation();

  if (speechEnabled) {
    responsiveVoice.cancel();
    responsiveVoice.speak('Okay, with this node, I will consider this prompt before reacting.');
  }
};

setNodeAttribute.onclick = () => {
  const propName = nodeAttributeNameInput.value;
  const propValue = nodeAttributeValueInput.value;
  const isValid = propName && propValue;
  if (!isValid) return;

  const [key, subKey] = propName.split('.');
  if (subKey) {
    if (!activeNode[key]) activeNode[key] = {};
    activeNode[key][subKey] = propValue;
  } else {
    activeNode[propName] = propValue;
  }
  nodes.update([activeNode]);
  localStorage.setItem('wiringEditorNodeList', JSON.stringify(nodes.get()));
  beaconAnimation();

  if (speechEnabled) {
    responsiveVoice.cancel();
    responsiveVoice.speak(
      'Okay, with this node, I will consider these attributes before reacting.',
    );
  }
};

deleteNode.onclick = () => {
  // eslint-disable-next-line no-restricted-globals, no-alert
  if (!confirm('Delete node?\n\n This action can not be undone!')) return;
  nodes.remove([activeNode]);
  localStorage.setItem('wiringEditorNodeList', JSON.stringify(nodes.get()));

  if (speechEnabled) {
    responsiveVoice.cancel();
    responsiveVoice.speak('Node removed.');
  }
};

importData.onclick = () => {
  const fileInputElem = document.createElement('input');
  fileInputElem.setAttribute('type', 'file');
  fileInputElem.onchange = () => {
    const fileList = fileInputElem.files;
    if (fileList.length && fileList[0].type !== 'application/json') return alert('Unsupported file type');

    // Create a FileReader
    const reader = new FileReader();

    // Set up an event handler that will be called when the file has been read
    reader.onload = (event) => {
      const contents = event.target.result;
      try {
        closeSimulation();
        const data = JSON.parse(contents);
        const message = `Import data from ${data.meta.displayName}?\n\n This will replace your current data!`;
        // eslint-disable-next-line no-restricted-globals, no-alert
        if (!confirm(message)) return;

        if (data.meta && data.meta.activityPrompt) {
          activityPrompt = data.meta.activityPrompt;
          localStorage.setItem('activityPrompt', data.meta.activityPrompt);
        }
        if (data.meta && data.meta.iframes) {
          window.simulationFrames = data.meta.iframes;
          localStorage.setItem('iframes', JSON.stringify(data.meta.iframes));
        }
        if (data.meta && data.meta.buyLink) {
          window.buyLink = data.meta.buyLink;
          purchaseOption.innerHTML = 'buy';
          localStorage.setItem('buyLink', data.meta.buyLink);
          if (speechEnabled) {
            window.responsiveVoice.cancel();
            window.responsiveVoice.speak('This sample is available for purchase');
          }
        } else {
          delete window.buyLink;
          if (!window.buyLink) purchaseOption.innerHTML = 'claim';
          localStorage.removeItem('buyLink');
          if (speechEnabled) {
            window.responsiveVoice.cancel();
            window.responsiveVoice.speak('This sample is not claimed by anyone');
          }
        }
        if (data.nodes) {
          nodes.clear();
          nodes.add(data.nodes);
          localStorage.setItem('wiringEditorNodeList', JSON.stringify(nodes.get()));
          if (speechEnabled) {
            responsiveVoice.cancel();
            responsiveVoice.speak(
              `${nodes.length} data point${nodes.length > 1 ? 's' : ''} added`,
            );
          }
        }
        if (data.edges) {
          edges.clear();
          edges.add(data.edges);
          localStorage.setItem('wiringEditorEdgeList', JSON.stringify(edges.get()));
        }
        if (data.prompt) {
          editor.setValue(data.prompt);
        }
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error(error);
        // eslint-disable-next-line no-alert
        alert(`Could not read file\n\n${error.message}`);
        if (speechEnabled) {
          responsiveVoice.cancel();
          responsiveVoice.speak('Sample file could not be opened');
        }
      }

      fileInputElem.remove();
    };

    // Read the file
    reader.readAsText(fileList[0]);
  };

  fileInputElem.click();
};

const homeCoords = [33.98054773154909, -84.00534408657629];
const panCoords = [
  homeCoords,
  [-1.0837137706305473, 35.873951895396544],
  [38.8974139704206, -77.03655507490033],
  [10.64570996704394, -61.5093273152886],
  [19.43564674326004, -99.14380150408337],
  [6.054847720102013, -67.45153197680379],
  [35.68226069744397, 139.7531958491934],
  [8.4787440301627, -13.200289649660585],
  [40.62984888914013, 14.483260250856471],
  [1.3556019918588564, 103.87347329593669],
  [30.12662754343121, 31.203049582043974],
  [31.005342, 47.440972],
  [48.858599, 2.293849],
];
// eslint-disable-next-line no-undef
const map = L.map('map', { zoomControl: false }).setView(homeCoords, 15);

// eslint-disable-next-line no-undef
L.tileLayer(mapBoxUrl, {
  attribution: '',
}).addTo(map);

let current = 0;
// eslint-disable-next-line no-unused-vars
const fadeInOutInterval = setInterval(() => {
  current += 1;
  if (current >= panCoords.length) {
    current = 0;
  }
  const nextCoord = panCoords[current];
  map.panTo(nextCoord);
}, 23000);

beaconAnimation(true);
bottomBeaconAnimation(true);
