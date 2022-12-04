class Cache {
  static all() {
    return Cache.network();
  }

  static network() {
    if (!nodes || !edges) return false;
    localStorage.setItem('wiringEditorNodeList', JSON.stringify(nodes.get()));
    localStorage.setItem('wiringEditorEdgeList', JSON.stringify(edges.get()));

    return { edges: edges.get().length, nodes: nodes.get().length };
  }
}
