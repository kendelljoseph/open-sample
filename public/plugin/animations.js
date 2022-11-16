const greenLineAnimation = () => {
  const greenLine = document.createElement('div');
  greenLine.style.width = '100%';
  greenLine.style.height = '1px';
  greenLine.style.backgroundColor = 'rgba(0,0,0,0)';
  greenLine.style.position = 'absolute';
  greenLine.style.top = '0px';
  greenLine.style.left = '0px';
  greenLine.style.pointerEvents = 'none';
  greenLine.style.transition = 'all 3.4s';
  greenLine.style.opacity = '1';
  greenLine.style.zIndex = '99999999';
  greenLine.style.boxShadow = '0 70px 50px 25px rgba(0, 0, 0, 0.15)';
  document.body.appendChild(greenLine);
  setTimeout(() => {
    greenLine.style.top = '100%';
    greenLine.style.height = '0px';
    greenLine.style.opacity = '0';
  }, 10);
};
